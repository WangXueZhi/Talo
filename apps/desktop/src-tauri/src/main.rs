#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    env, fs,
    io::{BufReader, Read},
    path::{Path, PathBuf},
    process::{Command, Output},
};
use tauri::{AppHandle, Manager};

const CODEX_URL: &str = "https://openai.com/codex/";
const CLAUDE_URL: &str = "https://claude.ai/download";
const ANTIGRAVITY_URL: &str = "https://antigravity.google/";
const UPDATE_MANIFEST_URL: &str =
    "https://github.com/WangXueZhi/Talo/releases/latest/download/talo-update.json";
const UPDATE_RELEASE_API_URL: &str = "https://api.github.com/repos/WangXueZhi/Talo/releases/latest";
const UPDATE_ASSET_PREFIX: &str = "https://github.com/WangXueZhi/Talo/releases/download/";
const MAX_REVIEW_IDS: usize = 100;

#[cfg(any(windows, test))]
fn windows_dos_path(path: &Path) -> PathBuf {
    let value = path.as_os_str().to_string_lossy();
    if let Some(value) = value.strip_prefix(r"\\?\UNC\") {
        return PathBuf::from(format!(r"\\{value}"));
    }
    if let Some(value) = value.strip_prefix(r"\\?\") {
        return PathBuf::from(value);
    }
    path.to_path_buf()
}

#[cfg(windows)]
fn cli_path(path: PathBuf) -> PathBuf {
    windows_dos_path(&path)
}

#[cfg(not(windows))]
fn cli_path(path: PathBuf) -> PathBuf {
    path
}

#[cfg(windows)]
fn background_command<S: AsRef<std::ffi::OsStr>>(program: S) -> Command {
    use std::os::windows::process::CommandExt;

    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    let mut command = Command::new(program);
    command.creation_flags(CREATE_NO_WINDOW);
    command
}

#[cfg(not(windows))]
fn background_command<S: AsRef<std::ffi::OsStr>>(program: S) -> Command {
    Command::new(program)
}

fn update_platform_key() -> Option<&'static str> {
    if cfg!(target_os = "macos") && cfg!(target_arch = "aarch64") {
        Some("darwin-aarch64")
    } else if cfg!(target_os = "macos") && cfg!(target_arch = "x86_64") {
        Some("darwin-x86_64")
    } else if cfg!(target_os = "windows") && cfg!(target_arch = "x86_64") {
        Some("windows-x86_64")
    } else {
        None
    }
}

fn run_curl(args: &[String]) -> Result<Vec<u8>, String> {
    let output = background_command("curl")
        .args([
            "--fail",
            "--location",
            "--silent",
            "--show-error",
            "--retry",
            "2",
        ])
        .args(args)
        .output()
        .map_err(|error| format!("Unable to start curl: {error}"))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if stderr.is_empty() {
            format!("Download failed with {}.", output.status)
        } else {
            stderr
        });
    }
    Ok(output.stdout)
}

fn parse_version(value: &str) -> Option<[u64; 3]> {
    let version = value.trim().trim_start_matches('v');
    let mut parts = version.split('.');
    Some([
        parts.next()?.parse().ok()?,
        parts.next()?.parse().ok()?,
        parts.next()?.split('-').next()?.parse().ok()?,
    ])
}

fn is_newer_version(current: &str, candidate: &str) -> bool {
    matches!((parse_version(current), parse_version(candidate)), (Some(left), Some(right)) if right > left)
}

fn validate_update_url(url: &str) -> Result<(), String> {
    if url.starts_with(UPDATE_ASSET_PREFIX) && !url.contains("..") {
        Ok(())
    } else {
        Err("The update URL is not a trusted Talo release URL.".into())
    }
}

fn validate_update_file_name(file_name: &str) -> Result<(), String> {
    if file_name.is_empty()
        || file_name.contains('/')
        || file_name.contains('\\')
        || file_name.contains("..")
    {
        Err("The update file name is invalid.".into())
    } else {
        Ok(())
    }
}

fn update_cache_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_cache_dir()
        .map(|directory| directory.join("updates"))
        .map_err(|error| error.to_string())
}

fn sha256_file(path: &Path) -> Result<String, String> {
    let file = fs::File::open(path).map_err(|error| error.to_string())?;
    let mut reader = BufReader::new(file);
    let mut digest = Sha256::new();
    let mut buffer = [0_u8; 1024 * 1024];
    loop {
        let count = reader
            .read(&mut buffer)
            .map_err(|error| error.to_string())?;
        if count == 0 {
            break;
        }
        digest.update(&buffer[..count]);
    }
    Ok(format!("{:x}", digest.finalize()))
}

fn runtime_root(app: &AppHandle) -> Result<PathBuf, String> {
    let mut candidates = Vec::new();
    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("resources/runtime"));
        candidates.push(resource_dir.join("runtime"));
    }
    candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/runtime"));
    candidates
        .into_iter()
        .find(|candidate| candidate.join("project-memory.mjs").is_file())
        .map(cli_path)
        .ok_or_else(|| "Talo desktop runtime is missing.".to_string())
}

fn node_binary() -> PathBuf {
    if let Some(explicit) = env::var_os("PROJECT_MEMORY_NODE") {
        return cli_path(PathBuf::from(explicit));
    }
    let executable_name = if cfg!(windows) {
        "project-memory-node.exe"
    } else {
        "project-memory-node"
    };
    if let Ok(current) = env::current_exe() {
        if let Some(parent) = current.parent() {
            let bundled = parent.join(executable_name);
            if bundled.is_file() {
                return cli_path(bundled);
            }
        }
    }
    let suffix = if cfg!(windows) { ".exe" } else { "" };
    let development = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(format!(
        "binaries/project-memory-node-{}{}",
        env!("PROJECT_MEMORY_TARGET_TRIPLE"),
        suffix
    ));
    if development.is_file() {
        return cli_path(development);
    }
    PathBuf::from(if cfg!(windows) { "node.exe" } else { "node" })
}

fn execute_cli(app: &AppHandle, args: &[String]) -> Result<Value, String> {
    let runtime = runtime_root(app)?;
    let cli = runtime.join("project-memory.mjs");
    let output = background_command(node_binary())
        .arg(&cli)
        .args(args)
        .current_dir(&runtime)
        .env(
            "PROJECT_MEMORY_CLI_SOURCE",
            runtime.join("project-memory.mjs"),
        )
        .env("PROJECT_MEMORY_BROWSER_SOURCE", runtime.join("browser"))
        .env(
            "PROJECT_MEMORY_SKILL_SOURCE",
            runtime.join("skills/project-memory"),
        )
        .output()
        .map_err(|error| format!("Unable to start the Talo runtime: {error}"))?;
    parse_cli_output(output)
}

fn parse_cli_output(output: Output) -> Result<Value, String> {
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        if let Ok(error) = serde_json::from_str::<Value>(&stderr) {
            return Err(error.to_string());
        }
        return Err(if stderr.is_empty() {
            format!("Talo command failed with {}.", output.status)
        } else {
            stderr
        });
    }
    serde_json::from_slice(&output.stdout)
        .map_err(|error| format!("Talo returned invalid JSON: {error}"))
}

fn marketplace_root(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(runtime_root(app)?.join("marketplace"))
}

fn cache_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_cache_dir()
        .map(|directory| directory.join("hub-v1.json"))
        .map_err(|error| error.to_string())
}

fn write_cache(path: &Path, value: &Value) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "Invalid cache path.".to_string())?;
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    let temporary = path.with_extension(format!("{}.tmp", std::process::id()));
    fs::write(
        &temporary,
        serde_json::to_vec(value).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    fs::rename(temporary, path).map_err(|error| error.to_string())
}

fn validate_review_id(value: &str, label: &str) -> Result<(), String> {
    if value.is_empty() || value.len() > 128 {
        return Err(format!("{label} must be between 1 and 128 characters."));
    }
    let mut characters = value.chars();
    if !characters
        .next()
        .is_some_and(|character| character.is_ascii_alphanumeric())
        || !characters.all(|character| {
            character.is_ascii_alphanumeric() || character == '-' || character == '_'
        })
    {
        return Err(format!("{label} contains unsupported characters."));
    }
    Ok(())
}

fn validate_review_ids(values: &[String], label: &str) -> Result<(), String> {
    if values.len() > MAX_REVIEW_IDS {
        return Err(format!("{label} contains too many identifiers."));
    }
    for value in values {
        validate_review_id(value, label)?;
    }
    Ok(())
}

fn build_commit_args(
    proposal_id: String,
    accepted_item_ids: Vec<String>,
    accepted_update_ids: Vec<String>,
    accepted_relation_ids: Vec<String>,
    refresh_sources: bool,
) -> Result<Vec<String>, String> {
    validate_review_id(&proposal_id, "Proposal id")?;
    validate_review_ids(&accepted_item_ids, "Accepted memory ids")?;
    validate_review_ids(&accepted_update_ids, "Accepted update ids")?;
    validate_review_ids(&accepted_relation_ids, "Accepted relation ids")?;
    if accepted_item_ids.is_empty()
        && accepted_update_ids.is_empty()
        && accepted_relation_ids.is_empty()
    {
        return Err("Select at least one proposal item to accept.".into());
    }
    let mut args = vec!["commit".into(), "--proposal-id".into(), proposal_id];
    for (flag, values) in [
        ("--accepted-item-ids", accepted_item_ids),
        ("--accepted-update-ids", accepted_update_ids),
        ("--accepted-relation-ids", accepted_relation_ids),
    ] {
        if !values.is_empty() {
            args.push(flag.into());
            args.push(values.join(","));
        }
    }
    if refresh_sources {
        args.push("--refresh-sources".into());
        args.push("true".into());
    }
    Ok(args)
}

fn pending_proposals_value(app: &AppHandle) -> Result<Value, String> {
    execute_cli(
        app,
        &["proposals".into(), "--status".into(), "pending".into()],
    )
}

fn refresh_hub_value(app: &AppHandle) -> Result<Value, String> {
    let value = execute_cli(app, &["desktop".into(), "hub".into()])?;
    write_cache(&cache_path(app)?, &value)?;
    Ok(value)
}

fn review_mutation_result(app: &AppHandle, proposal_result: Value) -> Result<Value, String> {
    let pending = pending_proposals_value(app)?;
    let pending_proposals = pending
        .get("proposals")
        .cloned()
        .unwrap_or_else(|| Value::Array(Vec::new()));
    let hub = refresh_hub_value(app)?;
    Ok(json!({
        "proposalResult": proposal_result,
        "pendingProposals": pending_proposals,
        "hub": hub,
    }))
}

#[tauri::command]
fn get_cached_hub(app: AppHandle) -> Result<Option<Value>, String> {
    let path = cache_path(&app)?;
    if !path.is_file() {
        return Ok(None);
    }
    let content = fs::read(path).map_err(|error| error.to_string())?;
    serde_json::from_slice(&content)
        .map(Some)
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn refresh_hub(app: AppHandle) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || refresh_hub_value(&app))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn get_pending_proposals(app: AppHandle) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || pending_proposals_value(&app))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn commit_proposal(
    app: AppHandle,
    proposal_id: String,
    accepted_item_ids: Vec<String>,
    accepted_update_ids: Vec<String>,
    accepted_relation_ids: Vec<String>,
    refresh_sources: Option<bool>,
) -> Result<Value, String> {
    let args = build_commit_args(
        proposal_id,
        accepted_item_ids,
        accepted_update_ids,
        accepted_relation_ids,
        refresh_sources.unwrap_or(false),
    )?;
    tauri::async_runtime::spawn_blocking(move || {
        let proposal_result = execute_cli(&app, &args)?;
        review_mutation_result(&app, proposal_result)
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn reject_proposal(app: AppHandle, proposal_id: String) -> Result<Value, String> {
    validate_review_id(&proposal_id, "Proposal id")?;
    tauri::async_runtime::spawn_blocking(move || {
        let proposal_result = execute_cli(
            &app,
            &["reject".into(), "--proposal-id".into(), proposal_id],
        )?;
        review_mutation_result(&app, proposal_result)
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn get_project_view(app: AppHandle, project_id: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || {
        execute_cli(
            &app,
            &[
                "desktop".into(),
                "project".into(),
                "--project-id".into(),
                project_id,
            ],
        )
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn register_platform_project(
    app: AppHandle,
    platform: String,
    project_path: String,
) -> Result<Value, String> {
    if platform != "codex" && platform != "claude" && platform != "antigravity" {
        return Err("Unsupported project platform.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        let value = execute_cli(
            &app,
            &[
                "desktop".into(),
                "register".into(),
                "--platform".into(),
                platform,
                "--path".into(),
                project_path,
            ],
        )?;
        write_cache(&cache_path(&app)?, &value)?;
        Ok(value)
    })
    .await
    .map_err(|error| error.to_string())?
}

fn scan_integration_values(app: &AppHandle) -> Result<Value, String> {
    execute_cli(
        app,
        &[
            "desktop".into(),
            "integrations".into(),
            "--marketplace-root".into(),
            marketplace_root(app)?.to_string_lossy().to_string(),
        ],
    )
}

#[tauri::command]
async fn scan_integrations(app: AppHandle) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || scan_integration_values(&app))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn install_integration(
    app: AppHandle,
    platform: String,
    migrate_external: bool,
) -> Result<Value, String> {
    if platform != "codex" && platform != "claude" && platform != "antigravity" {
        return Err("Unsupported integration platform.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        let mut args = vec![
            "integration".into(),
            "install".into(),
            platform,
            "--marketplace-root".into(),
            marketplace_root(&app)?.to_string_lossy().to_string(),
        ];
        if migrate_external {
            args.push("--migrate-external".into());
            args.push("true".into());
        }
        execute_cli(&app, &args)?;
        scan_integration_values(&app)
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn repair_integration(app: AppHandle, platform: String) -> Result<Value, String> {
    if platform != "codex" {
        return Err("Sandbox access repair is only required for Codex.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        execute_cli(&app, &["integration".into(), "repair".into(), platform])?;
        scan_integration_values(&app)
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn remove_integration(app: AppHandle, platform: String) -> Result<Value, String> {
    if platform != "codex" && platform != "claude" && platform != "antigravity" {
        return Err("Unsupported integration platform.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        execute_cli(
            &app,
            &[
                "integration".into(),
                "remove".into(),
                platform,
                "--marketplace-root".into(),
                marketplace_root(&app)?.to_string_lossy().to_string(),
            ],
        )?;
        scan_integration_values(&app)
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
fn open_download_page(platform: String) -> Result<(), String> {
    let url = match platform.as_str() {
        "codex" => CODEX_URL,
        "claude" => CLAUDE_URL,
        "antigravity" => ANTIGRAVITY_URL,
        _ => return Err("Unsupported integration platform.".into()),
    };
    let status = if cfg!(target_os = "macos") {
        Command::new("open").arg(url).status()
    } else if cfg!(windows) {
        Command::new("cmd").args(["/C", "start", "", url]).status()
    } else {
        Command::new("xdg-open").arg(url).status()
    }
    .map_err(|error| error.to_string())?;
    if status.success() {
        Ok(())
    } else {
        Err("Unable to open the download page.".into())
    }
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn check_for_update() -> Result<Value, String> {
    let current_version = env!("CARGO_PKG_VERSION");
    let Some(platform_key) = update_platform_key() else {
        return Ok(json!({
            "available": false,
            "currentVersion": current_version,
            "version": current_version,
            "notes": "",
            "pubDate": null,
            "downloadUrl": null,
            "sha256": null,
            "fileName": null,
        }));
    };
    let manifest_bytes = match run_curl(&[UPDATE_MANIFEST_URL.to_string()]) {
        Ok(bytes) => bytes,
        Err(manifest_error) => {
            return check_github_release_for_update(current_version, platform_key)
                .map_err(|release_error| format!("{manifest_error}; {release_error}"));
        }
    };
    let manifest: Value = serde_json::from_slice(&manifest_bytes)
        .map_err(|error| format!("The update manifest is invalid: {error}"))?;
    let version = manifest["version"]
        .as_str()
        .ok_or_else(|| "The update manifest has no version.".to_string())?;
    let platform = manifest["platforms"][platform_key]
        .as_object()
        .ok_or_else(|| format!("The update manifest has no {platform_key} artifact."))?;
    let download_url = platform["url"]
        .as_str()
        .ok_or_else(|| "The update manifest has no download URL.".to_string())?;
    let sha256 = platform["sha256"]
        .as_str()
        .ok_or_else(|| "The update manifest has no SHA-256 checksum.".to_string())?;
    let file_name = platform["fileName"]
        .as_str()
        .ok_or_else(|| "The update manifest has no file name.".to_string())?;
    validate_update_url(download_url)?;
    validate_update_file_name(file_name)?;
    if sha256.len() != 64
        || !sha256
            .chars()
            .all(|character| character.is_ascii_hexdigit())
    {
        return Err("The update manifest has an invalid SHA-256 checksum.".into());
    }
    Ok(update_value(
        current_version,
        version,
        manifest["notes"].as_str().unwrap_or_default(),
        manifest["pubDate"].as_str(),
        download_url,
        sha256,
        file_name,
    ))
}

fn update_value(
    current_version: &str,
    version: &str,
    notes: &str,
    pub_date: Option<&str>,
    download_url: &str,
    sha256: &str,
    file_name: &str,
) -> Value {
    json!({
        "available": is_newer_version(current_version, version),
        "currentVersion": current_version,
        "version": version,
        "notes": notes,
        "pubDate": pub_date,
        "downloadUrl": download_url,
        "sha256": sha256,
        "fileName": file_name,
    })
}

fn release_asset_name(version: &str, platform_key: &str) -> Option<String> {
    match platform_key {
        "darwin-aarch64" => Some(format!("talo-desktop-{version}-macos-aarch64.dmg")),
        "darwin-x86_64" => Some(format!("talo-desktop-{version}-macos-x64.dmg")),
        "windows-x86_64" => Some(format!("talo-desktop-{version}-windows-x64-setup.exe")),
        _ => None,
    }
}

fn release_checksum_asset_name(version: &str, platform_key: &str) -> Option<String> {
    match platform_key {
        "darwin-aarch64" => Some(format!("SHA256SUMS-{version}-darwin-arm64.txt")),
        "darwin-x86_64" => Some(format!("SHA256SUMS-{version}-darwin-x64.txt")),
        "windows-x86_64" => Some(format!("SHA256SUMS-{version}-win32-x64.txt")),
        _ => None,
    }
}

fn release_asset<'a>(assets: &'a [Value], file_name: &str) -> Result<&'a Value, String> {
    assets
        .iter()
        .find(|asset| asset["name"].as_str() == Some(file_name))
        .ok_or_else(|| format!("The latest release has no {file_name} asset."))
}

fn release_asset_url(asset: &Value) -> Result<&str, String> {
    let url = asset["browser_download_url"]
        .as_str()
        .ok_or_else(|| "The release asset has no download URL.".to_string())?;
    validate_update_url(url)?;
    Ok(url)
}

fn release_asset_sha256(
    asset: &Value,
    assets: &[Value],
    version: &str,
    platform_key: &str,
    file_name: &str,
) -> Result<String, String> {
    if let Some(digest) = asset["digest"].as_str() {
        let sha256 = digest.strip_prefix("sha256:").unwrap_or(digest);
        if sha256.len() == 64
            && sha256
                .chars()
                .all(|character| character.is_ascii_hexdigit())
        {
            return Ok(sha256.to_string());
        }
    }
    let checksum_name = release_checksum_asset_name(version, platform_key)
        .ok_or_else(|| "No checksum asset is defined for this platform.".to_string())?;
    let checksum_asset = release_asset(assets, &checksum_name)?;
    let checksum_url = release_asset_url(checksum_asset)?;
    let checksum_text = String::from_utf8(run_curl(&[checksum_url.to_string()])?)
        .map_err(|error| format!("The checksum asset is not valid UTF-8: {error}"))?;
    checksum_text
        .lines()
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            let digest = fields.next()?;
            let name = fields.next()?.trim_start_matches('*');
            (name == file_name).then(|| digest.to_string())
        })
        .find(|digest| {
            digest.len() == 64
                && digest
                    .chars()
                    .all(|character| character.is_ascii_hexdigit())
        })
        .ok_or_else(|| format!("The checksum asset has no SHA-256 for {file_name}."))
}

fn check_github_release_for_update(
    current_version: &str,
    platform_key: &str,
) -> Result<Value, String> {
    let response = run_curl(&[
        "--header".to_string(),
        "Accept: application/vnd.github+json".to_string(),
        "--header".to_string(),
        "User-Agent: Talo-desktop-updater".to_string(),
        UPDATE_RELEASE_API_URL.to_string(),
    ])?;
    let release: Value = serde_json::from_slice(&response)
        .map_err(|error| format!("The GitHub release response is invalid: {error}"))?;
    let version = release["tag_name"]
        .as_str()
        .ok_or_else(|| "The GitHub release has no tag.".to_string())?
        .trim_start_matches('v');
    let file_name = release_asset_name(version, platform_key)
        .ok_or_else(|| "This platform has no supported update asset.".to_string())?;
    let assets = release["assets"]
        .as_array()
        .ok_or_else(|| "The GitHub release has no assets.".to_string())?;
    let asset = release_asset(assets, &file_name)?;
    let download_url = release_asset_url(asset)?;
    let sha256 = release_asset_sha256(asset, assets, version, platform_key, &file_name)?;
    Ok(update_value(
        current_version,
        version,
        release["body"].as_str().unwrap_or_default(),
        release["published_at"].as_str(),
        download_url,
        &sha256,
        &file_name,
    ))
}

fn download_to_file(url: &str, path: &Path) -> Result<(), String> {
    let output = Command::new("curl")
        .args([
            "--fail",
            "--location",
            "--silent",
            "--show-error",
            "--retry",
            "2",
        ])
        .args(["--output", path.to_string_lossy().as_ref(), url])
        .output()
        .map_err(|error| format!("Unable to start curl: {error}"))?;
    if output.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Err(if stderr.is_empty() {
        format!("Download failed with {}.", output.status)
    } else {
        stderr
    })
}

#[tauri::command]
fn download_update(
    app: AppHandle,
    download_url: String,
    expected_sha256: String,
    file_name: String,
) -> Result<Value, String> {
    validate_update_url(&download_url)?;
    validate_update_file_name(&file_name)?;
    if expected_sha256.len() != 64
        || !expected_sha256
            .chars()
            .all(|character| character.is_ascii_hexdigit())
    {
        return Err("The update checksum is invalid.".into());
    }
    let cache_dir = update_cache_dir(&app)?;
    fs::create_dir_all(&cache_dir).map_err(|error| error.to_string())?;
    let target = cache_dir.join(&file_name);
    let temporary = cache_dir.join(format!(".{file_name}.{}.download", std::process::id()));
    let _ = fs::remove_file(&temporary);
    if let Err(error) = download_to_file(&download_url, &temporary) {
        let _ = fs::remove_file(&temporary);
        return Err(error);
    }
    let actual_sha256 = match sha256_file(&temporary) {
        Ok(value) => value,
        Err(error) => {
            let _ = fs::remove_file(&temporary);
            return Err(error);
        }
    };
    if !actual_sha256.eq_ignore_ascii_case(&expected_sha256) {
        let _ = fs::remove_file(&temporary);
        return Err("The downloaded update failed SHA-256 verification.".into());
    }
    let _ = fs::remove_file(&target);
    fs::rename(&temporary, &target).map_err(|error| error.to_string())?;
    Ok(json!({ "fileName": file_name, "path": target }))
}

#[tauri::command]
fn open_update_installer(app: AppHandle, file_name: String) -> Result<(), String> {
    validate_update_file_name(&file_name)?;
    let path = update_cache_dir(&app)?.join(file_name);
    if !path.is_file() {
        return Err("The update installer has not been downloaded.".into());
    }
    let status = if cfg!(target_os = "macos") {
        Command::new("open").arg(&path).status()
    } else if cfg!(windows) {
        Command::new("cmd")
            .args(["/C", "start", "", path.to_string_lossy().as_ref()])
            .status()
    } else {
        Command::new("xdg-open").arg(&path).status()
    }
    .map_err(|error| error.to_string())?;
    if status.success() {
        Ok(())
    } else {
        Err("Unable to open the update installer.".into())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_cached_hub,
            refresh_hub,
            get_pending_proposals,
            commit_proposal,
            reject_proposal,
            get_project_view,
            register_platform_project,
            scan_integrations,
            install_integration,
            repair_integration,
            remove_integration,
            open_download_page,
            get_app_version,
            check_for_update,
            download_update,
            open_update_installer
        ])
        .run(tauri::generate_context!())
        .expect("error while running Talo desktop");
}

#[cfg(test)]
mod tests {
    use super::{
        build_commit_args, is_newer_version, parse_cli_output, release_asset_name,
        release_asset_sha256, release_checksum_asset_name, validate_review_id,
        validate_update_file_name, validate_update_url, windows_dos_path,
    };
    use serde_json::json;
    use std::path::{Path, PathBuf};
    use std::process::{ExitStatus, Output};

    #[cfg(unix)]
    fn status(code: i32) -> ExitStatus {
        use std::os::unix::process::ExitStatusExt;
        ExitStatus::from_raw(code << 8)
    }

    #[test]
    #[cfg(unix)]
    fn parses_success_json() {
        let value = parse_cli_output(Output {
            status: status(0),
            stdout: br#"{"ok":true}"#.to_vec(),
            stderr: Vec::new(),
        })
        .expect("valid output");
        assert_eq!(value["ok"], true);
    }

    #[test]
    #[cfg(unix)]
    fn returns_structured_error() {
        let error = parse_cli_output(Output {
            status: status(1),
            stdout: Vec::new(),
            stderr: br#"{"code":"INVALID_INPUT","message":"bad"}"#.to_vec(),
        })
        .expect_err("failed command");
        assert!(error.contains("INVALID_INPUT"));
    }

    #[test]
    fn validates_review_identifiers() {
        assert!(validate_review_id("1b2e3d09-c4ae-4d0a-88e9-4f74bf413a82", "id").is_ok());
        assert!(validate_review_id("", "id").is_err());
        assert!(validate_review_id("--proposal-id", "id").is_err());
        assert!(validate_review_id("proposal/id", "id").is_err());
    }

    #[test]
    fn builds_fixed_commit_arguments() {
        let args = build_commit_args(
            "proposal-1".into(),
            vec!["memory-1".into(), "memory-2".into()],
            vec!["update-1".into()],
            vec!["relation-1".into()],
            false,
        )
        .expect("valid arguments");
        assert_eq!(
            args,
            vec![
                "commit",
                "--proposal-id",
                "proposal-1",
                "--accepted-item-ids",
                "memory-1,memory-2",
                "--accepted-update-ids",
                "update-1",
                "--accepted-relation-ids",
                "relation-1",
            ]
        );
    }

    #[test]
    fn rejects_empty_commit_selection() {
        let result = build_commit_args(
            "proposal-1".into(),
            Vec::new(),
            Vec::new(),
            Vec::new(),
            false,
        );
        assert!(result.is_err());
    }

    #[test]
    fn builds_refresh_source_commit_arguments() {
        let args = build_commit_args(
            "proposal-1".into(),
            vec!["memory-1".into()],
            Vec::new(),
            Vec::new(),
            true,
        )
        .expect("valid arguments");
        assert_eq!(
            args,
            vec![
                "commit",
                "--proposal-id",
                "proposal-1",
                "--accepted-item-ids",
                "memory-1",
                "--refresh-sources",
                "true",
            ]
        );
    }

    #[test]
    fn compares_release_versions() {
        assert!(is_newer_version("0.14.1", "0.15.0"));
        assert!(!is_newer_version("0.14.1", "0.14.1"));
        assert!(!is_newer_version("0.14.1", "0.14.0"));
    }

    #[test]
    fn validates_update_inputs() {
        assert!(validate_update_url(
            "https://github.com/WangXueZhi/Talo/releases/download/v0.15.0/talo.exe"
        )
        .is_ok());
        assert!(validate_update_url("https://example.com/talo.exe").is_err());
        assert!(validate_update_file_name("talo-desktop.exe").is_ok());
        assert!(validate_update_file_name("../talo-desktop.exe").is_err());
    }

    #[test]
    fn normalizes_windows_verbatim_paths_for_node() {
        assert_eq!(
            windows_dos_path(Path::new(r"\\?\F:\Talo\resources\runtime")),
            PathBuf::from(r"F:\Talo\resources\runtime")
        );
        assert_eq!(
            windows_dos_path(Path::new(r"\\?\UNC\server\share\runtime")),
            PathBuf::from(r"\\server\share\runtime")
        );
    }

    #[test]
    fn resolves_legacy_release_asset_names_and_digests() {
        assert_eq!(
            release_asset_name("0.14.1", "darwin-aarch64").as_deref(),
            Some("talo-desktop-0.14.1-macos-aarch64.dmg")
        );
        assert_eq!(
            release_checksum_asset_name("0.14.1", "windows-x86_64").as_deref(),
            Some("SHA256SUMS-0.14.1-win32-x64.txt")
        );
        let asset = json!({
            "name": "talo-desktop-0.14.1-windows-x64-setup.exe",
            "digest": format!("sha256:{}", "a".repeat(64)),
        });
        assert_eq!(
            release_asset_sha256(
                &asset,
                &[asset.clone()],
                "0.14.1",
                "windows-x86_64",
                "talo-desktop-0.14.1-windows-x64-setup.exe",
            )
            .expect("asset digest"),
            "a".repeat(64)
        );
    }
}

use serde_json::{json, Value};
use std::{
    env, fs,
    path::{Path, PathBuf},
    process::{Command, Output},
};
use tauri::{AppHandle, Manager};

const CODEX_URL: &str = "https://openai.com/codex/";
const CLAUDE_URL: &str = "https://claude.ai/download";
const ANTIGRAVITY_URL: &str = "https://antigravity.google/";
const MAX_REVIEW_IDS: usize = 100;

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
        .ok_or_else(|| "Talo desktop runtime is missing.".to_string())
}

fn node_binary() -> PathBuf {
    if let Some(explicit) = env::var_os("PROJECT_MEMORY_NODE") {
        return PathBuf::from(explicit);
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
                return bundled;
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
        return development;
    }
    PathBuf::from(if cfg!(windows) { "node.exe" } else { "node" })
}

fn execute_cli(app: &AppHandle, args: &[String]) -> Result<Value, String> {
    let runtime = runtime_root(app)?;
    let cli = runtime.join("project-memory.mjs");
    let output = Command::new(node_binary())
        .arg(cli)
        .args(args)
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
            open_download_page
        ])
        .run(tauri::generate_context!())
        .expect("error while running Talo desktop");
}

#[cfg(test)]
mod tests {
    use super::{build_commit_args, parse_cli_output, validate_review_id};
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
}

# First Public Release Checklist

[简体中文](releasing.zh-CN.md)

This checklist covers Talo's first public release and later tagged releases. The current release is
`v0.14.1`.

## Release identity

- Repository: `WangXueZhi/Talo`
- Website: `https://wangxuezhi.github.io/Talo/`
- First public tag: `v0.14.0`
- Public product name: `Talo`
- Compatibility IDs that remain unchanged: `codex-project-memory`, `project-memory`, existing
  environment variables, and existing storage paths

## Before tagging

1. Merge the release preparation PR into `main`.
2. Confirm CI passes on Ubuntu, macOS, and Windows for Node.js 22 and 24.
3. Confirm the macOS application and Windows NSIS build jobs pass.
4. Confirm GitHub Pages deploys from `main` and the website returns successfully.
5. Run `pnpm check` locally.
6. Run `pnpm reinstall:local` and verify Codex and Antigravity integrations report no issues.
7. Confirm both changelogs contain the final release date and notes.
8. Confirm `release/`, local screenshots, credentials, user paths, and private project names are not
   tracked.

## Create the release

```bash
git checkout main
git pull --ff-only origin main
git tag -a v0.14.1 -m "Talo 0.14.1"
git push origin v0.14.1
```

The tag starts `.github/workflows/release.yml`. It verifies the tag/version match and uploads:

- `talo-agent-skill-0.14.1.zip`
- `talo-codex-plugin-0.14.1.zip`
- `talo-desktop-0.14.1-macos-*.dmg`
- `talo-desktop-0.14.1-macos-*.zip`
- `talo-desktop-0.14.1-windows-x64-setup.exe`
- per-platform release manifests and SHA-256 files

Do not upload local `release/` contents manually unless the tagged workflow is unavailable and the
same source commit has been rebuilt and verified.

## After publishing

1. Open the GitHub Release and verify every asset is present and non-empty.
2. Install the macOS and Windows packages on clean user accounts or test machines.
3. Verify `talo --help`, Desktop launch, project detection, recall, proposal review, and offline Hub.
4. Verify the README, website, repository About URL, Privacy, Terms, Security, and Support links.
5. Keep release notes explicit about compatibility identifiers and local-only data handling.

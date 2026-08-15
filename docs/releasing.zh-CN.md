# 第一次公开发布清单

[English](releasing.md)

本清单用于 Talo 第一次公开正式发布，也可复用于后续 Tag Release。当前发布版本为
`v0.14.1`。

## 发布身份

- 仓库：`WangXueZhi/Talo`
- 官网：`https://wangxuezhi.github.io/Talo/`
- 第一次公开 Tag：`v0.14.0`
- 对外产品名：`Talo`
- 保持不变的兼容标识：`codex-project-memory`、`project-memory`、现有环境变量与存储路径

## 创建 Tag 前

1. 将发布准备 PR 合并到 `main`。
2. 确认 Node.js 22/24 在 Ubuntu、macOS、Windows 上的 CI 全绿。
3. 确认 macOS 应用与 Windows NSIS 构建通过。
4. 确认 GitHub Pages 已从 `main` 部署，官网可以正常访问。
5. 本地运行 `pnpm check`。
6. 运行 `pnpm reinstall:local`，确认 Codex 和 Antigravity 集成没有问题。
7. 确认中英文 CHANGELOG 已写入最终发布日期和说明。
8. 确认 `release/`、本地截图、凭据、用户路径和私人项目名没有进入 Git。

## 创建正式发布

```bash
git checkout main
git pull --ff-only origin main
git tag -a v0.14.1 -m "Talo 0.14.1"
git push origin v0.14.1
```

Tag 会启动 `.github/workflows/release.yml`。工作流校验 Tag 与版本号一致，并上传：

- `talo-agent-skill-0.14.1.zip`
- `talo-codex-plugin-0.14.1.zip`
- `talo-desktop-0.14.1-macos-*.dmg`
- `talo-desktop-0.14.1-macos-*.zip`
- `talo-desktop-0.14.1-windows-x64-setup.exe`
- 各平台 release manifest 与 SHA-256 文件
- `talo-update.json`（桌面应用启动检查使用的统一更新清单）

除非 Tag 工作流不可用，并且已经从同一源码提交重新构建和验证，否则不要手工上传本地
`release/` 目录中的文件。

## 发布后

1. 打开 GitHub Release，确认每个文件都存在且不为空。
2. 在干净用户或测试机器上安装 macOS 与 Windows 版本。
3. 验证 `talo --help`、Desktop 启动、项目识别、召回、Proposal 审核和离线 Hub。
4. 验证 README、官网、仓库 About URL、隐私、条款、安全和支持链接。
5. Release Note 中明确说明兼容标识和本地数据边界。

桌面应用不会静默替换自身。启动或设置页检查到新版本后，用户可以下载当前平台的 DMG/EXE；
下载完成后应用会校验清单中的 SHA-256 并打开安装器。SHA-256 只用于发现下载损坏，不等同于
操作系统代码签名。应用重新启动后，只会自动同步原本由桌面端托管且已经安装的平台集成。

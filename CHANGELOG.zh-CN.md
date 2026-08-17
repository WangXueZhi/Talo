# 更新日志

[English](CHANGELOG.md) | 简体中文

本文件记录项目的重要变化。

## 未发布

- 暂无未发布变更。

## 0.14.2 - 2026-08-17

- Windows 桌面应用及其内置 Node 运行时在启动和执行后端操作时不再弹出命令行窗口。
- 新增对 Codex Desktop 写入 Local AppData 的版本化 Codex CLI 的检测。
- 新增 Microsoft Store/AppX 版 Claude Desktop 检测；未安装 Claude Code CLI 时继续使用
  桌面应用直连集成流程。

## 0.14.1 - 2026-08-13

- GitHub Tag Release 新增标准 macOS DMG 安装包，同时保留便携式 `.app.zip` 下载。
- DMG 文件统一命名为 `talo-desktop-<版本>-macos-<架构>.dmg`，两种 macOS 格式都会写入
  Release Manifest 和 SHA-256 校验文件。
- 平台发布缺少 macOS DMG/应用 ZIP 组合或 Windows NSIS 安装包时，打包流程会直接失败。

## 0.14.0 - 2026-08-13

Talo 第一次公开正式发布。

- 对外产品与仓库统一命名为 **Talo**，同时保留 `codex-project-memory` 插件 ID、
  `project-memory` Skill 与 CLI 别名、存储路径和 Adapter Protocol v1 兼容性。
- 新增 Claude Code 端到端支持，包括 CLI、Desktop 用户级 marketplace 管理、会话项目发现、
  平台筛选和提交者元数据。
- 新增中英文产品官网、重新设计的双语 README、完整架构说明、GitHub Pages 部署和基于 Tag 的
  跨平台 GitHub Release 自动化。
- 新增本地重装工作流，代码改动完成后会重建桌面应用、原子覆盖现有应用并更新 Codex、
  Claude Code 与 Antigravity 集成。
- 新增“注意到”和“原因”两种有方向的正式关系，用于保存“任务或观察 → 发现 → 改动”的事件链。
- 同一 proposal 中属于同一工作单元的多个非资料事件必须全部参与至少一条候选关系，避免只保存
  最终改动而丢失前因。
- Codex 权限修复会安装稳定兼容启动器和窄范围规则；Desktop 托管权限覆盖 `writable_roots`
  时，当前任务仍可继续执行记忆命令。

- 新增 `integration install|status|remove antigravity`，可从 Codex 一次性安装、检查和安全卸载
  Antigravity 的全局自包含 Skill 与自动检测规则。
- 已注册项目在 Antigravity 中自动使用同一份共享记忆；未注册项目静默跳过，项目目录不写入
  `AGENTS.md`、`GEMINI.md` 或其他规则文件。
- 新增 Talo Desktop 原生应用，统一管理 Codex 与 Antigravity 的安装、更新、迁移、
  权限修复和卸载。
- Codex 集成安装时自动把实际记忆目录加入最小 `writable_roots`，保留配置备份；marketplace
  单独安装可用 `integration repair codex` 一键修复，不再要求用户手工排查沙箱。
- Desktop 在 Codex 插件检查失败时自动识别并备份修复可验证的异常本地 marketplace 路径，
  修复后立即重试，避免普通用户面对笼统的插件检查失败提示。
- `EPERM` 与 `EACCES` 现在返回结构化的记忆目录权限错误和修复命令。
- proposal 提交成功后自动重建当前项目的静态知识图谱，并在提交结果中返回 `viewRefresh`；
  pending proposal 继续只出现在待审核列表，不提前成为正式节点。

## 0.13.0 - 2026-07-30

- 将存储、召回、审核、时间线、关系和 HTML 拆分为平台无关的 `project-memory-core`。
- 新增 Codex、Claude Code、Antigravity 和通用 Agent Skill 薄适配器，共享同一份记忆与待审核列表。
- 新增全局离线记忆中心、`hub`、`story`、`open`、`shortcut`、`proposals`、`home` 和显式 `migrate-home`。
- 新安装默认使用 `~/.project-memory/v1`；只存在旧目录时继续原地使用，双目录不静默合并。
- 新增迁移备份与数量校验、项目锁、proposal revision、提交时来源/权限/重复内容复查和原子写入。
- Codex Stop Hook 只在真实待审核内容存在时显示一句中文提醒。

## 0.12.0 - 2026-07-22

- 默认入口改为中文“项目交接”：先展示现在最需要知道什么、从哪里开始、最近发生了什么和完整
  工作历程，再按需进入前因后果核验。
- MEMORY 升级为 v4。新的非背景工作记录可审核地保存发生时间、原因、动作、产出、当前结论，
  且产出文件必须指向已验证来源。
- v1-v3 继续直接可读，不自动改写；旧记录会明确显示尚未补全的工作过程，不编造项目故事。
- 图谱改称二级“前因后果”视图，并新增可按时间与主题筛选的“完整记录”。

## 0.11.0 - 2026-07-20

- 新增只读 `brief` 命令和项目记忆首页，按当前结论、已完成工作、风险和已确认下一步组织内容。
- 新增可审核的可选 `briefRole`；v1、v2 旧记忆使用不写回的确定性兜底，只有实际提交后才写成
  MEMORY v3。
- 合并重复推荐、隐藏单记忆主题、区分系统建议与已确认动作，并默认折叠来源技术细节。
- 将图谱降为二级“关系追溯”视图，用自然语言关系说明替代入边、出边等存储术语。
- 保持 JSON、Mermaid、图遍历、审核规则、离线 CSP、本地存储和 Token-aware 召回兼容。

## 0.10.0 - 2026-07-20

- 新增确定性、中英文友好的 `recall` 排序，返回紧凑候选，并使用审核通过的一层关系信号。
- 新增按预算执行的 `get` 深读；预算不足时整条省略，不截断记忆正文。
- 重要任务启动默认使用约 800 token 候选摘要和 1700 token 深读，同时保持 `load`、
  `search` 兼容。
- 新增过期、置信度和已授权链接项目排序控制，不引入 embeddings、持久化索引、查询日志或
  网络访问。
- 中英文文档将核心定位更新为私有、Token-aware 的项目记忆。
- 新增公共插件目录所需的展示元数据、品牌资源和产品截图。
- 新增中英文隐私政策、使用条款、支持和审核提交材料。
- 新增直接通过 GitHub marketplace 安装的说明。

## 0.9.0 - 2026-07-14

- 新增知识导览优先的离线知识工作台。
- 新增确定性、仅展示的关联线索。
- 新增知识概况、缺口、重点记忆和建议问题。
- 保留审核式正式关系、本地来源、CSP 和单文件离线 HTML。
- 保持纯 Skill 架构，不引入 MCP 服务器、SQLite、遥测或运行时网络访问。

## 0.8.0 - 2026-07-14

- 新增深色 Cytoscape/FCoSE 图谱探索器和响应式阅读工作台。

## 0.7.0 - 2026-07-14

- 使用 Preact、Cytoscape.js、Dagre 和 Lucide 重构离线浏览器。

## 0.6.0 - 2026-07-13

- 新增摘要、主题、多来源引用、Markdown 输出和离线 HTML 视图。

## 0.4.0 - 2026-07-13

- 新增审核式记忆关系和 JSON/Mermaid 图谱查询。

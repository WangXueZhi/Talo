<p align="center">
  <img src="site/assets/brand-mark.svg" width="88" alt="Talo 标志">
</p>

<h1 align="center">Talo</h1>

<p align="center"><strong>别再从头开始。</strong></p>

<p align="center">
  让 Codex、Claude Code、Antigravity 和其他本地 AI Agent<br>
  共享同一份经过审核、可追溯、私密且节省上下文的项目历史。
</p>

<p align="center">
  <a href="https://wangxuezhi.github.io/Talo/">产品官网</a> ·
  <a href="README.md">English</a> ·
  <a href="https://github.com/WangXueZhi/Talo/releases">下载</a> ·
  <a href="docs/architecture.zh-CN.md">架构说明</a>
</p>

<p align="center">
  <a href="https://github.com/WangXueZhi/Talo/actions/workflows/ci.yml"><img src="https://github.com/WangXueZhi/Talo/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-1f6f78.svg" alt="Apache-2.0 许可"></a>
  <img src="https://img.shields.io/badge/本地优先-是-14967f.svg" alt="本地优先">
  <img src="https://img.shields.io/badge/运行时联网-无-172238.svg" alt="运行时不联网">
</p>

![Talo 项目时间线](site/assets/talo-timeline.svg)

## Talo 改变了什么

每次开启新的 AI 任务，都可能重新解释架构、重找历史决定、打开证据文件，还要担心不同
Agent 混用项目背景。Talo 把已经完成的工作整理成一份经过审核的项目历史，让受支持的本地
Agent 共同使用。

| 没有 Talo | 使用 Talo |
| --- | --- |
| 每个任务都要重新介绍项目 | 只召回与当前目标有关的知识 |
| 只记住结论，却找不到依据 | 把原因、行动、产物、来源和结论放在同一工作单元中 |
| 记忆被锁在某一个 AI 产品里 | 通过轻量适配器共享平台无关的核心与存储 |
| 旧信息变化后仍被静默信任 | 独立校验每个引用文件、权限和哈希 |
| 历史越长越占上下文 | 先召回摘要候选，再按预算读取必要全文 |
| 记忆文件污染项目仓库 | 把私有记忆保存在项目和 Git 历史之外 |

## 三步开始

### 1. 构建 Talo

需要 Node.js 22.13+ 和 pnpm 10.30.2。

```bash
git clone https://github.com/WangXueZhi/Talo.git
cd Talo
pnpm install --frozen-lockfile
pnpm build
```

### 2. 安装平台集成

| 平台 | 推荐方式 | 安装内容 |
| --- | --- | --- |
| **Codex** | 把本仓库添加为 Codex marketplace，再安装插件 | Skill、CLI、审核流程和最小沙箱权限 |
| **Claude Code** | 使用 Talo Desktop 或 `talo integration install claude` | 本地 marketplace 插件或受管用户级 Skill |
| **Antigravity** | 执行 `talo integration install antigravity` | 自包含全局 Skill 和受管激活规则 |
| **其他本地 Agent** | 从 Releases 下载通用 Agent Skill | Skill、CLI、浏览器资源和规则片段 |

Codex marketplace 安装命令：

```bash
codex plugin marketplace add WangXueZhi/Talo --ref main
codex plugin add codex-project-memory@codex-project-memory
```

### 3. 召回、工作、审核

```bash
talo detect --path "$PWD"
talo recall --path "$PWD" --query "本次任务目标"
talo get --path "$PWD" --memory-ids ID,ID
talo story --path "$PWD"
```

重要工作结束时，Agent 会提出值得长期保留的结论、流程、风险、证据和下一步。只有经过审核，
候选内容才会进入正式记忆。

## 一份历史，多种视图

<table>
  <tr>
    <td width="50%"><img src="site/assets/talo-review.svg" alt="Talo 审核中心"></td>
    <td width="50%"><img src="site/assets/talo-integrations.svg" alt="Talo 平台集成"></td>
  </tr>
</table>

- **先看项目时间线。** 直接理解为什么做、做了什么、用了哪些证据、产出了什么，以及接下来做什么。
- **需要时再追因果。** 审核后的 `observes`、`causes`、`supports`、`depends_on` 等关系保留从发现到决定的链路。
- **统一审核入口。** 所有平台都可以提出候选，正式记忆只在审核后写入。
- **不用询问 AI 也能查看。** Talo Desktop 和离线记忆中心可以直接浏览所有已注册项目，不把历史加载进当前任务。

## 节省上下文的精确召回

Talo 不会把全部历史塞进上下文窗口。默认启动流程是：

1. 用大约 **800 个估算 token** 返回精简候选；
2. 按项目范围、词法相关度、来源新鲜度、置信度和已审核一跳关系推荐内容；
3. 用大约 **1700 个估算 token** 深读选中的记忆。

这些数字是与模型无关的规划估算，不是计费 token，也不是模型 tokenizer 的精确结果。

## 从设计上保护隐私

- 只使用本地 Markdown、JSON 和单文件 HTML。
- 没有云同步、MCP Server、SQLite、向量嵌入、遥测或运行时网络访问。
- 严格隔离项目；跨项目读取必须显式创建单向、只读链接。
- 默认拒绝凭据、私钥、`.env` 和常见敏感路径。
- 查询文本不会写入记忆、proposal 或审计日志。
- 生成的 HTML 使用严格 CSP，不加载外部资源。

新安装默认使用 `~/.project-memory/v1`。只有旧目录时可继续使用
`~/.codex/project-memory/v1`；两个目录同时存在时，Talo 不会静默合并。

```bash
talo home
talo home select --path ~/.project-memory/v1
talo migrate-home --from ~/.codex/project-memory/v1 --to ~/.project-memory/v1
```

## Talo Desktop

Tauri 桌面应用提供原生审核中心、项目中心、平台安装、更新、迁移、沙箱修复和卸载操作。
界面支持简体中文和英文、跟随系统/浅色/深色外观、macOS 和 64 位 Windows 10/11。

```bash
pnpm desktop:dev
pnpm desktop:build
```

安装包和通用 Agent Skill 压缩包发布在
[GitHub Releases](https://github.com/WangXueZhi/Talo/releases)。

## 命令速查

```text
detect / register / status     识别并管理项目
recall / get / search / load   按预算读取项目上下文
brief / story / guide          查看现状与完整工作时间线
relations / graph / path       追溯已审核的因果关系
propose / commit / reject      审核长期记忆变更
hub / open / shortcut          离线浏览所有已注册项目
integration / home             管理平台集成与存储目录
```

Adapter Protocol v1 与原有 project-memory 命令保持兼容。迁移期间同时提供 `talo` 和
`project-memory` 两个启动器。

对外产品与仓库名称统一为 **Talo**。Codex 插件 ID `codex-project-memory`、Skill 名称
`project-memory`、旧 CLI 别名和现有存储路径继续保留，确保已有安装无需迁移即可升级。

## 开发验证

```bash
pnpm check
pnpm test:visual
```

- [中文架构说明](docs/architecture.zh-CN.md)
- [提交与审核说明](docs/submission.zh-CN.md)
- [首次发布清单](docs/releasing.zh-CN.md)
- [安全说明](SECURITY.md)
- [隐私说明](PRIVACY.md)
- [支持](SUPPORT.zh-CN.md)
- [更新记录](CHANGELOG.zh-CN.md)

## 许可

Apache-2.0

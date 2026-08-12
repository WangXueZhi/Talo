import { createHash } from "node:crypto";
import type { MemoryHub } from "./types.js";

function text(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("base64");
}

const css = `
:root{color-scheme:dark;--void:#080b12;--stage:#0c111b;--panel:#111827;--panel-raised:#151f30;--panel-soft:rgba(21,31,48,.72);--ink:#eef4ff;--ink-soft:#c7d3e4;--muted:#8190a7;--muted-bright:#aebbd0;--line:#253149;--line-soft:rgba(148,163,184,.14);--cyan:#71e5fb;--cyan-deep:#39cce8;--blue:#8dc8ff;--green:#62e5b1;--amber:#f7bd68;--red:#ff9bac;--purple:#c6a1ff;--shadow:0 18px 48px rgba(0,0,0,.24);--sans:"Avenir Next","PingFang SC","Microsoft YaHei",sans-serif;--mono:"SF Mono","Cascadia Code","Roboto Mono",ui-monospace,monospace}
*{box-sizing:border-box}html{background:var(--void)}body{margin:0;min-width:320px;background:radial-gradient(circle at 75% -12%,#172554 0,transparent 32%),var(--void);color:var(--ink);font-family:var(--sans);line-height:1.55}.shell{min-height:100vh}.masthead{position:relative;isolation:isolate;overflow:hidden;padding:30px clamp(22px,5vw,72px) 34px;background:linear-gradient(135deg,rgba(15,25,43,.97),rgba(8,12,21,.98));border-bottom:1px solid #263a54;box-shadow:0 16px 48px rgba(0,0,0,.18)}.masthead:before{content:"";position:absolute;z-index:-1;inset:-30% -10% auto auto;width:560px;height:420px;background:radial-gradient(circle,rgba(57,204,232,.17),transparent 68%);pointer-events:none}.masthead:after{content:"";position:absolute;z-index:-1;right:0;bottom:0;left:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan-deep),transparent);opacity:.8}.masthead-inner{max-width:1440px;margin:0 auto}.masthead-top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:38px}.brand{display:flex;align-items:center;gap:12px}.brand-mark{width:40px;height:40px;display:grid;place-items:center;border:1px solid #2b6076;border-radius:12px;background:linear-gradient(145deg,#12304a,#12172b);color:var(--cyan);box-shadow:0 10px 26px rgba(0,0,0,.2)}.brand-copy{display:grid;gap:2px}.brand-copy strong{font-size:15px}.brand-copy span{color:var(--muted);font:10px var(--mono)}.masthead-status{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid #263c56;border-radius:999px;background:rgba(17,29,47,.7);color:var(--muted-bright);font:10px var(--mono)}.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 12px rgba(98,229,177,.75)}.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:36px;align-items:end}.eyebrow{display:flex;align-items:center;gap:8px;margin:0 0 11px;color:var(--cyan);font:10px var(--mono);letter-spacing:.1em;text-transform:uppercase}.eyebrow:before{content:"";width:18px;height:1px;background:var(--cyan)}.masthead h1{max-width:800px;margin:0;color:#f7fbff;font-size:clamp(34px,5vw,58px);font-weight:650;letter-spacing:-.05em;line-height:1.08}.masthead .hero-copy{max-width:780px;margin:17px 0 0;color:var(--muted-bright);font-size:15px;line-height:1.8}.hero-aside{display:grid;min-width:220px;gap:12px}.hero-link{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;border:0;border-bottom:1px solid var(--line-soft);background:transparent;color:var(--ink-soft);font-size:12px;text-decoration:none}.hero-link:hover{padding-left:5px;color:var(--cyan)}.hero-link span{color:var(--muted);font:9px var(--mono)}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin-top:34px;border:1px solid var(--line);background:var(--line)}.metric{display:grid;gap:5px;min-width:0;padding:16px 17px;background:rgba(10,16,28,.88)}.metric strong{color:var(--cyan);font:650 26px/1 var(--mono)}.metric span{color:var(--muted);font:10px var(--mono)}.metric:nth-child(3) strong{color:var(--amber)}.metric:nth-child(4) strong{color:var(--red)}.toolbar{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:minmax(260px,1fr) auto minmax(0,auto) auto;gap:10px;align-items:center;padding:12px clamp(22px,5vw,72px);background:rgba(8,11,18,.88);border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}.search{width:100%;min-width:180px;height:42px;border:1px solid var(--line);border-radius:11px;background:#0e1421;padding:0 14px;color:var(--ink);font:13px var(--sans);outline:none}.search::placeholder{color:#66758c}.search:focus,.sort:focus{border-color:var(--cyan-deep);box-shadow:0 0 0 3px rgba(57,204,232,.12)}.sort{height:42px;border:1px solid var(--line);border-radius:11px;background:#0e1421;padding:0 12px;color:var(--ink-soft);font:11px var(--mono);outline:none}.filters{display:flex;gap:4px;padding:4px;border:1px solid var(--line);border-radius:12px;background:#0e1421}.filter{border:0;border-radius:8px;background:transparent;padding:7px 10px;color:var(--muted);font:11px var(--sans);cursor:pointer;white-space:nowrap}.filter:hover,.filter[aria-pressed=true]{background:#1b2a40;color:#eef7ff}.filter[aria-pressed=true]{box-shadow:inset 0 0 0 1px rgba(113,229,251,.2)}.content{padding:36px clamp(22px,5vw,72px) 70px}.section{max-width:1440px;margin:0 auto 42px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px;padding:0 2px}.section h2{margin:0;color:#f3f7ff;font-size:22px;letter-spacing:-.025em}.section-head:after{content:"";order:-1;width:3px;height:22px;border-radius:99px;background:var(--cyan-deep);box-shadow:0 0 14px rgba(57,204,232,.4)}.section-note{color:var(--muted);font:10px var(--mono);text-align:right}.project-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}.project{position:relative;display:flex;flex-direction:column;min-height:286px;padding:18px;border:1px solid #263149;border-radius:14px;background:linear-gradient(145deg,rgba(20,28,44,.96),rgba(12,18,30,.96));box-shadow:var(--shadow);text-decoration:none;color:inherit;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.project:before{content:"";position:absolute;top:0;right:18px;left:18px;height:1px;background:linear-gradient(90deg,transparent,rgba(113,229,251,.36),transparent)}.project:hover,.project:focus-visible{transform:translateY(-3px);border-color:#395975;box-shadow:0 20px 42px rgba(0,0,0,.32);outline:none}.project-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.project h3{margin:0;color:#f1f6ff;font-size:17px;line-height:1.35}.date{white-space:nowrap;color:var(--muted);font:10px var(--mono)}.overview{display:-webkit-box;overflow:hidden;min-height:44px;margin:10px 0 18px;color:#8d9bb0;font-size:12px;line-height:1.7;-webkit-box-orient:vertical;-webkit-line-clamp:2}.facts{display:grid;gap:8px;margin-top:auto}.fact{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;padding:8px 10px;border:1px solid rgba(38,49,73,.8);border-radius:9px;background:rgba(8,13,23,.5);font-size:11px}.fact b{color:#68778e;font:10px var(--mono)}.fact span{min-width:0;overflow:hidden;color:#cbd8e9;text-overflow:ellipsis;white-space:nowrap}.pending-note{margin:13px 0 0;padding:10px 11px;border:1px solid rgba(247,189,104,.2);border-radius:9px;background:rgba(76,48,18,.16);color:var(--amber);font-size:11px;line-height:1.55}.badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:14px}.badge{padding:4px 8px;border:1px solid #273850;border-radius:999px;background:#111c2c;color:#91a2b9;font:10px var(--mono)}.badge.risk{border-color:#5f2734;background:#29151b;color:var(--red)}.badge.pending{border-color:#654821;background:#2a2115;color:var(--amber)}.badge.ok{border-color:#245169;background:#112b40;color:var(--cyan)}.empty{padding:32px;border:1px dashed #33445d;border-radius:14px;color:var(--muted);text-align:center}.footer{max-width:1440px;margin:0 auto;padding-top:20px;border-top:1px solid var(--line-soft);color:#5f6b81;font:10px var(--mono)}.hidden{display:none!important}@media(max-width:980px){.toolbar{grid-template-columns:minmax(0,1fr) auto}.filters{grid-column:1/-1;overflow-x:auto}.filter{white-space:nowrap}.hero-grid{grid-template-columns:1fr}.hero-aside{grid-template-columns:repeat(2,minmax(0,1fr))}.summary{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.masthead{padding-top:24px}.masthead-top{margin-bottom:28px}.masthead-status{font-size:9px}.toolbar{align-items:stretch;grid-template-columns:1fr;padding-top:10px;padding-bottom:10px}.sort{width:100%}.filters{grid-column:auto;overflow-x:auto;flex-wrap:nowrap}.content{padding-top:28px}.project-grid{grid-template-columns:1fr}.summary{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:26px}.metric{padding:13px}.hero-aside{grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column;gap:6px}.section-note{text-align:left}}
.project-title{min-width:0;display:flex;align-items:center;gap:9px}.project-glyph{width:25px;height:25px;display:grid;place-items:center;flex:0 0 25px;border:1px solid #2b6076;border-radius:8px;background:#112b40;color:var(--cyan);font:16px/1 var(--mono)}#recent,#projects{scroll-margin-top:90px}
`;

const script = `(()=>{const search=document.getElementById('search');const sort=document.getElementById('sort');const buttons=[...document.querySelectorAll('[data-filter]')];let filter='all';function norm(v){return String(v||'').toLocaleLowerCase()}function reorder(){document.querySelectorAll('[data-grid]').forEach(grid=>{[...grid.children].sort((a,b)=>sort.value==='name'?a.dataset.name.localeCompare(b.dataset.name,'zh-CN'):(b.dataset.date||'').localeCompare(a.dataset.date||'')||a.dataset.name.localeCompare(b.dataset.name,'zh-CN')).forEach(el=>grid.appendChild(el))})}function apply(){const query=norm(search.value).trim();const names=new Set;document.querySelectorAll('[data-project]').forEach(el=>{const attention=el.dataset.attention==='true';const pending=el.dataset.pending==='true';const stale=el.dataset.stale==='true';const risk=el.dataset.risk==='true';const matches=filter==='all'||filter==='attention'&&attention||filter==='pending'&&pending||filter==='stale'&&stale||filter==='risk'&&risk;const show=matches&&(!query||norm(el.dataset.search).includes(query));el.classList.toggle('hidden',!show);if(show)names.add(el.dataset.name)});document.getElementById('empty').classList.toggle('hidden',names.size!==0);document.getElementById('result-count').textContent=names.size+' 个项目'}search.addEventListener('input',apply);sort.addEventListener('change',()=>{reorder();apply()});buttons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));apply()}));reorder();apply()})();`;

function date(value: string | null): string {
  if (!value) return "暂无记录";
  return value.slice(0, 10);
}

function projectCard(project: MemoryHub["projects"][number]): string {
  const search = [
    project.name,
    project.overview,
    project.latestActivityTitle,
    project.latestConclusion?.title,
    project.latestConclusion?.summary,
    project.nextStep?.title,
    project.risk?.title,
    project.searchText,
  ]
    .filter(Boolean)
    .join(" ");
  const badges = [
    project.pendingProposalCount > 0
      ? `<span class="badge pending">${project.pendingProposalCount} 项待审核</span>`
      : "",
    project.staleCitationCount > 0
      ? `<span class="badge risk">${project.staleCitationCount} 个来源需核对</span>`
      : "",
    project.pendingProposalCount === 0 && project.staleCitationCount === 0
      ? '<span class="badge ok">记录状态正常</span>'
      : "",
  ].join("");
  const platformNames: Record<string, string> = {
    codex: "Codex",
    claude: "Claude",
    antigravity: "Antigravity",
    generic: "其他 AI",
    legacy: "旧版本",
  };
  const pending =
    project.pendingProposals.length > 0
      ? `<p class="pending-note">待审核来自 ${project.pendingProposals.map((proposal) => text(platformNames[proposal.platform] ?? proposal.platform)).join("、")}：${text(
          project.pendingProposals
            .flatMap((proposal) => proposal.summaries)
            .slice(0, 3)
            .join("；"),
        )}</p>`
      : "";
  return `<a class="project" data-project data-name="${text(project.name)}" data-date="${text(project.latestActivityAt ?? "")}" data-attention="${project.needsAttention}" data-risk="${Boolean(project.risk)}" data-pending="${project.pendingProposalCount > 0}" data-stale="${project.staleCitationCount > 0}" data-search="${text(search)}" href="${text(project.storyPath)}">
    <div class="project-top"><div class="project-title"><span class="project-glyph" aria-hidden="true">⌁</span><h3>${text(project.name)}</h3></div><span class="date">${date(project.latestActivityAt)}</span></div>
    <p class="overview">${text(project.overview)}</p>
    <div class="facts">
      <div class="fact"><b>最近做了</b><span>${text(project.latestActivityTitle ?? "暂无已保存的工作记录")}</span></div>
      <div class="fact"><b>当前结论</b><span>${text(project.latestConclusion?.title ?? "暂无已确认结论")}</span></div>
      <div class="fact"><b>下一步</b><span>${text(project.nextStep?.title ?? "暂无已确认下一步")}</span></div>
      <div class="fact"><b>风险</b><span>${text(project.risk?.title ?? "暂无已记录风险")}</span></div>
    </div>
    ${pending}
    <div class="badges">${badges}</div>
  </a>`;
}

function section(title: string, note: string, projects: MemoryHub["projects"]): string {
  if (projects.length === 0) return "";
  return `<section class="section"><div class="section-head"><h2>${title}</h2><span class="section-note">${note}</span></div><div class="project-grid" data-grid>${projects.map(projectCard).join("")}</div></section>`;
}

export function renderMemoryHubHtml(hub: MemoryHub): string {
  const csp = [
    "default-src 'none'",
    `style-src 'sha256-${hash(css)}'`,
    `script-src 'sha256-${hash(script)}'`,
    "img-src data:",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${text(csp)}"><title>Talo · 记忆中心</title><style>${css}</style></head><body><div class="shell">
  <header class="masthead"><div class="masthead-inner"><div class="masthead-top"><div class="brand"><span class="brand-mark" aria-hidden="true">⌘</span><div class="brand-copy"><strong>Talo</strong><span>项目工作记忆 · 本地空间</span></div></div><span class="masthead-status"><i class="status-dot"></i>本地 · 私有 · 离线</span></div><div class="hero-grid"><div><p class="eyebrow">项目总览</p><h1>项目记忆中心</h1><p class="hero-copy">从最近发生的工作开始，快速看清每个项目为什么做、做了什么、依据在哪里，以及接下来要处理什么。</p></div><div class="hero-aside"><a class="hero-link" href="#recent">最近发生<span>按时间阅读 →</span></a><a class="hero-link" href="#projects">全部项目<span>打开目录 →</span></a></div></div><div class="summary"><div class="metric"><strong>${hub.summary.projectCount}</strong><span>已注册项目</span></div><div class="metric"><strong>${hub.summary.memoryCount}</strong><span>正式记忆</span></div><div class="metric"><strong>${hub.summary.pendingProposalCount}</strong><span>待审核</span></div><div class="metric"><strong>${hub.summary.attentionProjectCount}</strong><span>需要关注</span></div></div></div></header>
  <div class="toolbar"><input id="search" class="search" aria-label="搜索项目记忆" placeholder="搜索项目、结论、产出、来源说明或下一步"><select id="sort" class="sort" aria-label="项目排序"><option value="recent">最近更新</option><option value="name">按名称</option></select><div class="filters"><button class="filter" data-filter="all" aria-pressed="true">全部</button><button class="filter" data-filter="attention" aria-pressed="false">需要关注</button><button class="filter" data-filter="risk" aria-pressed="false">有风险</button><button class="filter" data-filter="pending" aria-pressed="false">待审核</button><button class="filter" data-filter="stale" aria-pressed="false">来源失效</button></div><span id="result-count" class="section-note"></span></div>
  <main class="content"><div id="recent"></div>${section("最近发生", "按实际工作时间排序", hub.recentProjects)}${section("需要关注", "风险、失效来源或待审核内容", hub.attentionProjects)}${section("待审核", "来自各个 AI 平台的候选内容", hub.pendingProjects)}<section id="projects" class="section"><div class="section-head"><h2>全部项目</h2><span class="section-note">点击项目进入完整时间线</span></div><div class="project-grid" data-grid>${hub.projects.map(projectCard).join("")}</div><div id="empty" class="empty hidden">没有找到匹配的项目。</div></section><footer class="footer">生成于 ${text(hub.generatedAt)} · 本地静态快照 · 不连接网络</footer></main>
  </div><template id="hub-data">${text(JSON.stringify({ generatedAt: hub.generatedAt }))}</template><script>${script}</script></body></html>`;
}

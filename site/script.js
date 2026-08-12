const languageToggle = document.querySelector(".language-toggle");
const languageOptions = document.querySelectorAll("[data-language-label]");
const translatableElements = document.querySelectorAll("[data-zh][data-en]");
const workflowItems = document.querySelectorAll(".workflow-steps li");
const workflowLabel = document.querySelector("[data-workflow-label]");
const workflowCommand = document.querySelector("[data-workflow-command]");
const workflowResult = document.querySelector("[data-workflow-result]");
const workflowCopy = document.querySelector("[data-workflow-copy]");

const workflowContent = {
  zh: {
    1: { label: "STEP 01 · RECALL", command: 'talo recall --path "$PWD" --query "发布产品官网"', result: ["3 个候选", "642 估算 token", "2 个推荐"], copy: "候选先以紧凑摘要出现；Agent 只深读被推荐并且仍然有效的记忆。" },
    2: { label: "STEP 02 · WORK", command: "pnpm check", result: ["类型检查", "测试", "构建与集成验证"], copy: "Agent 使用召回的项目边界完成任务，同时以当前代码、测试和文件作为更强证据。" },
    3: { label: "STEP 03 · PROPOSE", command: "talo propose --path \"$PWD\" --file proposal.json", result: ["结论", "工作记录", "风险与下一步"], copy: "只有可长期复用、脱离对话也能理解的内容才进入共享审核箱。" },
    4: { label: "STEP 04 · REVIEW", command: "talo commit --path \"$PWD\" --proposal-id ID", result: ["来源已验证", "修订号已检查", "正式历史已刷新"], copy: "确认后的记忆以原子写入更新，并刷新项目时间线和关系视图。" },
  },
  en: {
    1: { label: "STEP 01 · RECALL", command: 'talo recall --path "$PWD" --query "launch product website"', result: ["3 candidates", "642 estimated tokens", "2 recommended"], copy: "Candidates appear as compact summaries. The agent deep-reads only recommended memories that remain valid." },
    2: { label: "STEP 02 · WORK", command: "pnpm check", result: ["typecheck", "tests", "build and integration checks"], copy: "The agent works within recalled project boundaries while treating current code, tests, and files as stronger evidence." },
    3: { label: "STEP 03 · PROPOSE", command: "talo propose --path \"$PWD\" --file proposal.json", result: ["conclusions", "work records", "risks and next steps"], copy: "Only durable, standalone knowledge enters the shared review inbox." },
    4: { label: "STEP 04 · REVIEW", command: "talo commit --path \"$PWD\" --proposal-id ID", result: ["sources validated", "revision checked", "formal history refreshed"], copy: "Approved memories are written atomically, then the timeline and relationship views refresh." },
  },
};

let activeLanguage = localStorage.getItem("talo-language") === "en" ? "en" : "zh";
let activeWorkflowStep = 1;

function setLanguage(language) {
  activeLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh" ? "Talo · 别再从头开始" : "Talo · Never start over";
  translatableElements.forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  languageOptions.forEach((option) => option.classList.toggle("active", option.dataset.languageLabel === language));
  languageToggle.setAttribute("aria-pressed", String(language === "en"));
  languageToggle.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换为中文");
  localStorage.setItem("talo-language", language);
  renderWorkflow();
}

function renderWorkflow() {
  const content = workflowContent[activeLanguage][activeWorkflowStep];
  workflowLabel.textContent = content.label;
  workflowCommand.textContent = content.command;
  workflowResult.replaceChildren(...content.result.map((item) => {
    const span = document.createElement("span");
    span.textContent = item;
    return span;
  }));
  workflowCopy.textContent = content.copy;
}

languageToggle.addEventListener("click", () => setLanguage(activeLanguage === "zh" ? "en" : "zh"));
workflowItems.forEach((item) => {
  item.querySelector("button").addEventListener("click", () => {
    activeWorkflowStep = Number(item.dataset.step);
    workflowItems.forEach((candidate) => candidate.classList.toggle("active", candidate === item));
    renderWorkflow();
  });
});

setLanguage(activeLanguage);

const API_BASE = "http://127.0.0.1:8765";

const form = document.querySelector("#captureForm");
const companyInput = document.querySelector("#companyInput");
const positionInput = document.querySelector("#positionInput");
const sourceUrlInput = document.querySelector("#sourceUrlInput");
const applyUrlInput = document.querySelector("#applyUrlInput");
const jdContentInput = document.querySelector("#jdContentInput");
const recaptureBtn = document.querySelector("#recaptureBtn");
const saveBtn = document.querySelector("#saveBtn");
const openDashboardBtn = document.querySelector("#openDashboardBtn");
const message = document.querySelector("#message");
const serverStatus = document.querySelector("#serverStatus");
const captureHint = document.querySelector("#captureHint");
const popupTitle = document.querySelector("#popupTitle");
const viewTabs = document.querySelectorAll("[data-view-tab]");
const views = document.querySelectorAll("[data-view]");
const profileList = document.querySelector("#profileList");
const profileHint = document.querySelector("#profileHint");
const reloadProfilesBtn = document.querySelector("#reloadProfilesBtn");
const autofillBtn = document.querySelector("#autofillBtn");
const autofillResult = document.querySelector("#autofillResult");

let capturedPage = null;
let isSaving = false;
let profiles = [];
let userProfile = {};
let selectedProfileId = "";
let hasCapturedPage = false;

window.addEventListener("error", (event) => {
  views.forEach((view) => {
    view.hidden = view.dataset.view !== "capture";
  });
  popupTitle.textContent = "保存当前岗位";
  setServerStatus("Error", "error");
  setMessage(event.message || "插件运行出错。", "error");
});

window.addEventListener("unhandledrejection", (event) => {
  views.forEach((view) => {
    view.hidden = view.dataset.view !== "capture";
  });
  popupTitle.textContent = "保存当前岗位";
  setServerStatus("Error", "error");
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "");
  setMessage(reason || "插件运行出错。", "error");
});

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function setServerStatus(text, type = "") {
  serverStatus.textContent = text;
  serverStatus.className = `status ${type}`.trim();
}

function openDashboard() {
  const url = `${API_BASE}/`;
  if (chrome?.tabs?.create) {
    chrome.tabs.create({ url });
    return;
  }
  window.open(url, "_blank", "noopener");
}

function inferFromTitle(title) {
  const cleanTitle = String(title || "").replace(/\s+/g, " ").trim();
  const parts = cleanTitle
    .split(/\s[-|–—]\s| at | @ /i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      position: parts[0],
      company: parts[1],
    };
  }

  return {
    position: cleanTitle,
    company: "",
  };
}

function pageCaptureScript() {
  const selection = window.getSelection ? window.getSelection().toString().trim() : "";
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function textKey(value) {
    return cleanText(value).toLowerCase();
  }

  function isVisibleElement(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return r.width > 0 && r.height > 0 &&
      r.bottom > 0 && r.top < vh &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity || 1) > 0.05;
  }

  function textFromElement(el) {
    if (!el || !isVisibleElement(el)) return "";
    const ownText = cleanText(el.innerText || el.textContent);
    if (!ownText || ownText.length > 220 || ownText.includes("\n")) return "";
    return ownText;
  }

  const noiseTerms = [
    "apply", "save", "saved", "share", "copy", "back", "next", "previous",
    "sign in", "log in", "login", "create alert", "job alert", "view job",
    "view all", "similar jobs", "recommended", "posted", "easy apply",
    "收藏", "保存", "分享", "申请", "投递", "登录", "注册", "返回", "下一页",
    "上一页", "推荐", "职位提醒", "查看", "复制"
  ];
  const jobTerms = [
    "engineer", "developer", "analyst", "manager", "designer", "scientist",
    "specialist", "consultant", "associate", "intern", "graduate", "trainee",
    "architect", "lead", "director", "product", "program", "project", "data",
    "software", "frontend", "backend", "full stack", "machine learning",
    "research", "security", "cloud", "qa", "sde", "devops", "sales",
    "marketing", "operations", "finance", "岗位", "职位", "工程师", "开发",
    "分析师", "经理", "设计师", "实习", "管培", "产品", "数据", "算法"
  ];
  const companyTerms = [
    "inc", "ltd", "limited", "llc", "corp", "corporation", "company",
    "group", "plc", "gmbh", "ag", "sa", "bv", "co.", "有限公司", "集团",
    "公司"
  ];
  const metadataTerms = [
    "remote", "hybrid", "onsite", "on-site", "full-time", "part-time",
    "contract", "temporary", "permanent", "salary", "compensation",
    "benefits", "posted", "reposted", "deadline", "location", "london",
    "united kingdom", "uk", "united states", "usa", "remote first",
    "远程", "混合", "现场", "全职", "兼职", "合同", "薪资", "地点",
    "发布时间", "截止"
  ];

  function hasAny(text, terms) {
    const lower = text.toLowerCase();
    return terms.some((term) => lower.includes(term));
  }

  function looksNoisy(text) {
    const lower = text.toLowerCase();
    if (!text || text.length < 2) return true;
    if (text.length > 180) return true;
    if (/^\d+$/.test(text)) return true;
    if (/^(new|hot|remote|hybrid|full[- ]time|part[- ]time)$/i.test(text)) return true;
    if (/^\$?£?\d[\d,.\s]*(k|K)?\s*(-|–|—|to)\s*\$?£?\d/.test(text)) return true;
    return noiseTerms.some((term) => lower === term || lower.includes(term));
  }

  function visibleScore(el) {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const size = Number.parseFloat(style.fontSize || "0");
    let score = 0;
    score += Math.min(size, 36) * 0.9;
    if (r.top >= 0 && r.top < vh * 0.55) score += 18;
    if (r.left > vw * 0.18) score += 8;
    if (r.width > 120) score += 4;
    return score;
  }

  function addCandidate(pool, text, el, source, hints = {}) {
    const value = cleanText(text);
    if (looksNoisy(value)) return;
    const key = `${source}:${textKey(value)}`;
    if (pool.seen.has(key)) return;
    pool.seen.add(key);
    pool.items.push({ text: value, el, source, hints });
  }

  function scoreTitle(candidate) {
    const text = candidate.text;
    const length = text.length;
    let score = 0;
    if (candidate.source === "jsonld-title") score += 120;
    if (candidate.source === "document-title") score += 24;
    if (candidate.hints.headingLevel === "h1") score += 52;
    if (candidate.hints.headingLevel === "h2") score += 36;
    if (candidate.hints.atsTitle) score += 50;
    if (candidate.hints.inDetailPanel) score += 16;
    if (hasAny(text, jobTerms)) score += 28;
    if (hasAny(text, companyTerms)) score -= 18;
    if (hasAny(text, metadataTerms)) score -= 18;
    if (length >= 6 && length <= 90) score += 12;
    if (length > 120) score -= 30;
    score += visibleScore(candidate.el);
    return score;
  }

  function scoreCompany(candidate, titleCandidate) {
    const text = candidate.text;
    const length = text.length;
    let score = 0;
    if (candidate.source === "jsonld-company") score += 120;
    if (candidate.source === "document-title") score += 22;
    if (candidate.hints.companySelector) score += 56;
    if (candidate.hints.atsCompany) score += 46;
    if (candidate.hints.nearTitle) score += 28;
    if (candidate.hints.linkLike) score += 8;
    if (hasAny(text, companyTerms)) score += 18;
    if (hasAny(text, jobTerms)) score -= 26;
    if (hasAny(text, metadataTerms)) score -= 32;
    if (length >= 2 && length <= 60) score += 16;
    if (length > 80) score -= 28;
    if (titleCandidate && textKey(text) === textKey(titleCandidate.text)) score -= 90;
    score += visibleScore(candidate.el) * 0.45;
    return score;
  }

  function bestCandidate(items, scorer) {
    return items
      .map((candidate) => ({ ...candidate, score: scorer(candidate) }))
      .sort((a, b) => b.score - a.score)[0] || null;
  }

  function parseJobPostings(value, results = []) {
    if (!value) return results;
    if (Array.isArray(value)) {
      value.forEach((item) => parseJobPostings(item, results));
      return results;
    }
    if (typeof value !== "object") return results;
    const type = value["@type"];
    const types = Array.isArray(type) ? type : [type];
    if (types.includes("JobPosting")) results.push(value);
    if (value["@graph"]) parseJobPostings(value["@graph"], results);
    return results;
  }

  const candidatePool = { items: [], seen: new Set() };

  // 1. JSON-LD structured data
  let structuredJob = null;
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const parsed = JSON.parse(script.textContent);
      const jobs = parseJobPostings(parsed);
      if (jobs.length) structuredJob = jobs[0];
    } catch (_) {}
  });
  if (structuredJob) {
    addCandidate(candidatePool, structuredJob.title, null, "jsonld-title");
    const org = structuredJob.hiringOrganization;
    const ldCompany = typeof org === "object" ? org?.name : (typeof org === "string" ? org : "");
    addCandidate(candidatePool, ldCompany, null, "jsonld-company");
  }

  const inferredTitle = (() => {
    const cleanTitle = cleanText(document.title);
    const parts = cleanTitle
      .split(/\s[-|–—]\s| at | @ /i)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return {
        position: parts[0].replace(/^job application for\s+/i, ""),
        company: parts[1].replace(/\s+careers?$/i, ""),
      };
    }
    return { position: cleanTitle, company: "" };
  })();
  addCandidate(candidatePool, inferredTitle.position, null, "document-title");
  addCandidate(candidatePool, inferredTitle.company, null, "document-title");

  const atsTitleSelectors = [
    ".app-title", ".posting-headline h2", ".posting-headline h1",
    '[data-automation-id="jobPostingHeader"]',
    '[data-automation-id="job-posting-title"]',
    '[data-automation-id="job-title"]',
    '[data-test="job-title"]',
    '[class*="jobTitle"]', '[class*="JobTitle"]'
  ];
  const atsCompanySelectors = [
    ".company-name", ".posting-company", ".posting-categories .sort-by-company",
    '[data-automation-id="jobPostingCompany"]',
    '[data-automation-id="company"]',
    '[data-automation-id="subtitle"]',
    '[data-test="employer-name"]',
    '[class*="employerName"]', '[class*="EmployerName"]',
    '[class*="companyName"]', '[class*="CompanyName"]',
    '[class*="employer-name"]'
  ];

  for (const h of document.querySelectorAll("h1, h2, h3")) {
    const text = textFromElement(h);
    if (!text) continue;
    const r = h.getBoundingClientRect();
    if (r.top < 0 || r.bottom > vh * 1.2) continue;
    addCandidate(candidatePool, text, h, "heading", {
      headingLevel: h.tagName.toLowerCase(),
      inDetailPanel: r.left > vw * 0.16,
    });
  }
  for (const sel of atsTitleSelectors) {
    document.querySelectorAll(sel).forEach((el) => {
      addCandidate(candidatePool, textFromElement(el), el, "ats-title", { atsTitle: true });
    });
  }
  for (const sel of atsCompanySelectors) {
    document.querySelectorAll(sel).forEach((el) => {
      addCandidate(candidatePool, textFromElement(el), el, "company-selector", {
        companySelector: true,
        atsCompany: true,
      });
    });
  }

  const titleCandidate = bestCandidate(candidatePool.items, scoreTitle);
  const jobHeading = titleCandidate?.el || null;

  // 2. Job-specific URL — try active card link in left panel first
  //    Glassdoor index page URLs contain jl= or job-listing slugs
  let jobUrl = window.location.href;
  const activeCardSelectors = [
    '[class*="active"] a[href*="job"]',
    '[class*="selected"] a[href*="job"]',
    '[aria-selected="true"] a[href]',
    'a[data-job-id]',
    'a[href*="jl="]',
    'a[href*="job-listing"]',
  ];
  for (const sel of activeCardSelectors) {
    try {
      const link = document.querySelector(sel);
      if (link && link.href && link.href !== window.location.href) { jobUrl = link.href; break; }
    } catch (_) {}
  }
  // Fallback: og:url or canonical (may still be index page for Glassdoor)
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content");
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  if (jobUrl === window.location.href) jobUrl = ogUrl || canonical || window.location.href;

  // 3. Walk up from heading to find the detail panel and related header area
  let panel = null;
  if (jobHeading) {
    let el = jobHeading.parentElement;
    for (let i = 0; i < 12 && el && el !== document.body; i++, el = el.parentElement) {
      const len = (el.innerText || "").trim().length;
      if (len > 400 && len < 60000) { panel = el; break; }
    }
  }
  // Static selector fallback
  if (!panel) {
    for (const sel of [
      '[data-test="job-detail"]', '[data-test="jobListing"]',
      '#job-details', '#JobDescriptionContainer',
      '.jobsearch-JobComponent', '.jobs-details__main-content',
      '[class*="JobDetails"]', '[class*="jobDetail"]', 'article', 'main',
    ]) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 300) { panel = el; break; }
    }
  }

  if (jobHeading) {
    const headingRect = jobHeading.getBoundingClientRect();
    let block = jobHeading.parentElement;
    for (let i = 0; i < 6 && block && block !== document.body; i++, block = block.parentElement) {
      const len = cleanText(block.innerText).length;
      if (len > 160 && len < 1800) break;
    }
    if (block) {
      for (const el of block.querySelectorAll("a, span, p, div, strong")) {
        if (el === jobHeading || el.contains(jobHeading)) continue;
        const text = textFromElement(el);
        if (!text) continue;
        const r = el.getBoundingClientRect();
        const verticallyRelated = Math.abs(r.top - headingRect.top) < 180 ||
          Math.abs(r.top - headingRect.bottom) < 180;
        if (!verticallyRelated) continue;
        addCandidate(candidatePool, text, el, "related-to-title", {
          nearTitle: true,
          linkLike: el.tagName.toLowerCase() === "a",
        });
      }
    }
  }

  if (structuredJob && structuredJob.url) jobUrl = structuredJob.url;

  const finalTitle = bestCandidate(candidatePool.items, scoreTitle);
  const finalCompany = bestCandidate(candidatePool.items, (candidate) => scoreCompany(candidate, finalTitle));
  const detailTitle = finalTitle?.text || cleanText(document.title);
  let companyName = finalCompany?.text || "";
  if (textKey(companyName) === textKey(detailTitle)) {
    const nextCompany = candidatePool.items
      .map((candidate) => ({ ...candidate, score: scoreCompany(candidate, finalTitle) }))
      .filter((candidate) => textKey(candidate.text) !== textKey(detailTitle))
      .sort((a, b) => b.score - a.score)[0];
    companyName = nextCompany?.text || "";
  }

  const bodyText = (panel ? panel.innerText : document.body.innerText || "").trim();

  return {
    title: detailTitle,
    companyName,
    url: jobUrl,
    html: document.documentElement.outerHTML,
    selectedText: selection,
    bodyText,
    structuredJob,
  };
}

function autofillPageScript(profile) {
  const fields = profile.autofill_fields || profile.parsed_json || {};
  const aliases = [
    { key: "first_name", terms: ["first name", "firstname", "given name", "名字", "名"] },
    { key: "last_name", terms: ["last name", "lastname", "family name", "surname", "姓氏", "姓"] },
    { key: "full_name", terms: ["full name", "name", "legal name", "your name", "姓名"] },
    { key: "email", terms: ["email", "e-mail", "email address", "邮箱", "电子邮件"] },
    { key: "phone", terms: ["phone", "mobile", "telephone", "contact number", "phone number", "电话", "手机号"] },
    { key: "address", terms: ["address", "street address", "home address", "residential address", "住址", "地址", "家庭住址"] },
    { key: "city", terms: ["city", "town", "城市", "所在城市"] },
    { key: "postcode", terms: ["postcode", "postal code", "zip code", "zip", "邮编", "邮政编码"] },
    { key: "country", terms: ["country", "nation", "国家"] },
    { key: "location", terms: ["location", "current location", "所在地", "地点"] },
    { key: "visa_status", terms: ["visa status", "visa type", "work visa", "签证状态", "签证"] },
    { key: "needs_sponsorship", terms: ["sponsorship", "require sponsorship", "visa sponsorship", "need sponsorship", "担保", "是否需要担保"] },
    { key: "right_to_work", terms: ["right to work", "work authorization", "work eligibility", "authorized to work", "工作权限"] },
    { key: "linkedin", terms: ["linkedin", "linked in", "linkedin url", "linkedin profile"] },
    { key: "github", terms: ["github", "github url", "github profile"] },
    { key: "portfolio", terms: ["portfolio", "website", "personal site", "personal website", "个人网站", "作品集"] },
  ];

  function textForControl(control) {
    const parts = [
      control.name,
      control.id,
      control.getAttribute("aria-label"),
      control.getAttribute("placeholder"),
      control.getAttribute("autocomplete"),
    ];
    if (control.id) {
      const label = document.querySelector(`label[for="${CSS.escape(control.id)}"]`);
      if (label) parts.push(label.innerText);
    }
    const closestLabel = control.closest("label");
    if (closestLabel) parts.push(closestLabel.innerText);
    const container = control.closest("div, section, li, fieldset");
    if (container) {
      const labelLike = container.querySelector("label, legend, [aria-label]");
      if (labelLike) parts.push(labelLike.innerText || labelLike.getAttribute("aria-label"));
    }
    return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").toLowerCase();
  }

  function valueForControl(control) {
    const text = textForControl(control);
    for (const alias of aliases) {
      if (alias.terms.some((term) => text.includes(term))) {
        const value = fields[alias.key];
        if (value) return { key: alias.key, value };
      }
    }
    return null;
  }

  function setValue(control, value) {
    control.focus();
    // Use native setter so React/Vue controlled inputs pick up the change
    const nativeSetter = Object.getOwnPropertyDescriptor(
      control.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      "value"
    );
    if (nativeSetter) {
      nativeSetter.set.call(control, value);
    } else {
      control.value = value;
    }
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setSelectValue(select, value) {
    const needle = String(value).toLowerCase();
    let best = null;
    for (const opt of select.options) {
      const t = opt.text.toLowerCase();
      const v = opt.value.toLowerCase();
      if (v === needle || t === needle) { best = opt; break; }
      if (!best && (v.includes(needle) || needle.includes(v) || t.includes(needle) || needle.includes(t))) {
        best = opt;
      }
    }
    if (!best) return false;
    select.value = best.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  const textControls = Array.from(document.querySelectorAll("input, textarea"))
    .filter((c) => !c.disabled && !c.readOnly &&
      !["hidden", "file", "submit", "button", "password", "checkbox", "radio"].includes((c.type || "").toLowerCase()));

  const selectControls = Array.from(document.querySelectorAll("select"))
    .filter((c) => !c.disabled);

  const filled = [];
  const skipped = [];

  for (const control of textControls) {
    if (control.value && control.value.trim()) continue;
    const match = valueForControl(control);
    if (!match) { skipped.push(textForControl(control).slice(0, 80)); continue; }
    setValue(control, match.value);
    filled.push({ field: match.key, label: textForControl(control).slice(0, 80) });
  }

  for (const select of selectControls) {
    const match = valueForControl(select);
    if (!match) continue;
    const didFill = setSelectValue(select, match.value);
    if (didFill) filled.push({ field: match.key, label: textForControl(select).slice(0, 80) });
  }

  const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'))
    .filter((c) => !c.disabled).length;
  return { filled, skippedCount: skipped.length, fileInputs };
}

async function getActiveTab() {
  if (!window.chrome || !chrome.tabs || !chrome.tabs.query) {
    throw new Error("当前环境无法访问 Chrome 标签页，请确认这是从扩展弹窗打开的。");
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function captureCurrentPage() {
  setMessage("正在读取当前页面...");
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    throw new Error("找不到当前标签页");
  }
  if (!window.chrome || !chrome.scripting || !chrome.scripting.executeScript) {
    throw new Error("当前环境无法读取页面，请确认插件权限已加载。");
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: pageCaptureScript,
  });

  capturedPage = result.result;
  const { structuredJob } = capturedPage;

  // Company name: ranked from JSON-LD, ATS selectors, title-related elements, and document title.
  if (!companyInput.value) {
    companyInput.value = capturedPage.companyName || inferFromTitle(capturedPage.title).company || "";
  }
  // Position: ranked from JSON-LD, headings, ATS selectors, and document title.
  if (!positionInput.value) {
    positionInput.value = capturedPage.title || inferFromTitle(capturedPage.title).position || "";
  }
  sourceUrlInput.value = capturedPage.url;
  applyUrlInput.value = capturedPage.url;

  if (structuredJob) {
    const schemaDesc = typeof structuredJob.description === "string"
      ? structuredJob.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : "";
    jdContentInput.value = capturedPage.selectedText || schemaDesc || capturedPage.bodyText;
    captureHint.textContent = "已从结构化数据和页面候选项排名抓取，请确认公司名和岗位名。";
  } else {
    jdContentInput.value = capturedPage.selectedText || capturedPage.bodyText;
    const source = capturedPage.selectedText ? "选中文本" : "页面正文";
    captureHint.textContent = `已抓取：${source}，HTML 原始页面会一起保存。`;
  }
  hasCapturedPage = true;
  setMessage("请确认公司名和岗位名，然后保存。", "ok");
}

function showView(viewName) {
  views.forEach((view) => {
    view.hidden = view.dataset.view !== viewName;
  });
  viewTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.viewTab === viewName);
  });
  popupTitle.textContent = viewName === "autofill" ? "自动填入" : "保存当前岗位";
  setMessage("");

  if (viewName === "capture" && !hasCapturedPage) {
    captureCurrentPage().catch((error) => setMessage(error.message, "error"));
  }
  if (viewName === "autofill") {
    loadProfiles().catch((error) => setMessage(error.message, "error"));
  }
}

async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/api/jobs`);
    if (!response.ok) throw new Error("server failed");
    setServerStatus("Ready", "ok");
  } catch (error) {
    setServerStatus("Offline", "error");
    setMessage("本地服务未启动。请先在项目目录运行：python3 server.py", "error");
  }
}

function renderProfiles() {
  if (!profiles.length) {
    profileList.innerHTML = '<div class="hint">没有 Resume Profile</div>';
    autofillBtn.disabled = true;
    profileHint.textContent = "请先在 Dashboard 的 Resume Profiles 页面上传简历。";
    return;
  }
  if (!selectedProfileId || !profiles.some((profile) => String(profile.id) === selectedProfileId)) {
    selectedProfileId = String(profiles[0].id);
  }
  profileList.innerHTML = profiles.map((profile) => {
    const tags = Array.isArray(profile.tags) && profile.tags.length ? ` · ${profile.tags.join(", ")}` : "";
    const fields = profile.autofill_fields || {};
    return `
      <div class="profile-option ${String(profile.id) === selectedProfileId ? "active" : ""}">
        <button type="button" data-profile-id="${profile.id}">
          <strong>${profile.name}</strong>
          <span>${fields.email || "未设置邮箱"}${tags}</span>
        </button>
        <a class="profile-file-link" href="${API_BASE}/api/resume-profiles/${profile.id}/file" target="_blank">打开原始简历文件</a>
      </div>
    `;
  }).join("");
  profileList.querySelectorAll("[data-profile-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProfileId = button.dataset.profileId;
      renderProfiles();
    });
  });
  autofillBtn.disabled = false;
  profileHint.textContent = "选择一份简历后填入基础字段；如果网站要求上传 PDF，请使用原始文件入口手动上传。";
}

async function loadProfiles() {
  const [profilesResponse, userResponse] = await Promise.all([
    fetch(`${API_BASE}/api/resume-profiles`),
    fetch(`${API_BASE}/api/user-profile`),
  ]);
  if (!profilesResponse.ok || !userResponse.ok) throw new Error("profile load failed");
  userProfile = await userResponse.json();
  profiles = (await profilesResponse.json()).map((profile) => ({
    ...profile,
    autofill_fields: { ...userProfile, ...(profile.parsed_json || {}) },
  }));
  renderProfiles();
}

async function autofillCurrentPage() {
  const profile = profiles.find((item) => String(item.id) === selectedProfileId);
  if (!profile) {
    setMessage("请先选择一个 Resume Profile。", "error");
    return;
  }
  const tab = await getActiveTab();
  if (!tab || !tab.id) throw new Error("找不到当前标签页");
  autofillBtn.disabled = true;
  setMessage("正在扫描当前申请表...");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: autofillPageScript,
    args: [profile],
  });
  const data = result.result || { filled: [], skippedCount: 0 };
  autofillResult.innerHTML = `
    <div><strong>${data.filled.length}</strong> 个字段已填入</div>
    <div>${data.skippedCount} 个字段未匹配，适合之后加入答案学习。</div>
    ${data.fileInputs ? `<div>页面检测到 ${data.fileInputs} 个文件上传框，浏览器安全限制下需要手动选择原始简历文件。</div>` : ""}
  `;
  setMessage(`已使用 ${profile.name} 自动填入基础字段。`, "ok");
  autofillBtn.disabled = false;
}

async function saveJob(event) {
  event.preventDefault();
  if (isSaving) {
    return;
  }
  if (!capturedPage) {
    setMessage("还没有抓取到页面，请先重新抓取。", "error");
    return;
  }

  isSaving = true;
  saveBtn.disabled = true;
  recaptureBtn.disabled = true;
  setMessage("正在保存到本地 Tracker...");

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.current_stage = "SAVED";
  payload.status = "SAVED";
  payload.next_action = "DECIDE";
  payload.html_content = capturedPage.html;
  payload.page_title = capturedPage.title;

  try {
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存失败");
    setMessage(`已保存：${data.company_name} - ${data.position_name}`, "ok");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    isSaving = false;
    saveBtn.disabled = false;
    recaptureBtn.disabled = false;
  }
}

recaptureBtn.addEventListener("click", () => {
  captureCurrentPage().catch((error) => setMessage(error.message, "error"));
});
openDashboardBtn.addEventListener("click", openDashboard);
form.addEventListener("submit", saveJob);
viewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    showView(tab.dataset.viewTab);
  });
});
reloadProfilesBtn.addEventListener("click", () => {
  loadProfiles()
    .then(() => setMessage("Profile 已刷新。", "ok"))
    .catch((error) => setMessage(error.message, "error"));
});
function initPopup() {
  showView("capture");
  checkServer();
  autofillBtn.addEventListener("click", () => {
    autofillCurrentPage().catch((error) => {
      autofillBtn.disabled = false;
      setMessage(error.message, "error");
    });
  });
}

try {
  initPopup();
} catch (error) {
  views.forEach((view) => {
    view.hidden = view.dataset.view !== "capture";
  });
  popupTitle.textContent = "保存当前岗位";
  setServerStatus("Error", "error");
  setMessage(error.message || "插件初始化失败。", "error");
}

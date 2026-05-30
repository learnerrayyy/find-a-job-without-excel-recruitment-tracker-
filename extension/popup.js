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
const closePopupBtn = document.querySelector("#closePopupBtn");

let capturedPage = null;
let isSaving = false;
let profiles = [];
let userProfile = {};
let selectedProfileId = "";
let hasCapturedPage = false;
let hasSavedCurrentCapture = false;

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
    window.close();
    return;
  }
  window.open(url, "_blank", "noopener");
  window.close();
}

function closePopup() {
  window.close();
}

function resetSaveState() {
  hasSavedCurrentCapture = false;
  saveBtn.disabled = false;
  saveBtn.textContent = "保存";
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
  const host = window.location.hostname.toLowerCase();
  const isLinkedIn = host.includes("linkedin.");

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
    "apply by", "start date", "closing date", "deadline", "expires",
    "application deadline", "days to apply", "date posted",
    "远程", "混合", "现场", "全职", "兼职", "合同", "薪资", "地点",
    "发布时间", "截止"
  ];
  const platformTerms = [
    "linkedin", "linkedin jobs", "领英", "indeed", "glassdoor", "workday",
    "greenhouse", "lever", "ashby", "job search", "jobs", "careers"
  ];
  const sectorLabels = [
    "sector", "sectors", "industry", "industries", "category", "categories",
    "job function", "business area", "department", "departments", "领域", "行业", "分类"
  ];
  const locationLabels = ["location", "locations", "where", "地点", "城市"];
  const employerLabels = [
    "employer", "verified employer", "organisation", "organization", "company",
    "about us", "about the organisation", "about the organization", "about the company",
    "雇主", "公司", "机构"
  ];
  const relatedLabels = ["related jobs", "similar jobs", "more jobs", "recommended jobs", "相关岗位", "相似岗位"];

  function hasAny(text, terms) {
    const lower = text.toLowerCase();
    return terms.some((term) => lower.includes(term));
  }

  function textSimilarity(a, b) {
    const left = textKey(a);
    const right = textKey(b);
    if (!left || !right) return 0;
    if (left === right) return 1;
    if (left.includes(right) || right.includes(left)) {
      return Math.min(left.length, right.length) / Math.max(left.length, right.length);
    }
    const leftWords = new Set(left.split(/[^a-z0-9\u4e00-\u9fff]+/i).filter(Boolean));
    const rightWords = new Set(right.split(/[^a-z0-9\u4e00-\u9fff]+/i).filter(Boolean));
    if (!leftWords.size || !rightWords.size) return 0;
    const overlap = Array.from(leftWords).filter((word) => rightWords.has(word)).length;
    return overlap / Math.max(leftWords.size, rightWords.size);
  }

  function looksNoisy(text) {
    const lower = text.toLowerCase();
    if (!text || text.length < 2) return true;
    if (text.length > 180) return true;
    if (/^\d+$/.test(text)) return true;
    if (/^(new|hot|remote|hybrid|full[- ]time|part[- ]time)$/i.test(text)) return true;
    if (/^\$?£?\d[\d,.\s]*(k|K)?\s*(-|–|—|to)\s*\$?£?\d/.test(text)) return true;
    if (platformTerms.some((term) => lower === term || lower === `${term}.com`)) return true;
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

  function elementContext(el) {
    if (!el) return {};
    const interactive = Boolean(el.closest(
      'button, [role="button"], [aria-pressed], [aria-haspopup], input, select, textarea'
    ));
    const navigation = Boolean(el.closest('nav, header, footer, [role="navigation"], [role="banner"], [role="contentinfo"]'));
    const actionArea = Boolean(el.closest(
      '[class*="button"], [class*="actions"], [class*="Action"], [class*="cta"], [class*="CTA"], ' +
      '[class*="save"], [class*="share"], [class*="follow"], [class*="alert"]'
    ));
    const labelledAsAction = Boolean(
      (el.getAttribute("aria-label") || "").trim() ||
      (el.closest("[aria-label]")?.getAttribute("aria-label") || "").trim()
    );
    return { interactive, navigation, actionArea, labelledAsAction };
  }

  function layerLabel(el) {
    if (!el) return "";
    return [
      el.tagName,
      el.id,
      el.className,
      el.getAttribute("role"),
      el.getAttribute("data-test"),
      el.getAttribute("data-automation-id"),
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function surroundingText(el) {
    if (!el) return "";
    const parts = [];
    let node = el;
    for (let i = 0; i < 4 && node && node !== document.body; i++, node = node.parentElement) {
      parts.push(layerLabel(node));
      const heading = node.querySelector?.("h1, h2, h3, h4, h5, h6, legend, summary");
      if (heading && heading !== el && !heading.contains(el)) parts.push(cleanText(heading.innerText || heading.textContent));
    }
    let prev = el.previousElementSibling;
    for (let i = 0; i < 3 && prev; i++, prev = prev.previousElementSibling) {
      const text = cleanText(prev.innerText || prev.textContent);
      if (text && text.length < 80) parts.push(text);
    }
    return parts.join(" ").toLowerCase();
  }

  function semanticRole(el, text, source, hints = {}) {
    if (source.includes("title") || hints.headingLevel || hints.detailLayerTitle) return "title";
    if (!el) return "unknown";

    const context = surroundingText(el);
    const own = `${text} ${layerLabel(el)}`.toLowerCase();
    if (hasAny(context, relatedLabels)) return "related";
    if (hasAny(context, sectorLabels) || hasAny(own, sectorLabels)) return "sector";
    if (hasAny(context, locationLabels) || hasAny(own, locationLabels)) return "location";
    if (hasAny(text, metadataTerms) || hasAny(own, metadataTerms)) return "metadata";
    if (/^\D{0,30}\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text)) return "metadata";
    if (/\b\d+\s+days?\s+to\s+apply\b/i.test(text)) return "metadata";
    if (hints.interactive || hints.actionArea) return "action";
    if (
      source === "jsonld-company" ||
      source === "image-alt-company" ||
      source === "company-selector" ||
      source === "linkedin-company" ||
      source === "employer-context" ||
      hints.companySelector ||
      hints.linkedinCompany ||
      hasAny(context, employerLabels) ||
      hasAny(own, employerLabels)
    ) {
      return "employer";
    }
    if (hasAny(context, employerLabels) || hasAny(own, employerLabels)) return "employer";
    return "unknown";
  }

  let detailLayer = null;

  function layerAffinity(el) {
    if (!detailLayer || !el) return 0;
    if (detailLayer === el || detailLayer.contains(el)) return 78;
    if (el.contains(detailLayer)) return 12;
    return -48;
  }

  function scoreDetailLayer(el) {
    if (!el || !isVisibleElement(el)) return -Infinity;
    const text = cleanText(el.innerText || el.textContent);
    const length = text.length;
    if (length < 260 || length > 100000) return -Infinity;

    const r = el.getBoundingClientRect();
    const ctx = elementContext(el);
    const label = layerLabel(el);
    const buttonCount = el.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').length;
    const headingCount = el.querySelectorAll("h1, h2, h3").length;

    let score = 0;
    if (/job|role|posting|position|detail|description|jd|vacancy|opening/.test(label)) score += 48;
    if (/main|content|article/.test(label)) score += 18;
    if (headingCount) score += Math.min(headingCount, 3) * 16;
    if (hasAny(text.slice(0, 2500), jobTerms)) score += 18;
    if (r.width > vw * 0.35) score += 14;
    if (r.height > 250) score += 12;
    if (r.left > vw * 0.15) score += 8;
    if (length > 800 && length < 65000) score += 22;
    if (ctx.navigation) score -= 90;
    if (ctx.actionArea) score -= 55;
    if (ctx.interactive) score -= 55;
    if (buttonCount > 8 && length < 2500) score -= 32;
    return score;
  }

  function findBestDetailLayer() {
    const selectors = [
      '[data-test="job-detail"]',
      '[data-test="jobListing"]',
      '[data-automation-id="jobPostingDescription"]',
      '[data-automation-id="job-posting-details"]',
      ".jobs-search__job-details--container",
      ".jobs-details__main-content",
      ".job-details-jobs-unified-top-card",
      "#job-details",
      "#JobDescriptionContainer",
      ".jobsearch-JobComponent",
      '[class*="JobDetails"]',
      '[class*="jobDetail"]',
      '[class*="job-description"]',
      '[class*="JobDescription"]',
      'main',
      'article',
      '[role="main"]',
      'section',
    ];
    const layers = [];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => layers.push(el));
    }
    const uniqueLayers = Array.from(new Set(layers));
    return uniqueLayers
      .map((el) => ({ el, score: scoreDetailLayer(el) }))
      .filter((item) => Number.isFinite(item.score))
      .sort((a, b) => b.score - a.score)[0]?.el || null;
  }

  function addCandidate(pool, text, el, source, hints = {}) {
    let value = cleanText(text);
    if (hints.linkedinCompany) {
      value = cleanText(value.split(/\s+[·•|]\s+/)[0]);
    }
    if (hints.linkedinTitle) {
      value = cleanText(value.replace(/\s+\d+\s*$/, ""));
    }
    if (looksNoisy(value)) return;
    const key = `${source}:${textKey(value)}`;
    if (pool.seen.has(key)) return;
    pool.seen.add(key);
    const mergedHints = { ...elementContext(el), ...hints };
    pool.items.push({
      text: value,
      el,
      source,
      role: semanticRole(el, value, source, mergedHints),
      hints: mergedHints,
    });
  }

  function scoreTitle(candidate) {
    const text = candidate.text;
    const length = text.length;
    let score = 0;
    if (["sector", "location", "related", "action", "metadata"].includes(candidate.role)) return -Infinity;
    const titleSources = [
      "jsonld-title", "document-title", "heading", "ats-title", "linkedin-title", "detail-layer-title"
    ];
    if (!titleSources.includes(candidate.source)) score -= 90;
    if (candidate.source === "jsonld-title") score += 120;
    if (candidate.source === "document-title") score += 24;
    if (candidate.hints.headingLevel === "h1") score += 52;
    if (candidate.hints.headingLevel === "h2") score += 36;
    if (candidate.hints.atsTitle) score += 50;
    if (candidate.hints.linkedinTitle) score += 74;
    if (candidate.hints.linkedinSelectedCard) score += 32;
    if (candidate.hints.detailLayerTitle) score += 92;
    if (candidate.hints.inDetailPanel) score += 16;
    if (hasAny(text, jobTerms)) score += 28;
    if (hasAny(text, companyTerms)) score -= 18;
    if (hasAny(text, metadataTerms)) score -= 18;
    if (hasAny(text, platformTerms)) score -= 45;
    if (length >= 6 && length <= 90) score += 12;
    if (length > 120) score -= 30;
    if (candidate.hints.interactive) score -= 120;
    if (candidate.hints.navigation) score -= 70;
    if (candidate.hints.actionArea) score -= 95;
    if (candidate.hints.labelledAsAction && !candidate.hints.linkedinTitle) score -= 50;
    if (candidate.source !== "jsonld-title" && candidate.source !== "document-title") {
      score += layerAffinity(candidate.el);
    }
    score += visibleScore(candidate.el);
    return score;
  }

  function scoreCompany(candidate, titleCandidate) {
    const text = candidate.text;
    const length = text.length;
    let score = 0;
    if (["sector", "location", "related", "action", "metadata", "title"].includes(candidate.role)) return -Infinity;
    const companySources = [
      "jsonld-company", "document-title", "company-selector", "linkedin-company", "related-to-title",
      "detail-layer-company"
    ];
    if (!companySources.includes(candidate.source)) score -= 70;
    if (candidate.source === "jsonld-company") score += 120;
    if (candidate.source === "document-title") score += 22;
    if (candidate.hints.companySelector) score += 56;
    if (candidate.hints.imageAltCompany) score += 80;
    if (candidate.hints.atsCompany) score += 46;
    if (candidate.hints.linkedinCompany) score += 76;
    if (candidate.hints.linkedinSelectedCard) score += 22;
    if (candidate.hints.detailLayerCompany) score += 42;
    if (candidate.role === "employer") score += 70;
    if (candidate.hints.nearTitle) score += 28;
    if (candidate.hints.linkLike) score += 8;
    if (hasAny(text, companyTerms)) score += 18;
    if (hasAny(text, jobTerms)) score -= 26;
    if (hasAny(text, metadataTerms)) score -= 32;
    if (hasAny(text, platformTerms)) score -= 60;
    if (length >= 2 && length <= 60) score += 16;
    if (length > 80) score -= 28;
    if (titleCandidate) {
      const similarity = textSimilarity(text, titleCandidate.text);
      if (similarity >= 0.9) score -= 140;
      else if (similarity >= 0.55) score -= 70;
    }
    if (hasAny(text, jobTerms) && !candidate.hints.companySelector && !candidate.hints.linkedinCompany) {
      score -= 48;
    }
    if (candidate.hints.interactive && !candidate.hints.linkLike) score -= 90;
    if (candidate.hints.navigation) score -= 70;
    if (candidate.hints.actionArea) score -= 80;
    if (candidate.hints.labelledAsAction && !candidate.hints.linkedinCompany) score -= 45;
    if (candidate.source !== "jsonld-company" && candidate.source !== "document-title") {
      score += layerAffinity(candidate.el) * 0.55;
    }
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

  document.querySelectorAll("img[alt]").forEach((img) => {
    const alt = cleanText(img.getAttribute("alt"));
    const logoMatch = alt.match(/(?:logo image for|logo for|logo of|employer logo for)\s+(.+)$/i);
    if (logoMatch?.[1]) {
      addCandidate(candidatePool, logoMatch[1], img, "image-alt-company", {
        imageAltCompany: true,
        companySelector: true,
      });
      return;
    }
    if (/logo/i.test(alt) && alt.length >= 3 && alt.length <= 90) {
      const cleanedAlt = cleanText(alt.replace(/\blogo\b|\bimage\b|\bfor\b|\bof\b/gi, ""));
      addCandidate(candidatePool, cleanedAlt, img, "image-alt-company", {
        imageAltCompany: true,
        companySelector: true,
      });
    }
  });

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
  if (!isLinkedIn || !hasAny(inferredTitle.position, platformTerms)) {
    addCandidate(candidatePool, inferredTitle.position, null, "document-title");
  }
  if (!isLinkedIn || !hasAny(inferredTitle.company, platformTerms)) {
    addCandidate(candidatePool, inferredTitle.company, null, "document-title");
  }

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
  const employerContextSelectors = [
    '[class*="employer"]',
    '[class*="Employer"]',
    '[class*="organisation"]',
    '[class*="Organisation"]',
    '[class*="organization"]',
    '[class*="Organization"]',
    '[data-test*="employer"]',
    '[data-test*="organisation"]',
    '[data-test*="organization"]',
  ];
  const linkedinTitleSelectors = [
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title a",
    ".jobs-details-top-card__job-title",
    ".jobs-search__job-details--container h1",
    ".jobs-search-results-list__list-item--active .job-card-list__title",
    ".jobs-search-results-list__list-item--active .job-card-container__link",
    '.job-card-container[aria-current="page"] .job-card-list__title',
    '.job-card-container[aria-selected="true"] .job-card-list__title'
  ];
  const linkedinCompanySelectors = [
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name",
    ".jobs-details-top-card__company-url",
    ".job-details-jobs-unified-top-card__primary-description-container a",
    ".jobs-search-results-list__list-item--active .job-card-container__primary-description",
    '.job-card-container[aria-current="page"] .job-card-container__primary-description',
    '.job-card-container[aria-selected="true"] .job-card-container__primary-description'
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
  for (const sel of employerContextSelectors) {
    document.querySelectorAll(sel).forEach((el) => {
      const text = textFromElement(el);
      if (text && text.length <= 100) {
        addCandidate(candidatePool, text.replace(/\s+verified employer$/i, ""), el, "employer-context", {
          companySelector: true,
        });
      }
      el.querySelectorAll("a, span, strong, h2, h3").forEach((child) => {
        addCandidate(candidatePool, textFromElement(child).replace(/\s+verified employer$/i, ""), child, "employer-context", {
          companySelector: true,
        });
      });
    });
  }
  if (isLinkedIn) {
    for (const sel of linkedinTitleSelectors) {
      document.querySelectorAll(sel).forEach((el) => {
        addCandidate(candidatePool, textFromElement(el), el, "linkedin-title", {
          linkedinTitle: true,
          linkedinSelectedCard: sel.includes("list-item") || sel.includes("job-card-container"),
        });
      });
    }
    for (const sel of linkedinCompanySelectors) {
      document.querySelectorAll(sel).forEach((el) => {
        addCandidate(candidatePool, textFromElement(el), el, "linkedin-company", {
          linkedinCompany: true,
          linkedinSelectedCard: sel.includes("list-item") || sel.includes("job-card-container"),
        });
      });
    }
  }

  detailLayer = findBestDetailLayer();
  if (detailLayer) {
    const layerRect = detailLayer.getBoundingClientRect();
    const layerHeadings = Array.from(detailLayer.querySelectorAll("h1, h2, h3"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= layerRect.top - 4 && r.top <= layerRect.top + Math.max(260, layerRect.height * 0.28);
      });
    for (const h of layerHeadings) {
      addCandidate(candidatePool, textFromElement(h), h, "detail-layer-title", {
        detailLayerTitle: true,
        headingLevel: h.tagName.toLowerCase(),
        inDetailPanel: true,
      });
    }

    for (const sel of [
      '[class*="title"]',
      '[class*="Title"]',
      '[data-test*="title"]',
      '[data-automation-id*="title"]',
    ]) {
      detailLayer.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top > layerRect.top + Math.max(260, layerRect.height * 0.28)) return;
        addCandidate(candidatePool, textFromElement(el), el, "detail-layer-title", {
          detailLayerTitle: true,
          inDetailPanel: true,
        });
      });
    }
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
  let panel = detailLayer;
  if (!panel && jobHeading) {
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

  if (detailLayer && jobHeading && detailLayer.contains(jobHeading)) {
    const headingRect = jobHeading.getBoundingClientRect();
    const layerRect = detailLayer.getBoundingClientRect();
    const maxTop = Math.min(layerRect.bottom, headingRect.bottom + 220);
    for (const el of detailLayer.querySelectorAll("a, span, p, div, strong")) {
      if (el === jobHeading || el.contains(jobHeading)) continue;
      const text = textFromElement(el);
      if (!text) continue;
      const r = el.getBoundingClientRect();
      if (r.top < headingRect.top - 40 || r.top > maxTop) continue;
      addCandidate(candidatePool, text, el, "detail-layer-company", {
        detailLayerCompany: true,
        nearTitle: true,
        linkLike: el.tagName.toLowerCase() === "a",
      });
    }
  }

  if (structuredJob && structuredJob.url) jobUrl = structuredJob.url;

  const finalTitle = bestCandidate(candidatePool.items, scoreTitle);
  const rankedCompanies = candidatePool.items
    .map((candidate) => ({ ...candidate, score: scoreCompany(candidate, finalTitle) }))
    .filter((candidate) => textSimilarity(candidate.text, finalTitle?.text || "") < 0.9)
    .sort((a, b) => b.score - a.score);
  const finalCompany = rankedCompanies[0] || null;
  const detailTitle = finalTitle?.text || cleanText(document.title);
  let companyName = finalCompany?.text || "";
  if (textKey(companyName) === textKey(detailTitle)) {
    const nextCompany = rankedCompanies.find((candidate) => textKey(candidate.text) !== textKey(detailTitle));
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
  resetSaveState();
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
  if (hasSavedCurrentCapture) {
    setMessage("这个岗位已经保存成功了，避免重复保存。", "ok");
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
    hasSavedCurrentCapture = true;
    saveBtn.textContent = "已保存";
    saveBtn.disabled = true;
    captureHint.textContent = "保存成功。这个岗位已经进入 Dashboard，请不要重复保存。";
    setMessage(`保存成功：${data.company_name} - ${data.position_name}`, "ok");
  } catch (error) {
    setMessage(error.message, "error");
    saveBtn.disabled = false;
  } finally {
    isSaving = false;
    recaptureBtn.disabled = false;
  }
}

recaptureBtn.addEventListener("click", () => {
  captureCurrentPage().catch((error) => setMessage(error.message, "error"));
});
openDashboardBtn.addEventListener("click", openDashboard);
closePopupBtn.addEventListener("click", closePopup);
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

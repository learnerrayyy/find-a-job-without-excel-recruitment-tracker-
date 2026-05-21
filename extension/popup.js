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

  // 1. JSON-LD structured data
  let structuredJob = null;
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const parsed = JSON.parse(script.textContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && item["@type"] === "JobPosting") structuredJob = item;
      }
    } catch (_) {}
  });

  // 2. Find the visible job-title heading in the right portion of the viewport
  //    (skips left-column section headings like "Recommended Jobs For You")
  let jobHeading = null;
  for (const h of document.querySelectorAll("h1, h2")) {
    const r = h.getBoundingClientRect();
    const text = h.innerText.trim();
    if (!text || text.length < 3 || text.length > 200) continue;
    if (r.top < 40 || r.bottom > vh || r.left < vw * 0.25) continue;
    jobHeading = h;
    break;
  }

  // 3. Find company name — try data-test / class-name patterns first,
  //    then look for a short visible text element just below the job heading
  let companyName = "";
  const companyEl = document.querySelector(
    '[data-test="employer-name"], [class*="employerName"], [class*="EmployerName"], ' +
    '[class*="companyName"], [class*="CompanyName"], [class*="employer-name"]'
  );
  if (companyEl) {
    const r = companyEl.getBoundingClientRect();
    if (r.top > 0 && r.top < vh) companyName = companyEl.innerText.trim();
  }
  if (!companyName && jobHeading) {
    // Walk up to find the header block, then scan its descendant short-text nodes
    let block = jobHeading.parentElement;
    for (let i = 0; i < 6 && block && block !== document.body; i++, block = block.parentElement) {
      if ((block.innerText || "").trim().length > 600) break; // found the header container
    }
    if (block) {
      for (const el of block.querySelectorAll("a, span, p, div")) {
        if (el.contains(jobHeading)) continue;
        const r = el.getBoundingClientRect();
        if (r.top < jobHeading.getBoundingClientRect().bottom) continue; // must be below heading
        if (r.top > jobHeading.getBoundingClientRect().bottom + 120) break;
        const text = el.innerText.trim();
        if (text && text.length >= 2 && text.length <= 80 && !text.includes("\n")) {
          companyName = text;
          break;
        }
      }
    }
  }

  // 4. Job-specific URL — try active card link in left panel first
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

  // 5. Walk up from heading to find the detail panel
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

  // 6. Title: right-panel H1 > JSON-LD
  let detailTitle = (jobHeading && jobHeading.innerText.trim()) || "";
  if (!detailTitle && panel) { const h = panel.querySelector("h1, h2"); if (h) detailTitle = h.innerText.trim(); }
  if (structuredJob && structuredJob.title) detailTitle = structuredJob.title;
  if (!detailTitle) detailTitle = document.title || "";

  // 7. JSON-LD overrides for company + URL when available
  if (structuredJob) {
    const org = structuredJob.hiringOrganization;
    const ldCompany = typeof org === "object" ? org?.name : (typeof org === "string" ? org : "");
    if (ldCompany) companyName = ldCompany;
    if (structuredJob.url) jobUrl = structuredJob.url;
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

  // Company name: captured element > JSON-LD > infer from title
  if (!companyInput.value) {
    companyInput.value = capturedPage.companyName || inferFromTitle(capturedPage.title).company || "";
  }
  // Position: JSON-LD title > right-panel H1 > infer from title
  if (!positionInput.value) {
    positionInput.value = capturedPage.title || inferFromTitle(document && "" || "").position || "";
  }
  sourceUrlInput.value = capturedPage.url;
  applyUrlInput.value = capturedPage.url;

  if (structuredJob) {
    const schemaDesc = typeof structuredJob.description === "string"
      ? structuredJob.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : "";
    jdContentInput.value = capturedPage.selectedText || schemaDesc || capturedPage.bodyText;
    captureHint.textContent = "已从页面结构化数据抓取，请确认公司名和岗位名。";
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

const API_BASE = "http://127.0.0.1:8765";

const form = document.querySelector("#captureForm");
const companyInput = document.querySelector("#companyInput");
const positionInput = document.querySelector("#positionInput");
const sourceUrlInput = document.querySelector("#sourceUrlInput");
const applyUrlInput = document.querySelector("#applyUrlInput");
const jdContentInput = document.querySelector("#jdContentInput");
const recaptureBtn = document.querySelector("#recaptureBtn");
const saveBtn = document.querySelector("#saveBtn");
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
  const main = document.querySelector("main");
  const bodyText = (main ? main.innerText : document.body.innerText || "").trim();
  const title = document.title || "";

  return {
    title,
    url: window.location.href,
    html: document.documentElement.outerHTML,
    selectedText: selection,
    bodyText,
  };
}

function autofillPageScript(profile) {
  const fields = profile.autofill_fields || profile.parsed_json || {};
  const aliases = [
    { key: "first_name", terms: ["first name", "firstname", "given name", "名"] },
    { key: "last_name", terms: ["last name", "lastname", "family name", "surname", "姓"] },
    { key: "full_name", terms: ["full name", "name", "legal name", "姓名"] },
    { key: "email", terms: ["email", "e-mail", "邮箱", "电子邮件"] },
    { key: "phone", terms: ["phone", "mobile", "telephone", "contact number", "电话", "手机号"] },
    { key: "location", terms: ["location", "city", "address", "current address", "地点", "城市", "地址"] },
    { key: "linkedin", terms: ["linkedin", "linked in"] },
    { key: "github", terms: ["github", "git hub"] },
    { key: "portfolio", terms: ["portfolio", "website", "personal site", "个人网站", "作品集"] },
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
    control.value = value;
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const controls = Array.from(document.querySelectorAll("input, textarea"))
    .filter((control) => !control.disabled && !control.readOnly && !["hidden", "file", "submit", "button", "password", "checkbox", "radio"].includes((control.type || "").toLowerCase()));
  const filled = [];
  const skipped = [];

  for (const control of controls) {
    if (control.value && control.value.trim()) continue;
    const match = valueForControl(control);
    if (!match) {
      skipped.push(textForControl(control).slice(0, 80));
      continue;
    }
    setValue(control, match.value);
    filled.push({ field: match.key, label: textForControl(control).slice(0, 80) });
  }

  const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'))
    .filter((control) => !control.disabled).length;
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
  const inferred = inferFromTitle(capturedPage.title);

  if (!companyInput.value) companyInput.value = inferred.company;
  if (!positionInput.value) positionInput.value = inferred.position;
  sourceUrlInput.value = capturedPage.url;
  applyUrlInput.value = capturedPage.url;
  jdContentInput.value = capturedPage.selectedText || capturedPage.bodyText;

  const source = capturedPage.selectedText ? "选中文本" : "页面正文";
  captureHint.textContent = `已抓取：${source}，HTML 原始页面会一起保存。`;
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
  payload.current_stage = "APPLIED";
  payload.status = "APPLIED_SUCCESS";
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

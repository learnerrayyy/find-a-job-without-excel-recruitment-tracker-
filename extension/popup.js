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

let capturedPage = null;
let isSaving = false;

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

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function captureCurrentPage() {
  setMessage("正在读取当前页面...");
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    throw new Error("找不到当前标签页");
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
  setMessage("请确认公司名和岗位名，然后保存。", "ok");
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
form.addEventListener("submit", saveJob);

checkServer();
captureCurrentPage().catch((error) => setMessage(error.message, "error"));

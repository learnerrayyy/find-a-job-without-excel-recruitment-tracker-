const STATUSES = [
  "ALL",
  "DISCOVERED",
  "SAVED",
  "APPLIED",
  "OA",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "GHOSTED",
  "WITHDRAWN",
];

let jobs = [];
let selectedJob = null;
let activeStatus = "ALL";

const statusFilters = document.querySelector("#statusFilters");
const statusSelect = document.querySelector("#statusSelect");
const jobsTable = document.querySelector("#jobsTable");
const emptyState = document.querySelector("#emptyState");
const summary = document.querySelector("#summary");
const detailPanel = document.querySelector("#detailPanel");
const searchInput = document.querySelector("#searchInput");
const refreshBtn = document.querySelector("#refreshBtn");
const newJobBtn = document.querySelector("#newJobBtn");
const jobDialog = document.querySelector("#jobDialog");
const jobForm = document.querySelector("#jobForm");

function statusLabel(status) {
  const labels = {
    ALL: "全部",
    DISCOVERED: "发现",
    SAVED: "已保存",
    APPLIED: "已投递",
    OA: "OA",
    INTERVIEW: "面试",
    OFFER: "Offer",
    REJECTED: "拒绝",
    GHOSTED: "无回复",
    WITHDRAWN: "已撤回",
  };
  return labels[status] || status;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function renderStatusControls() {
  statusFilters.innerHTML = STATUSES.map((status) => {
    const count = status === "ALL" ? jobs.length : jobs.filter((job) => job.status === status).length;
    return `
      <button class="status-filter ${activeStatus === status ? "active" : ""}" data-status="${status}">
        <span>${statusLabel(status)}</span>
        <span>${count}</span>
      </button>
    `;
  }).join("");

  statusFilters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.status;
      loadJobs();
    });
  });

  statusSelect.innerHTML = STATUSES.filter((status) => status !== "ALL")
    .map((status) => `<option value="${status}">${statusLabel(status)}</option>`)
    .join("");
}

function renderJobs() {
  summary.textContent = `${jobs.length} 个岗位`;
  emptyState.style.display = jobs.length ? "none" : "block";
  jobsTable.innerHTML = jobs.map((job) => `
    <tr data-id="${job.id}">
      <td>${escapeHtml(job.company_name)}</td>
      <td>
        <div class="job-title">
          <strong>${escapeHtml(job.position_name)}</strong>
          <span class="muted">${escapeHtml(job.source_url || "")}</span>
        </div>
      </td>
      <td><span class="badge ${String(job.status).toLowerCase()}">${statusLabel(job.status)}</span></td>
      <td>${escapeHtml(job.apply_time || "-")}</td>
      <td>${job.timeline_count || 0} 条</td>
      <td>
        <div class="link-row">
          <a href="/api/jobs/${job.id}/jd" target="_blank" rel="noreferrer">JD</a>
          ${job.apply_url ? `<a href="${escapeHtml(job.apply_url)}" target="_blank" rel="noreferrer">投递</a>` : ""}
        </div>
      </td>
    </tr>
  `).join("");

  jobsTable.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      selectedJob = jobs.find((job) => String(job.id) === row.dataset.id);
      renderDetail();
    });
  });
}

async function loadJobs() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  if (activeStatus !== "ALL") params.set("status", activeStatus);
  jobs = await api(`/api/jobs?${params.toString()}`);
  renderStatusControls();
  renderJobs();
  if (selectedJob) {
    selectedJob = jobs.find((job) => job.id === selectedJob.id) || selectedJob;
    renderDetail();
  }
}

async function renderDetail() {
  if (!selectedJob) return;
  const timeline = await api(`/api/jobs/${selectedJob.id}/timeline`);
  detailPanel.innerHTML = `
    <p class="eyebrow">Detail</p>
    <h3>${escapeHtml(selectedJob.company_name)}</h3>
    <p><strong>${escapeHtml(selectedJob.position_name)}</strong></p>
    <p class="muted">创建于 ${formatDate(selectedJob.created_at)}</p>

    <div class="detail-actions">
      <label>
        当前状态
        <select id="detailStatus">
          ${STATUSES.filter((status) => status !== "ALL").map((status) => `
            <option value="${status}" ${selectedJob.status === status ? "selected" : ""}>${statusLabel(status)}</option>
          `).join("")}
        </select>
      </label>
      <a href="/api/jobs/${selectedJob.id}/jd" target="_blank" rel="noreferrer">打开本地 JD</a>
      ${selectedJob.source_url ? `<a href="${escapeHtml(selectedJob.source_url)}" target="_blank" rel="noreferrer">打开原始页面</a>` : ""}
      ${selectedJob.apply_url ? `<a href="${escapeHtml(selectedJob.apply_url)}" target="_blank" rel="noreferrer">打开投递入口</a>` : ""}
      <button id="deleteJobBtn">删除岗位</button>
    </div>

    <form class="timeline-form" id="timelineForm">
      <input name="event_title" placeholder="新增 Timeline 事件" required />
      <textarea name="notes" rows="3" placeholder="备注"></textarea>
      <button class="primary">添加事件</button>
    </form>

    <h3>Timeline</h3>
    <div class="timeline-list">
      ${timeline.length ? timeline.map((item) => `
        <div class="timeline-item">
          <p><strong>${escapeHtml(item.event_title)}</strong></p>
          <p class="muted">${formatDate(item.event_time)} · ${escapeHtml(item.source)}</p>
          ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
        </div>
      `).join("") : '<p class="muted">暂无事件。</p>'}
    </div>
  `;

  document.querySelector("#detailStatus").addEventListener("change", async (event) => {
    selectedJob = await api(`/api/jobs/${selectedJob.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: event.target.value }),
    });
    await loadJobs();
  });

  document.querySelector("#deleteJobBtn").addEventListener("click", async () => {
    const ok = window.confirm(`删除 ${selectedJob.company_name} - ${selectedJob.position_name}？`);
    if (!ok) return;
    await api(`/api/jobs/${selectedJob.id}`, { method: "DELETE" });
    selectedJob = null;
    detailPanel.innerHTML = `
      <p class="eyebrow">Detail</p>
      <h3>选择一个岗位</h3>
      <p class="muted">点击表格中的岗位后，可以查看 Timeline、修改状态、打开本地 JD。</p>
    `;
    await loadJobs();
  });

  document.querySelector("#timelineForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    await api(`/api/jobs/${selectedJob.id}/timeline`, {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    event.target.reset();
    await loadJobs();
    await renderDetail();
  });
}

newJobBtn.addEventListener("click", () => jobDialog.showModal());
refreshBtn.addEventListener("click", loadJobs);
searchInput.addEventListener("input", () => {
  clearTimeout(searchInput.searchTimer);
  searchInput.searchTimer = setTimeout(loadJobs, 180);
});

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter && submitter.value === "cancel") {
    jobDialog.close();
    return;
  }
  const payload = Object.fromEntries(new FormData(jobForm).entries());
  await api("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  jobForm.reset();
  jobDialog.close();
  await loadJobs();
});

renderStatusControls();
loadJobs().catch((error) => {
  summary.textContent = error.message;
});

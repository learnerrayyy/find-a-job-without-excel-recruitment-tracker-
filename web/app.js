const NAV_FILTERS = ["ALL", "REJECTED"];
const STATUS_OPTIONS = [
  "APPLIED",
  "OA_PENDING",
  "OA_COMPLETED",
  "INTERVIEW_PENDING",
  "INTERVIEW_COMPLETED",
  "REJECTED",
];
const CUSTOM_STATUS_VALUE = "__CUSTOM__";

let jobs = [];
let allJobs = [];
let timelineJob = null;
let activeStatus = "ALL";

const statusFilters = document.querySelector("#statusFilters");
const statusSelect = document.querySelector("#statusSelect");
const jobsTable = document.querySelector("#jobsTable");
const emptyState = document.querySelector("#emptyState");
const summary = document.querySelector("#summary");
const searchInput = document.querySelector("#searchInput");
const refreshBtn = document.querySelector("#refreshBtn");
const newJobBtn = document.querySelector("#newJobBtn");
const jobDialog = document.querySelector("#jobDialog");
const jobForm = document.querySelector("#jobForm");
const customStatusField = document.querySelector("#customStatusField");
const customStatusInput = document.querySelector("#customStatusInput");
const jdDialog = document.querySelector("#jdDialog");
const jdDialogTitle = document.querySelector("#jdDialogTitle");
const openOriginalJd = document.querySelector("#openOriginalJd");
const openSavedJd = document.querySelector("#openSavedJd");
const openSavedHtml = document.querySelector("#openSavedHtml");
const editDialog = document.querySelector("#editDialog");
const editForm = document.querySelector("#editForm");
const editJobId = document.querySelector("#editJobId");
const editCompanyName = document.querySelector("#editCompanyName");
const editPositionName = document.querySelector("#editPositionName");
const editSourceUrl = document.querySelector("#editSourceUrl");
const editApplyUrl = document.querySelector("#editApplyUrl");
const editApplyTime = document.querySelector("#editApplyTime");
const editStatusSelect = document.querySelector("#editStatusSelect");
const editCustomStatusField = document.querySelector("#editCustomStatusField");
const editCustomStatusInput = document.querySelector("#editCustomStatusInput");
const timelineDialog = document.querySelector("#timelineDialog");
const timelineDialogTitle = document.querySelector("#timelineDialogTitle");
const timelineDialogMeta = document.querySelector("#timelineDialogMeta");
const timelineForm = document.querySelector("#timelineForm");
const timelineList = document.querySelector("#timelineList");

function statusLabel(status) {
  const labels = {
    ALL: "全部",
    APPLIED: "已投递",
    OA_PENDING: "有笔试未完成",
    OA_COMPLETED: "有笔试已完成",
    INTERVIEW_PENDING: "有面试未完成",
    INTERVIEW_COMPLETED: "已面试",
    REJECTED: "拒绝",
  };
  return labels[status] || status;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
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
  statusFilters.innerHTML = NAV_FILTERS.map((status) => {
    const count = status === "ALL" ? allJobs.length : allJobs.filter((job) => job.status === status).length;
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

  statusSelect.innerHTML = STATUS_OPTIONS.map((status) => (
    `<option value="${status}" ${status === "APPLIED" ? "selected" : ""}>${statusLabel(status)}</option>`
  )).join("") + `<option value="${CUSTOM_STATUS_VALUE}">自定义...</option>`;
}

function statusOptionsForValue(value) {
  const hasCustomValue = value && !STATUS_OPTIONS.includes(value);
  return [
    ...STATUS_OPTIONS.map((status) => (
      `<option value="${status}" ${value === status ? "selected" : ""}>${statusLabel(status)}</option>`
    )),
    hasCustomValue ? `<option value="${escapeHtml(value)}" selected>${escapeHtml(value)}</option>` : "",
    `<option value="${CUSTOM_STATUS_VALUE}">自定义...</option>`,
  ].join("");
}

function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
  }
  return date.toISOString().slice(0, 10);
}

function renderJobs() {
  summary.textContent = `${jobs.length} 个岗位`;
  emptyState.style.display = jobs.length ? "none" : "block";
  jobsTable.innerHTML = jobs.map((job) => `
    <tr>
      <td>${escapeHtml(formatDate(job.apply_time || job.created_at))}</td>
      <td>
        <button class="job-link" data-action="jd" data-id="${job.id}">
          ${escapeHtml(job.position_name)}
        </button>
        <div class="muted">${escapeHtml(job.company_name)}</div>
      </td>
      <td>
        <select class="inline-status" data-action="status" data-id="${job.id}">
          ${statusOptionsForValue(job.status)}
        </select>
      </td>
      <td>
        <button class="timeline-button" data-action="timeline" data-id="${job.id}">
          ${job.timeline_count || 0} 条
        </button>
      </td>
      <td>
        <div class="operation-stack">
          <button data-action="edit" data-id="${job.id}">编辑</button>
          <button class="danger-button" data-action="delete" data-id="${job.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join("");

  jobsTable.querySelectorAll("[data-action='jd']").forEach((button) => {
    button.addEventListener("click", () => {
      const job = jobs.find((item) => String(item.id) === button.dataset.id);
      if (job) openJdDialogForJob(job);
    });
  });

  jobsTable.querySelectorAll("[data-action='status']").forEach((select) => {
    select.addEventListener("change", async () => {
      const job = jobs.find((item) => String(item.id) === select.dataset.id);
      if (!job) return;
      let nextStatus = select.value;
      if (nextStatus === CUSTOM_STATUS_VALUE) {
        nextStatus = window.prompt("请输入自定义状态", job.status || "");
        if (!nextStatus || !nextStatus.trim()) {
          select.value = job.status;
          return;
        }
        nextStatus = nextStatus.trim();
      }
      await api(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (timelineJob && timelineJob.id === job.id) {
        timelineJob = { ...timelineJob, status: nextStatus };
        await renderTimelineDialog(timelineJob);
      }
      await loadJobs();
    });
  });

  jobsTable.querySelectorAll("[data-action='timeline']").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = jobs.find((item) => String(item.id) === button.dataset.id);
      if (!job) return;
      timelineJob = job;
      await renderTimelineDialog(job);
      timelineDialog.showModal();
    });
  });

  jobsTable.querySelectorAll("[data-action='edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const job = jobs.find((item) => String(item.id) === button.dataset.id);
      if (job) openEditDialogForJob(job);
    });
  });

  jobsTable.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = jobs.find((item) => String(item.id) === button.dataset.id);
      if (!job) return;
      const ok = window.confirm(
        `确认删除这个岗位吗？\n\n${job.company_name} - ${job.position_name}\n\n删除后会同时删除本地保存的 JD 文件夹。`
      );
      if (!ok) return;
      await api(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (timelineJob && timelineJob.id === job.id) {
        timelineJob = null;
        timelineDialog.close();
      }
      await loadJobs();
    });
  });
}

async function loadJobs() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  allJobs = await api(`/api/jobs?${params.toString()}`);
  jobs = activeStatus === "ALL" ? allJobs : allJobs.filter((job) => job.status === activeStatus);
  renderStatusControls();
  renderJobs();
}

function openEditDialogForJob(job) {
  editJobId.value = job.id;
  editCompanyName.value = job.company_name || "";
  editPositionName.value = job.position_name || "";
  editSourceUrl.value = job.source_url || "";
  editApplyUrl.value = job.apply_url || "";
  editApplyTime.value = dateInputValue(job.apply_time || job.created_at);
  editStatusSelect.innerHTML = statusOptionsForValue(job.status);
  editCustomStatusField.hidden = true;
  editCustomStatusInput.required = false;
  editCustomStatusInput.value = "";
  editDialog.showModal();
}

async function renderTimelineDialog(job) {
  const timeline = await api(`/api/jobs/${job.id}/timeline`);
  timelineDialogTitle.textContent = job.position_name;
  timelineDialogMeta.textContent = `${job.company_name} · ${statusLabel(job.status)}`;
  timelineList.innerHTML = timeline.length ? timeline.map((item) => `
    <div class="timeline-item">
      <p><strong>${escapeHtml(item.event_title)}</strong></p>
      <p class="muted">${formatDate(item.event_time)} · ${escapeHtml(item.source)}</p>
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
    </div>
  `).join("") : '<p class="muted">暂无事件。</p>';
}

function openJdDialogForJob(job) {
  jdDialogTitle.textContent = `${job.company_name} - ${job.position_name}`;
  openSavedJd.href = `/api/jobs/${job.id}/jd`;
  openSavedHtml.href = `/api/jobs/${job.id}/html`;

  if (job.source_url) {
    openOriginalJd.href = job.source_url;
    openOriginalJd.removeAttribute("aria-disabled");
    openOriginalJd.classList.remove("disabled");
  } else {
    openOriginalJd.href = "#";
    openOriginalJd.setAttribute("aria-disabled", "true");
    openOriginalJd.classList.add("disabled");
  }

  jdDialog.showModal();
}

newJobBtn.addEventListener("click", () => jobDialog.showModal());
refreshBtn.addEventListener("click", loadJobs);
searchInput.addEventListener("input", () => {
  clearTimeout(searchInput.searchTimer);
  searchInput.searchTimer = setTimeout(loadJobs, 180);
});

statusSelect.addEventListener("change", () => {
  const isCustom = statusSelect.value === CUSTOM_STATUS_VALUE;
  customStatusField.hidden = !isCustom;
  customStatusInput.required = isCustom;
  if (isCustom) customStatusInput.focus();
});

editStatusSelect.addEventListener("change", () => {
  const isCustom = editStatusSelect.value === CUSTOM_STATUS_VALUE;
  editCustomStatusField.hidden = !isCustom;
  editCustomStatusInput.required = isCustom;
  if (isCustom) editCustomStatusInput.focus();
});

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter && submitter.value === "cancel") {
    jobDialog.close();
    return;
  }
  const payload = Object.fromEntries(new FormData(jobForm).entries());
  if (payload.status === CUSTOM_STATUS_VALUE) {
    payload.status = (payload.custom_status || "").trim();
  }
  delete payload.custom_status;
  payload.status = payload.status || "APPLIED";
  await api("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  jobForm.reset();
  customStatusField.hidden = true;
  customStatusInput.required = false;
  jobDialog.close();
  await loadJobs();
});

jdDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-close]")) {
    jdDialog.close();
  }
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter && submitter.value === "cancel") {
    editDialog.close();
    return;
  }

  const payload = Object.fromEntries(new FormData(editForm).entries());
  const jobId = payload.id;
  delete payload.id;

  if (payload.status === CUSTOM_STATUS_VALUE) {
    payload.status = (payload.custom_status || "").trim();
  }
  delete payload.custom_status;
  payload.status = payload.status || "APPLIED";

  await api(`/api/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  editDialog.close();
  await loadJobs();

  if (timelineJob && String(timelineJob.id) === String(jobId)) {
    timelineJob = { ...timelineJob, ...payload };
    await renderTimelineDialog(timelineJob);
  }
});

editDialog.addEventListener("close", () => {
  editCustomStatusField.hidden = true;
  editCustomStatusInput.required = false;
  editCustomStatusInput.value = "";
});

timelineDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-timeline]")) {
    timelineDialog.close();
  }
});

timelineForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!timelineJob) return;
  const form = new FormData(event.target);
  await api(`/api/jobs/${timelineJob.id}/timeline`, {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(form.entries())),
  });
  event.target.reset();
  await loadJobs();
  await renderTimelineDialog(timelineJob);
});

renderStatusControls();
loadJobs().catch((error) => {
  summary.textContent = error.message;
});

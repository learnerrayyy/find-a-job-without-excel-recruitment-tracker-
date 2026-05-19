const NAV_FILTERS = ["ALL", "PART_TIME", "FULL_TIME", "INTERNSHIP", "REJECTED"];
const JOB_TYPE_OPTIONS = ["PART_TIME", "FULL_TIME", "INTERNSHIP"];
const STAGE_OPTIONS = ["APPLIED", "ASSESSMENT", "INTERVIEW"];
const SUBSTATUS_BY_STAGE = {
  APPLIED: ["APPLIED_SUCCESS", "APPLIED_REJECTED"],
  ASSESSMENT: [
    "ASSESSMENT_PENDING",
    "OA",
    "VI",
    "TECH_TEST",
    "ASSESSMENT_COMPLETED",
    "ASSESSMENT_REJECTED",
  ],
  INTERVIEW: [
    "INTERVIEW_1",
    "INTERVIEW_2",
    "INTERVIEW_FINAL",
    "INTERVIEW_COMPLETED",
    "INTERVIEW_REJECTED",
  ],
};
const CUSTOM_STATUS_VALUE = "__CUSTOM__";

let jobs = [];
let allJobs = [];
let resumeProfiles = [];
let userProfile = {};
let timelineJob = null;
let activeStatus = "ALL";
let activeView = "APPLICATIONS";

const statusFilters = document.querySelector("#statusFilters");
const jobsTable = document.querySelector("#jobsTable");
const emptyState = document.querySelector("#emptyState");
const mainTitle = document.querySelector("#mainTitle");
const summary = document.querySelector("#summary");
const searchInput = document.querySelector("#searchInput");
const refreshBtn = document.querySelector("#refreshBtn");
const newJobBtn = document.querySelector("#newJobBtn");
const applicationsView = document.querySelector("#applicationsView");
const summaryView = document.querySelector("#summaryView");
const summaryNavButton = document.querySelector("#summaryNavButton");
const profilesView = document.querySelector("#profilesView");
const profilesGrid = document.querySelector("#profilesGrid");
const profilesEmpty = document.querySelector("#profilesEmpty");
const profilesNavButton = document.querySelector("#profilesNavButton");
const editPersonalInfoBtn = document.querySelector("#editPersonalInfoBtn");
const jobDialog = document.querySelector("#jobDialog");
const jobForm = document.querySelector("#jobForm");
const jobTypeSelect = document.querySelector("#jobTypeSelect");
const stageSelect = document.querySelector("#stageSelect");
const subStatusSelect = document.querySelector("#subStatusSelect");
const customSubStatusField = document.querySelector("#customSubStatusField");
const customSubStatusInput = document.querySelector("#customSubStatusInput");
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
const editJobTypeSelect = document.querySelector("#editJobTypeSelect");
const editStageSelect = document.querySelector("#editStageSelect");
const editSubStatusSelect = document.querySelector("#editSubStatusSelect");
const editCustomSubStatusField = document.querySelector("#editCustomSubStatusField");
const editCustomSubStatusInput = document.querySelector("#editCustomSubStatusInput");
const timelineDialog = document.querySelector("#timelineDialog");
const timelineDialogTitle = document.querySelector("#timelineDialogTitle");
const timelineDialogMeta = document.querySelector("#timelineDialogMeta");
const timelineForm = document.querySelector("#timelineForm");
const timelineList = document.querySelector("#timelineList");
const profileDialog = document.querySelector("#profileDialog");
const profileForm = document.querySelector("#profileForm");
const profileEditDialog = document.querySelector("#profileEditDialog");
const profileEditForm = document.querySelector("#profileEditForm");
const profileEditId = document.querySelector("#profileEditId");
const profileEditName = document.querySelector("#profileEditName");
const profileEditTags = document.querySelector("#profileEditTags");
const profileEditEmail = document.querySelector("#profileEditEmail");
const profileEditLinkedin = document.querySelector("#profileEditLinkedin");
const profileEditGithub = document.querySelector("#profileEditGithub");
const profileEditPortfolio = document.querySelector("#profileEditPortfolio");
const personalInfoDialog = document.querySelector("#personalInfoDialog");
const personalInfoForm = document.querySelector("#personalInfoForm");
const profileDetailDialog = document.querySelector("#profileDetailDialog");
const profileDetailTitle = document.querySelector("#profileDetailTitle");
const profileDetailFile = document.querySelector("#profileDetailFile");
const profileDetailText = document.querySelector("#profileDetailText");

function statusLabel(status) {
  const labels = {
    ALL: "全部",
    PART_TIME: "Part time",
    FULL_TIME: "Full time",
    INTERNSHIP: "Internship",
    APPLIED_SUCCESS: "投递成功",
    APPLIED_REJECTED: "投递阶段被拒",
    ASSESSMENT_PENDING: "笔试未完成",
    OA: "OA",
    VI: "VI",
    TECH_TEST: "技术笔试",
    ASSESSMENT_COMPLETED: "笔试已完成",
    ASSESSMENT_REJECTED: "笔试阶段被拒",
    INTERVIEW_1: "第一次面试",
    INTERVIEW_2: "第二次面试",
    INTERVIEW_FINAL: "终面",
    INTERVIEW_COMPLETED: "已面试",
    INTERVIEW_REJECTED: "面试阶段被拒",
    REJECTED: "拒绝",
  };
  return labels[status] || status;
}

function stageLabel(stage) {
  const labels = {
    APPLIED: "投递",
    ASSESSMENT: "笔试",
    INTERVIEW: "面试",
  };
  return labels[stage] || stage;
}

function jobTypeLabel(jobType) {
  const labels = {
    PART_TIME: "Part time",
    FULL_TIME: "Full time",
    INTERNSHIP: "Internship",
  };
  return labels[jobType] || jobType || "Full time";
}

function isRejected(job) {
  return String(job.status || "").includes("REJECTED");
}

function matchesNavFilter(job, filter) {
  if (filter === "ALL") return true;
  if (filter === "REJECTED") return isRejected(job);
  return job.job_type === filter;
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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result).split(",", 2)[1] || ""));
    reader.addEventListener("error", () => reject(reader.error || new Error("File read failed")));
    reader.readAsDataURL(file);
  });
}

function profileFields(profile) {
  return profile.parsed_json || {};
}

function fieldValue(profile, key) {
  return profileFields(profile)[key] || "";
}

function mergedAutofillFields(profile) {
  return { ...userProfile, ...profileFields(profile) };
}

function renderStatusControls() {
  statusFilters.innerHTML = NAV_FILTERS.map((status) => {
    const count = allJobs.filter((job) => matchesNavFilter(job, status)).length;
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
      activeView = "APPLICATIONS";
      loadJobs();
    });
  });

  renderStageSelect(stageSelect, "APPLIED");
  renderJobTypeSelect(jobTypeSelect, "FULL_TIME");
  renderSubStatusSelect(subStatusSelect, "APPLIED", "APPLIED_SUCCESS");
}

function renderStageSelect(select, value) {
  select.innerHTML = STAGE_OPTIONS.map((stage) => (
    `<option value="${stage}" ${value === stage ? "selected" : ""}>${stageLabel(stage)}</option>`
  )).join("");
}

function renderJobTypeSelect(select, value = "FULL_TIME") {
  select.innerHTML = JOB_TYPE_OPTIONS.map((jobType) => (
    `<option value="${jobType}" ${value === jobType ? "selected" : ""}>${jobTypeLabel(jobType)}</option>`
  )).join("");
}

function subStatusOptionsForStage(stage, value) {
  const known = SUBSTATUS_BY_STAGE[stage] || [];
  const hasCustomValue = value && !known.includes(value);
  return [
    ...known.map((status) => (
      `<option value="${status}" ${value === status ? "selected" : ""}>${statusLabel(status)}</option>`
    )),
    hasCustomValue ? `<option value="${escapeHtml(value)}" selected>${escapeHtml(value)}</option>` : "",
    `<option value="${CUSTOM_STATUS_VALUE}">自定义...</option>`,
  ].join("");
}

function renderSubStatusSelect(select, stage, value) {
  const fallback = (SUBSTATUS_BY_STAGE[stage] || [])[0] || "";
  select.innerHTML = subStatusOptionsForStage(stage, value || fallback);
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
    <tr class="${isRejected(job) ? "rejected-row" : ""}">
      <td>${escapeHtml(formatDate(job.apply_time || job.created_at))}</td>
      <td>
        <button class="job-link" data-action="jd" data-id="${job.id}">
          ${escapeHtml(job.position_name)}
        </button>
        <div class="muted">${escapeHtml(job.company_name)}</div>
      </td>
      <td>
        <select class="inline-status" data-action="jobtype" data-id="${job.id}">
          ${JOB_TYPE_OPTIONS.map((jobType) => `
            <option value="${jobType}" ${(job.job_type || "FULL_TIME") === jobType ? "selected" : ""}>${jobTypeLabel(jobType)}</option>
          `).join("")}
        </select>
      </td>
      <td>
        <select class="inline-status" data-action="stage" data-id="${job.id}">
          ${STAGE_OPTIONS.map((stage) => `
            <option value="${stage}" ${job.current_stage === stage ? "selected" : ""}>${stageLabel(stage)}</option>
          `).join("")}
        </select>
      </td>
      <td>
        <select class="inline-status" data-action="substatus" data-id="${job.id}">
          ${subStatusOptionsForStage(job.current_stage, job.status)}
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

  jobsTable.querySelectorAll("[data-action='stage']").forEach((select) => {
    select.addEventListener("change", async () => {
      const job = jobs.find((item) => String(item.id) === select.dataset.id);
      if (!job) return;
      const nextStage = select.value;
      const nextStatus = (SUBSTATUS_BY_STAGE[nextStage] || [])[0] || job.status;
      await api(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ current_stage: nextStage, status: nextStatus }),
      });
      if (timelineJob && timelineJob.id === job.id) {
        timelineJob = { ...timelineJob, current_stage: nextStage, status: nextStatus };
        await renderTimelineDialog(timelineJob);
      }
      await loadJobs();
    });
  });

  jobsTable.querySelectorAll("[data-action='jobtype']").forEach((select) => {
    select.addEventListener("change", async () => {
      const job = jobs.find((item) => String(item.id) === select.dataset.id);
      if (!job) return;
      await api(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ job_type: select.value }),
      });
      await loadJobs();
    });
  });

  jobsTable.querySelectorAll("[data-action='substatus']").forEach((select) => {
    select.addEventListener("change", async () => {
      const job = jobs.find((item) => String(item.id) === select.dataset.id);
      if (!job) return;
      let nextStatus = select.value;
      if (nextStatus === CUSTOM_STATUS_VALUE) {
        nextStatus = window.prompt("请输入自定义子状态", job.status || "");
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

function renderViewShell() {
  const isSummary = activeView === "SUMMARY";
  const isProfiles = activeView === "PROFILES";
  applicationsView.hidden = isSummary || isProfiles;
  summaryView.hidden = !isSummary;
  profilesView.hidden = !isProfiles;
  newJobBtn.hidden = isSummary;
  newJobBtn.textContent = isProfiles ? "+ 新增 Profile" : "+ 新增岗位";
  mainTitle.textContent = isSummary ? "Summarize" : isProfiles ? "Resume Profiles" : "Applications";
  summaryNavButton.classList.toggle("active", isSummary);
  profilesNavButton.classList.toggle("active", isProfiles);
}

function percent(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function buildSummaryStats() {
  const total = allJobs.length;
  const appliedRejectedJobs = allJobs.filter((job) => job.status === "APPLIED_REJECTED");
  const assessmentTotal = allJobs.filter((job) => (
    job.current_stage === "ASSESSMENT" || job.current_stage === "INTERVIEW"
  )).length;
  const assessmentRejectedJobs = allJobs.filter((job) => job.status === "ASSESSMENT_REJECTED");
  const interviewTotal = allJobs.filter((job) => job.current_stage === "INTERVIEW").length;
  const interviewRejectedJobs = allJobs.filter((job) => job.status === "INTERVIEW_REJECTED");

  return {
    total,
    appliedRejected: appliedRejectedJobs.length,
    assessmentTotal,
    assessmentRejected: assessmentRejectedJobs.length,
    interviewTotal,
    interviewRejected: interviewRejectedJobs.length,
    rejectedBreakdown: {
      applied: appliedRejectedJobs,
      assessment: assessmentRejectedJobs,
      interview: interviewRejectedJobs,
    },
    activeOrUnknown: Math.max(
      total - appliedRejectedJobs.length - assessmentRejectedJobs.length - interviewRejectedJobs.length,
      0
    ),
  };
}

function sankeyWidth(count, total) {
  if (!count || !total) return 0;
  return Math.max(8, Math.round((count / total) * 48));
}

function sankeyFlow({ from, to, count, total, color, title }) {
  if (!count) return "";
  const width = sankeyWidth(count, total);
  const mid = (from.x + to.x) / 2;
  return `
    <path
      class="sankey-flow"
      d="M ${from.x} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}"
      stroke="${color}"
      stroke-width="${width}"
    >
      <title>${title || `${count} 个 · ${percent(count, total)}`}</title>
    </path>
  `;
}

function sankeyNode({ x, y, title, count, total, tone = "", tooltip = "" }) {
  return `
    <g class="sankey-node ${tone}" transform="translate(${x}, ${y})">
      ${tooltip ? `<title>${escapeHtml(tooltip)}</title>` : ""}
      <rect width="126" height="58" rx="8"></rect>
      <text x="12" y="22">${title}</text>
      <text x="12" y="45" class="node-count">${count} · ${percent(count, total)}</text>
    </g>
  `;
}

function renderSankey(stats) {
  const total = stats.total;
  const rejectedTotal = stats.appliedRejected + stats.assessmentRejected + stats.interviewRejected;
  const stageNodes = [
    { key: "root", title: "全部投递", count: total, x: 80, y: 140 },
  ];
  if (stats.assessmentTotal > 0) {
    stageNodes.push({ key: "assessment", title: "笔试", count: stats.assessmentTotal, x: 330, y: 140 });
  }
  if (stats.interviewTotal > 0) {
    stageNodes.push({ key: "interview", title: "面试", count: stats.interviewTotal, x: 580, y: 140 });
  }

  const rejectedTooltip = [
    stats.appliedRejected ? `投递阶段：${stats.appliedRejected} 个 ${stats.rejectedBreakdown.applied.map((job) => statusLabel(job.status)).join("、")}` : "",
    stats.assessmentRejected ? `笔试阶段：${stats.assessmentRejected} 个 ${stats.rejectedBreakdown.assessment.map((job) => statusLabel(job.status)).join("、")}` : "",
    stats.interviewRejected ? `面试阶段：${stats.interviewRejected} 个 ${stats.rejectedBreakdown.interview.map((job) => statusLabel(job.status)).join("、")}` : "",
  ].filter(Boolean).join("\n");

  const rejectedNode = rejectedTotal
    ? { key: "rejected", title: "被拒", count: rejectedTotal, x: 330, y: 260, tooltip: rejectedTooltip }
    : null;

  const root = stageNodes[0];
  const assessment = stageNodes.find((node) => node.key === "assessment");
  const interview = stageNodes.find((node) => node.key === "interview");

  return `
    <div class="sankey-card">
      <svg class="sankey-diagram" viewBox="0 0 760 360" role="img" aria-label="Application Sankey Diagram">
        <g class="sankey-flows">
          ${assessment ? sankeyFlow({
            from: { x: root.x + 126, y: root.y + 29 },
            to: { x: assessment.x, y: assessment.y + 29 },
            count: stats.assessmentTotal,
            total,
            color: "#0f766e",
            title: `进入笔试：${stats.assessmentTotal} 个`,
          }) : ""}
          ${interview ? sankeyFlow({
            from: { x: (assessment || root).x + 126, y: (assessment || root).y + 29 },
            to: { x: interview.x, y: interview.y + 29 },
            count: stats.interviewTotal,
            total,
            color: "#0f766e",
            title: `进入面试：${stats.interviewTotal} 个`,
          }) : ""}
          ${rejectedNode ? sankeyFlow({
            from: { x: root.x + 63, y: root.y + 58 },
            to: { x: rejectedNode.x + 63, y: rejectedNode.y },
            count: rejectedTotal,
            total,
            color: "#d92d20",
            title: rejectedTooltip || `被拒：${rejectedTotal} 个`,
          }) : ""}
        </g>

        ${stageNodes.map((node) => sankeyNode({ ...node, total })).join("")}
        ${rejectedNode ? sankeyNode({ ...rejectedNode, total, tone: "rejected" }) : ""}
      </svg>
    </div>
  `;
}

function renderSummaryView() {
  const stats = buildSummaryStats();
  summary.textContent = `${stats.total} 个岗位 · ${stats.activeOrUnknown} 个仍在流程内`;
  summaryView.innerHTML = `
    <div class="summary-panel">
      <div class="summary-metrics">
        <div>
          <span>全部投递</span>
          <strong>${stats.total}</strong>
        </div>
        <div>
          <span>进入笔试</span>
          <strong>${stats.assessmentTotal}</strong>
        </div>
        <div>
          <span>进入面试</span>
          <strong>${stats.interviewTotal}</strong>
        </div>
        <div>
          <span>被拒总数</span>
          <strong>${stats.appliedRejected + stats.assessmentRejected + stats.interviewRejected}</strong>
        </div>
      </div>

      ${renderSankey(stats)}
    </div>
  `;
}

function renderProfiles() {
  summary.textContent = `${resumeProfiles.length} 个 Resume Profile`;
  profilesEmpty.style.display = resumeProfiles.length ? "none" : "block";
  profilesGrid.innerHTML = resumeProfiles.map((profile) => {
    const fields = mergedAutofillFields(profile);
    const tags = Array.isArray(profile.tags) ? profile.tags : [];
    return `
      <article class="profile-card">
        <div>
          <h3>${escapeHtml(profile.name)}</h3>
          <p class="muted">${escapeHtml(profile.file_name)} · ${escapeHtml(String(profile.file_type || "").toUpperCase())}</p>
        </div>
        <div class="tag-row">
          ${tags.length ? tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") : '<span>未设置 tag</span>'}
        </div>
        <dl class="profile-fields">
          <div><dt>姓名</dt><dd>${escapeHtml(fields.full_name || "-")}</dd></div>
          <div><dt>邮箱</dt><dd>${escapeHtml(fields.email || "-")}</dd></div>
          <div><dt>电话</dt><dd>${escapeHtml(fields.phone || "-")}</dd></div>
          <div><dt>地点</dt><dd>${escapeHtml(fields.location || "-")}</dd></div>
        </dl>
        <div class="profile-actions">
          <a href="/api/resume-profiles/${profile.id}/file" target="_blank" rel="noreferrer">打开文件</a>
          <button data-profile-action="detail" data-id="${profile.id}">查看详细</button>
          <button data-profile-action="edit" data-id="${profile.id}">编辑</button>
          <button class="danger-button" data-profile-action="delete" data-id="${profile.id}">删除</button>
        </div>
      </article>
    `;
  }).join("");

  profilesGrid.querySelectorAll("[data-profile-action='edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const profile = resumeProfiles.find((item) => String(item.id) === button.dataset.id);
      if (profile) openProfileEditDialog(profile);
    });
  });

  profilesGrid.querySelectorAll("[data-profile-action='detail']").forEach((button) => {
    button.addEventListener("click", () => {
      const profile = resumeProfiles.find((item) => String(item.id) === button.dataset.id);
      if (profile) openProfileDetailDialog(profile);
    });
  });

  profilesGrid.querySelectorAll("[data-profile-action='delete']").forEach((button) => {
    button.addEventListener("click", async () => {
      const profile = resumeProfiles.find((item) => String(item.id) === button.dataset.id);
      if (!profile) return;
      const ok = window.confirm(`确认删除这个 Resume Profile 吗？\n\n${profile.name}\n\n删除后会同时删除本地简历文件。`);
      if (!ok) return;
      await api(`/api/resume-profiles/${profile.id}`, { method: "DELETE" });
      await loadProfiles();
    });
  });
}

async function loadProfiles() {
  const [profiles, personal] = await Promise.all([
    api("/api/resume-profiles"),
    api("/api/user-profile"),
  ]);
  resumeProfiles = profiles;
  userProfile = personal;
  renderProfiles();
}

async function loadJobs() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  allJobs = await api(`/api/jobs?${params.toString()}`);
  jobs = allJobs.filter((job) => matchesNavFilter(job, activeStatus));
  renderStatusControls();
  renderViewShell();
  if (activeView === "SUMMARY") {
    renderSummaryView();
  } else if (activeView === "PROFILES") {
    await loadProfiles();
  } else {
    renderJobs();
  }
}

function openProfileEditDialog(profile) {
  profileEditId.value = profile.id;
  profileEditName.value = profile.name || "";
  profileEditTags.value = Array.isArray(profile.tags) ? profile.tags.join(", ") : "";
  profileEditEmail.value = fieldValue(profile, "email");
  profileEditLinkedin.value = fieldValue(profile, "linkedin");
  profileEditGithub.value = fieldValue(profile, "github");
  profileEditPortfolio.value = fieldValue(profile, "portfolio");
  profileEditDialog.showModal();
}

function openProfileDetailDialog(profile) {
  profileDetailTitle.textContent = profile.name;
  profileDetailFile.href = `/api/resume-profiles/${profile.id}/file`;
  profileDetailText.textContent = profile.extracted_text || "这个文件暂时没有解析出可显示文本。你仍然可以编辑上方字段，原始文件已保存在本地。";
  profileDetailDialog.showModal();
}

function openPersonalInfoDialog() {
  for (const element of personalInfoForm.elements) {
    if (!element.name) continue;
    element.value = userProfile[element.name] || "";
  }
  personalInfoDialog.showModal();
}

function openEditDialogForJob(job) {
  editJobId.value = job.id;
  editCompanyName.value = job.company_name || "";
  editPositionName.value = job.position_name || "";
  editSourceUrl.value = job.source_url || "";
  editApplyUrl.value = job.apply_url || "";
  editApplyTime.value = dateInputValue(job.apply_time || job.created_at);
  renderJobTypeSelect(editJobTypeSelect, job.job_type || "FULL_TIME");
  renderStageSelect(editStageSelect, job.current_stage || "APPLIED");
  renderSubStatusSelect(editSubStatusSelect, job.current_stage || "APPLIED", job.status);
  editCustomSubStatusField.hidden = true;
  editCustomSubStatusInput.required = false;
  editCustomSubStatusInput.value = "";
  editDialog.showModal();
}

async function renderTimelineDialog(job) {
  const timeline = await api(`/api/jobs/${job.id}/timeline`);
  timelineDialogTitle.textContent = job.position_name;
  timelineDialogMeta.textContent = `${job.company_name} · ${stageLabel(job.current_stage)} · ${statusLabel(job.status)}`;
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

newJobBtn.addEventListener("click", () => {
  if (activeView === "PROFILES") {
    profileDialog.showModal();
    return;
  }
  jobDialog.showModal();
});
refreshBtn.addEventListener("click", loadJobs);
summaryNavButton.addEventListener("click", () => {
  activeView = "SUMMARY";
  loadJobs();
});
profilesNavButton.addEventListener("click", () => {
  activeView = "PROFILES";
  loadJobs();
});
editPersonalInfoBtn.addEventListener("click", openPersonalInfoDialog);
searchInput.addEventListener("input", () => {
  clearTimeout(searchInput.searchTimer);
  searchInput.searchTimer = setTimeout(loadJobs, 180);
});

stageSelect.addEventListener("change", () => {
  renderSubStatusSelect(subStatusSelect, stageSelect.value);
  customSubStatusField.hidden = true;
  customSubStatusInput.required = false;
  customSubStatusInput.value = "";
});

subStatusSelect.addEventListener("change", () => {
  const isCustom = subStatusSelect.value === CUSTOM_STATUS_VALUE;
  customSubStatusField.hidden = !isCustom;
  customSubStatusInput.required = isCustom;
  if (isCustom) customSubStatusInput.focus();
});

editStageSelect.addEventListener("change", () => {
  renderSubStatusSelect(editSubStatusSelect, editStageSelect.value);
  editCustomSubStatusField.hidden = true;
  editCustomSubStatusInput.required = false;
  editCustomSubStatusInput.value = "";
});

editSubStatusSelect.addEventListener("change", () => {
  const isCustom = editSubStatusSelect.value === CUSTOM_STATUS_VALUE;
  editCustomSubStatusField.hidden = !isCustom;
  editCustomSubStatusInput.required = isCustom;
  if (isCustom) editCustomSubStatusInput.focus();
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
  payload.current_stage = payload.current_stage || "APPLIED";
  payload.status = payload.status || "APPLIED_SUCCESS";
  payload.job_type = payload.job_type || "FULL_TIME";
  await api("/api/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  jobForm.reset();
  renderJobTypeSelect(jobTypeSelect, "FULL_TIME");
  renderStageSelect(stageSelect, "APPLIED");
  renderSubStatusSelect(subStatusSelect, "APPLIED", "APPLIED_SUCCESS");
  customSubStatusField.hidden = true;
  customSubStatusInput.required = false;
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
  payload.current_stage = payload.current_stage || "APPLIED";
  payload.status = payload.status || "APPLIED_SUCCESS";
  payload.job_type = payload.job_type || "FULL_TIME";

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
  editCustomSubStatusField.hidden = true;
  editCustomSubStatusInput.required = false;
  editCustomSubStatusInput.value = "";
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

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter && submitter.value === "cancel") {
    profileDialog.close();
    return;
  }

  const formData = new FormData(profileForm);
  const file = formData.get("resume_file");
  if (!(file instanceof File) || !file.name) {
    window.alert("请选择一份简历文件。");
    return;
  }
  const payload = Object.fromEntries(formData.entries());
  delete payload.resume_file;
  payload.file_name = file.name;
  payload.file_content_base64 = await fileToBase64(file);

  await api("/api/resume-profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  profileForm.reset();
  profileDialog.close();
  await loadProfiles();
});

profileEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter && submitter.value === "cancel") {
    profileEditDialog.close();
    return;
  }

  const payload = Object.fromEntries(new FormData(profileEditForm).entries());
  const profileId = payload.id;
  delete payload.id;
  await api(`/api/resume-profiles/${profileId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  profileEditDialog.close();
  await loadProfiles();
});

personalInfoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  if (submitter && submitter.value === "cancel") {
    personalInfoDialog.close();
    return;
  }
  const payload = Object.fromEntries(new FormData(personalInfoForm).entries());
  await api("/api/user-profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  personalInfoDialog.close();
  await loadProfiles();
});

profileDetailDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-profile-detail]")) {
    profileDetailDialog.close();
  }
});

renderStatusControls();
loadJobs().catch((error) => {
  summary.textContent = error.message;
});

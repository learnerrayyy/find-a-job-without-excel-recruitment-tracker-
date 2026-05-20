const NAV_FILTERS = ["ALL", "PART_TIME", "FULL_TIME", "INTERNSHIP", "REJECTED"];
const JOB_TYPE_OPTIONS = ["PART_TIME", "FULL_TIME", "INTERNSHIP"];
const STAGE_OPTIONS = ["APPLIED", "ASSESSMENT", "INTERVIEW"];
const MODULE_VIEWS = {
  WEEKLY_REVIEW: {
    title: "Weekly Review",
    summary: "每周复盘投递进展、停滞岗位和下周行动。",
    status: "Planned",
    metrics: ["本周新增投递", "本周状态变化", "超过 7 天未更新", "下周重点"],
    cards: [
      ["Activity digest", "汇总本周新增岗位、OA、面试、拒绝和手动 Timeline。"],
      ["Stale applications", "找出长时间没有更新的岗位，提醒是否 follow up 或归档。"],
      ["Next actions", "把需要准备、跟进、复盘的事项整理成一页。"],
    ],
  },
  QUESTION_BANK: {
    title: "Application Question Bank",
    summary: "保存申请表常见问题和可复用答案版本。",
    status: "New feature",
    metrics: ["问题分类", "答案模板", "岗位标签", "复制使用"],
    cards: [
      ["Common questions", "例如 sponsorship、salary expectation、notice period、why this company。"],
      ["Answer variants", "同一个问题可保存正式版、简短版、技术岗版、校招版。"],
      ["Future autofill bridge", "后续可和插件连接，但模块本身先作为答案知识库独立存在。"],
    ],
  },
  INTERVIEW_STORIES: {
    title: "Interview Story Library",
    summary: "用 STAR 结构管理可复用的面试故事。",
    status: "New feature",
    metrics: ["STAR stories", "能力标签", "岗位关联", "面试复盘"],
    cards: [
      ["Story assets", "沉淀 leadership、teamwork、conflict、ownership 等故事素材。"],
      ["Tagged retrieval", "面试前按能力标签快速筛选能讲的案例。"],
      ["Practice notes", "记录每次面试后哪些故事有效、哪些需要重写。"],
    ],
  },
  COMPANY_NOTES: {
    title: "Company Research Notes",
    summary: "以公司为中心管理研究笔记和关联岗位。",
    status: "New feature",
    metrics: ["公司档案", "关联岗位", "Why company", "面试重点"],
    cards: [
      ["Company profile", "记录业务、产品、文化、新闻、风险点和个人兴趣点。"],
      ["Role connections", "同一家公司多个岗位共用研究资料，减少重复准备。"],
      ["Interview context", "把面试前需要复习的公司信息集中到一个地方。"],
    ],
  },
  EMAIL_SYNC: {
    title: "Email Sync",
    summary: "同步招聘邮件并写入岗位 Timeline。",
    status: "Planned",
    metrics: ["Gmail", "Outlook", "邮件分类", "人工确认"],
    cards: [
      ["Inbox import", "从邮箱拉取确认、OA、面试、拒信等求职邮件。"],
      ["Application matching", "先做半自动匹配，避免同公司多岗位造成误判。"],
      ["Timeline updates", "确认后写入 Timeline，并更新当前阶段或子状态。"],
    ],
  },
  AI_ASSISTANT: {
    title: "AI Assistant",
    summary: "围绕 JD、邮件、状态和准备材料提供自动化建议。",
    status: "Planned",
    metrics: ["JD 摘要", "邮件识别", "匹配评分", "行动建议"],
    cards: [
      ["JD understanding", "提炼岗位要求、关键词、缺口和准备重点。"],
      ["Email classification", "识别 OA、面试、拒信、follow-up 等邮件类型。"],
      ["Workflow suggestions", "根据当前状态给出下一步操作建议。"],
    ],
  },
  COVER_LETTERS: {
    title: "Cover Letters",
    summary: "按岗位和公司生成、保存、管理求职信草稿。",
    status: "Planned",
    metrics: ["草稿", "版本", "岗位关联", "导出"],
    cards: [
      ["Draft workspace", "把 JD、公司笔记和简历 Profile 组合成一版初稿。"],
      ["Version history", "保留不同语气和不同岗位重点的版本。"],
      ["Reusable snippets", "沉淀可复用段落，减少重复写作。"],
    ],
  },
  AUTO_APPLY: {
    title: "Auto Apply",
    summary: "长期自动化投递能力的控制台。",
    status: "Long-term",
    metrics: ["表单填入", "材料选择", "投递确认", "人工审核"],
    cards: [
      ["Guarded automation", "自动填表和材料选择需要人工确认后提交。"],
      ["Site playbooks", "针对不同招聘系统维护独立规则。"],
      ["Audit trail", "每次自动化操作都记录到 Timeline，方便追踪。"],
    ],
  },
};
const MODULE_TITLE_KEYS = {
  WEEKLY_REVIEW: "weeklyReview",
  QUESTION_BANK: "questionBank",
  INTERVIEW_STORIES: "interviewStories",
  COMPANY_NOTES: "companyNotes",
  EMAIL_SYNC: "emailSync",
  AI_ASSISTANT: "aiAssistant",
  COVER_LETTERS: "coverLetters",
  AUTO_APPLY: "autoApply",
};

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

const I18N = {
  zh: {
    navTrack: "追踪",
    navReview: "复盘",
    navPrepare: "准备",
    navAutomation: "自动化",
    dashboard: "主控台",
    dashboardSummary: "先看总览，再进入左侧详细页面处理具体任务。",
    dashboardActive: "仍在流程",
    dashboardRejected: "已被拒",
    dashboardAssessments: "进入笔试",
    dashboardInterviews: "进入面试",
    recentApplications: "最近岗位",
    noRecentApplications: "暂无最近岗位",
    quickActions: "下一步",
    goApplications: "查看岗位明细",
    goWeekly: "打开每周复盘",
    goQuestions: "整理申请题答案",
    goStories: "整理面试故事",
    goCompanies: "整理公司笔记",
    applications: "岗位追踪",
    summarize: "流程总结",
    weeklyReview: "每周复盘",
    questionBank: "申请题答案库",
    interviewStories: "面试故事库",
    companyNotes: "公司研究笔记",
    resumeProfiles: "简历档案",
    emailSync: "邮件同步",
    aiAssistant: "AI 助手",
    coverLetters: "求职信",
    autoApply: "自动投递",
    loading: "加载中...",
    newJob: "+ 新增岗位",
    newProfile: "+ 新增档案",
    languageToggle: "EN",
    searchPlaceholder: "搜索公司、岗位、链接",
    refresh: "刷新",
    tableApplyTime: "投递时间",
    tablePosition: "岗位名字",
    tableType: "分类",
    tableStage: "阶段",
    tableStatus: "子状态",
    tableTimeline: "时间线",
    tableActions: "操作",
    emptyJobs: "还没有岗位，先新增一条。",
    jobsCount: "{count} 个岗位",
    timelineCount: "{count} 条",
    edit: "编辑",
    delete: "删除",
    cancel: "取消",
    save: "保存",
    saveChanges: "保存修改",
    uploadSave: "上传保存",
    exit: "退出",
    close: "关闭",
    addJobTitle: "新增岗位",
    editJobTitle: "编辑岗位",
    openJdTitle: "打开 JD",
    company: "公司",
    position: "岗位",
    sourceUrl: "JD 页面 URL",
    applyUrl: "投递入口 URL",
    applyTime: "投递时间",
    jobType: "分类",
    stage: "阶段",
    subStatus: "子状态",
    customSubStatus: "自定义子状态",
    customStatusPlaceholder: "例如：等 HR 回复",
    jdContent: "JD 内容",
    jdPlaceholder: "先粘贴 JD 文本，后续会由 Chrome 插件自动保存。",
    originalJd: "原始 JD",
    savedJd: "保存 JD",
    savedHtml: "HTML 备份",
    timeline: "时间线",
    addTimelineEvent: "新增时间线事件",
    notes: "备注",
    addEvent: "添加事件",
    noTimeline: "暂无事件。",
    profilePanelTitle: "个人固定信息",
    profilePanelEyebrow: "共享自动填表信息",
    profilePanelBody: "姓名、电话、住址、签证等会在所有简历中共用；邮箱仍然跟随每份简历。",
    editPersonalInfo: "编辑个人信息",
    profilesEmpty: "还没有简历档案，先上传一份简历。",
    addProfileTitle: "新增简历档案",
    editProfileTitle: "编辑简历档案",
    profileName: "档案名称",
    tags: "标签",
    resumeFile: "简历文件",
    email: "邮箱",
    phone: "电话",
    location: "地点",
    portfolio: "作品集",
    fullName: "姓名",
    firstName: "名",
    lastName: "姓",
    age: "年龄",
    dateOfBirth: "出生日期",
    address: "家庭住址",
    city: "城市",
    postcode: "邮编",
    country: "国家",
    visaStatus: "签证状态",
    sponsorship: "是否需要工作签证担保",
    rightToWork: "工作权限",
    openFile: "打开文件",
    openOriginalResume: "打开原始简历文件",
    detail: "查看详细",
    noTags: "未设置标签",
    noResumeText: "这个文件暂时没有解析出可显示文本。你仍然可以编辑上方字段，原始文件已保存在本地。",
    selectResumeFile: "请选择一份简历文件。",
    customStatusPrompt: "请输入自定义子状态",
    deleteJobConfirm: "确认删除这个岗位吗？\n\n{job}\n\n删除后会同时删除本地保存的 JD 文件夹。",
    deleteProfileConfirm: "确认删除这个简历档案吗？\n\n{name}\n\n删除后会同时删除本地简历文件。",
    summaryText: "{total} 个岗位 · {active} 个仍在流程内",
    totalApplied: "全部投递",
    enteredAssessment: "进入笔试",
    enteredInterview: "进入面试",
    rejectedTotal: "被拒总数",
    sankeyRoot: "全部投递",
    sankeyAssessment: "笔试",
    sankeyInterview: "面试",
    sankeyRejected: "被拒",
  },
  en: {
    navTrack: "Track",
    navReview: "Review",
    navPrepare: "Prepare",
    navAutomation: "Automation",
    dashboard: "Main Dashboard",
    dashboardSummary: "Start with the overview, then use the left index for detailed work.",
    dashboardActive: "Still active",
    dashboardRejected: "Rejected",
    dashboardAssessments: "Reached assessment",
    dashboardInterviews: "Reached interview",
    recentApplications: "Recent applications",
    noRecentApplications: "No recent applications yet",
    quickActions: "Next steps",
    goApplications: "Review applications",
    goWeekly: "Open weekly review",
    goQuestions: "Build question bank",
    goStories: "Build story library",
    goCompanies: "Research companies",
    applications: "Applications",
    summarize: "Summary",
    weeklyReview: "Weekly Review",
    questionBank: "Question Bank",
    interviewStories: "Interview Stories",
    companyNotes: "Company Notes",
    resumeProfiles: "Resume Profiles",
    emailSync: "Email Sync",
    aiAssistant: "AI Assistant",
    coverLetters: "Cover Letters",
    autoApply: "Auto Apply",
    loading: "Loading...",
    newJob: "+ New Job",
    newProfile: "+ New Profile",
    languageToggle: "中文",
    searchPlaceholder: "Search company, role, links",
    refresh: "Refresh",
    tableApplyTime: "Applied",
    tablePosition: "Role",
    tableType: "Type",
    tableStage: "Stage",
    tableStatus: "Status",
    tableTimeline: "Timeline",
    tableActions: "Actions",
    emptyJobs: "No applications yet. Add the first one.",
    jobsCount: "{count} jobs",
    timelineCount: "{count} events",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    saveChanges: "Save changes",
    uploadSave: "Upload",
    exit: "Exit",
    close: "Close",
    addJobTitle: "New Job",
    editJobTitle: "Edit Job",
    openJdTitle: "Open JD",
    company: "Company",
    position: "Role",
    sourceUrl: "JD page URL",
    applyUrl: "Application URL",
    applyTime: "Applied date",
    jobType: "Type",
    stage: "Stage",
    subStatus: "Sub-status",
    customSubStatus: "Custom sub-status",
    customStatusPlaceholder: "Example: waiting for HR reply",
    jdContent: "JD content",
    jdPlaceholder: "Paste the JD text here. The Chrome extension can save it later.",
    originalJd: "Original JD",
    savedJd: "Saved JD",
    savedHtml: "HTML backup",
    timeline: "Timeline",
    addTimelineEvent: "Add timeline event",
    notes: "Notes",
    addEvent: "Add event",
    noTimeline: "No events yet.",
    profilePanelTitle: "Shared personal info",
    profilePanelEyebrow: "Shared Autofill Info",
    profilePanelBody: "Name, phone, address, visa and work authorization are shared across resumes. Email stays resume-specific.",
    editPersonalInfo: "Edit personal info",
    profilesEmpty: "No Resume Profiles yet. Upload one first.",
    addProfileTitle: "New Resume Profile",
    editProfileTitle: "Edit Resume Profile",
    profileName: "Profile name",
    tags: "Tags",
    resumeFile: "Resume file",
    email: "Email",
    phone: "Phone",
    location: "Location",
    portfolio: "Portfolio",
    fullName: "Full name",
    firstName: "First name",
    lastName: "Last name",
    age: "Age",
    dateOfBirth: "Date of birth",
    address: "Address",
    city: "City",
    postcode: "Postcode",
    country: "Country",
    visaStatus: "Visa status",
    sponsorship: "Needs sponsorship",
    rightToWork: "Right to work",
    openFile: "Open file",
    openOriginalResume: "Open original resume",
    detail: "Details",
    noTags: "No tags",
    noResumeText: "No readable text was extracted from this file. You can still edit the fields above; the original file is saved locally.",
    selectResumeFile: "Please choose a resume file.",
    customStatusPrompt: "Enter a custom sub-status",
    deleteJobConfirm: "Delete this job?\n\n{job}\n\nThis will also delete the saved local JD folder.",
    deleteProfileConfirm: "Delete this Resume Profile?\n\n{name}\n\nThis will also delete the local resume file.",
    summaryText: "{total} jobs · {active} still active",
    totalApplied: "All applications",
    enteredAssessment: "Reached assessment",
    enteredInterview: "Reached interview",
    rejectedTotal: "Rejected",
    sankeyRoot: "All applications",
    sankeyAssessment: "Assessment",
    sankeyInterview: "Interview",
    sankeyRejected: "Rejected",
  },
};

const STATUS_LABELS = {
  zh: {
    ALL: "全部",
    PART_TIME: "兼职",
    FULL_TIME: "全职",
    INTERNSHIP: "实习",
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
  },
  en: {
    ALL: "All",
    PART_TIME: "Part time",
    FULL_TIME: "Full time",
    INTERNSHIP: "Internship",
    APPLIED_SUCCESS: "Applied",
    APPLIED_REJECTED: "Rejected after application",
    ASSESSMENT_PENDING: "Assessment pending",
    OA: "OA",
    VI: "Video interview",
    TECH_TEST: "Technical test",
    ASSESSMENT_COMPLETED: "Assessment completed",
    ASSESSMENT_REJECTED: "Rejected after assessment",
    INTERVIEW_1: "First interview",
    INTERVIEW_2: "Second interview",
    INTERVIEW_FINAL: "Final interview",
    INTERVIEW_COMPLETED: "Interview completed",
    INTERVIEW_REJECTED: "Rejected after interview",
    REJECTED: "Rejected",
  },
};

const STAGE_LABELS = {
  zh: { APPLIED: "投递", ASSESSMENT: "笔试", INTERVIEW: "面试" },
  en: { APPLIED: "Applied", ASSESSMENT: "Assessment", INTERVIEW: "Interview" },
};

const JOB_TYPE_LABELS = {
  zh: { PART_TIME: "兼职", FULL_TIME: "全职", INTERNSHIP: "实习" },
  en: { PART_TIME: "Part time", FULL_TIME: "Full time", INTERNSHIP: "Internship" },
};

const MODULE_TEXT = {
  zh: MODULE_VIEWS,
  en: {
    WEEKLY_REVIEW: {
      title: "Weekly Review",
      summary: "Review progress, stale applications, and next actions each week.",
      status: "Planned",
      metrics: ["New this week", "Status changes", "Stale over 7 days", "Next priorities"],
      cards: [
        ["Activity digest", "Summarize new jobs, assessments, interviews, rejections, and manual timeline events."],
        ["Stale applications", "Find applications that have not moved for a while and decide whether to follow up or archive."],
        ["Next actions", "Turn preparation, follow-ups, and review tasks into one focused page."],
      ],
    },
    QUESTION_BANK: {
      title: "Application Question Bank",
      summary: "Save common application questions and reusable answer variants.",
      status: "New feature",
      metrics: ["Question types", "Answer templates", "Role tags", "Copy to use"],
      cards: [
        ["Common questions", "Sponsorship, salary expectation, notice period, why this company, and similar prompts."],
        ["Answer variants", "Save formal, concise, technical, and graduate versions of the same answer."],
        ["Future autofill bridge", "This can later connect to autofill, but works first as a standalone answer library."],
      ],
    },
    INTERVIEW_STORIES: {
      title: "Interview Story Library",
      summary: "Manage reusable interview stories with the STAR structure.",
      status: "New feature",
      metrics: ["STAR stories", "Skill tags", "Job links", "Interview notes"],
      cards: [
        ["Story assets", "Capture leadership, teamwork, conflict, ownership, and other interview examples."],
        ["Tagged retrieval", "Filter by competency tags before an interview."],
        ["Practice notes", "Track which stories landed well and which need rewriting."],
      ],
    },
    COMPANY_NOTES: {
      title: "Company Research Notes",
      summary: "Research companies once and connect notes to related applications.",
      status: "New feature",
      metrics: ["Company profiles", "Linked roles", "Why company", "Interview focus"],
      cards: [
        ["Company profile", "Record products, culture, news, risks, and personal motivation."],
        ["Role connections", "Reuse company research across multiple roles at the same company."],
        ["Interview context", "Keep company context ready before interviews."],
      ],
    },
    EMAIL_SYNC: {
      title: "Email Sync",
      summary: "Sync recruiting emails into application timelines.",
      status: "Planned",
      metrics: ["Gmail", "Outlook", "Email type", "Manual review"],
      cards: [
        ["Inbox import", "Import confirmations, assessments, interviews, rejections, and follow-ups."],
        ["Application matching", "Start with manual confirmation to avoid mistakes across multiple roles."],
        ["Timeline updates", "Write confirmed emails to the timeline and update stage or status."],
      ],
    },
    AI_ASSISTANT: {
      title: "AI Assistant",
      summary: "Use JD, email, status, and prep material to suggest next steps.",
      status: "Planned",
      metrics: ["JD summary", "Email detection", "Match score", "Action advice"],
      cards: [
        ["JD understanding", "Extract requirements, keywords, gaps, and preparation focus."],
        ["Email classification", "Detect assessments, interviews, rejections, and follow-ups."],
        ["Workflow suggestions", "Recommend next actions from the current application state."],
      ],
    },
    COVER_LETTERS: {
      title: "Cover Letters",
      summary: "Create, save, and manage cover letter drafts by role and company.",
      status: "Planned",
      metrics: ["Drafts", "Versions", "Job links", "Export"],
      cards: [
        ["Draft workspace", "Combine JD, company notes, and resume profile into a first draft."],
        ["Version history", "Keep versions for different tones and role focuses."],
        ["Reusable snippets", "Save reusable paragraphs to reduce repeated writing."],
      ],
    },
    AUTO_APPLY: {
      title: "Auto Apply",
      summary: "A future control panel for guarded application automation.",
      status: "Long-term",
      metrics: ["Form fill", "Material choice", "Submit review", "Audit trail"],
      cards: [
        ["Guarded automation", "Autofill and material selection should still require human confirmation."],
        ["Site playbooks", "Maintain separate rules for different recruiting systems."],
        ["Audit trail", "Record each automated action into the application timeline."],
      ],
    },
  },
};

let jobs = [];
let allJobs = [];
let resumeProfiles = [];
let userProfile = {};
let timelineJob = null;
let activeStatus = "ALL";
let activeView = "DASHBOARD";
let currentLang = localStorage.getItem("jobTrackerLanguage") || "zh";
if (!I18N[currentLang]) currentLang = "zh";

const statusFilters = document.querySelector("#statusFilters");
const jobsTable = document.querySelector("#jobsTable");
const emptyState = document.querySelector("#emptyState");
const mainTitle = document.querySelector("#mainTitle");
const summary = document.querySelector("#summary");
const searchInput = document.querySelector("#searchInput");
const refreshBtn = document.querySelector("#refreshBtn");
const newJobBtn = document.querySelector("#newJobBtn");
const languageToggle = document.querySelector("#languageToggle");
const dashboardNavButton = document.querySelector("#dashboardNavButton");
const dashboardView = document.querySelector("#dashboardView");
const applicationsView = document.querySelector("#applicationsView");
const summaryView = document.querySelector("#summaryView");
const moduleView = document.querySelector("#moduleView");
const summaryNavButton = document.querySelector("#summaryNavButton");
const profilesView = document.querySelector("#profilesView");
const profilesGrid = document.querySelector("#profilesGrid");
const profilesEmpty = document.querySelector("#profilesEmpty");
const profilesNavButton = document.querySelector("#profilesNavButton");
const moduleNavButtons = document.querySelectorAll("[data-module-view]");
const editPersonalInfoBtn = document.querySelector("#editPersonalInfoBtn");
const profilesExitBtn = document.querySelector("#profilesExitBtn");
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

function t(key, replacements = {}) {
  const template = I18N[currentLang][key] || I18N.zh[key] || key;
  return Object.entries(replacements).reduce(
    (value, [name, replacement]) => value.replaceAll(`{${name}}`, replacement),
    template
  );
}

function moduleText(key) {
  return MODULE_TEXT[currentLang][key] || MODULE_TEXT.zh[key];
}

function statusLabel(status) {
  return STATUS_LABELS[currentLang][status] || status;
}

function stageLabel(stage) {
  return STAGE_LABELS[currentLang][stage] || stage;
}

function jobTypeLabel(jobType) {
  return JOB_TYPE_LABELS[currentLang][jobType] || jobType || "Full time";
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

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setPlaceholder(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.placeholder = value;
}

function setLeadingLabelText(selector, value) {
  const element = document.querySelector(selector);
  if (!element) return;
  const textNode = Array.from(element.childNodes).find((node) => (
    node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  ));
  if (textNode) {
    textNode.textContent = `\n          ${value}\n          `;
  }
}

function setFieldLabel(formSelector, fieldName, value) {
  const field = document.querySelector(`${formSelector} [name="${fieldName}"]`);
  const label = field?.closest("label");
  if (!label) return;
  const textNode = Array.from(label.childNodes).find((node) => (
    node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  ));
  if (textNode) {
    textNode.textContent = `\n            ${value}\n            `;
  }
}

function updateStaticText() {
  document.documentElement.lang = currentLang === "zh" ? "zh-Hans" : "en";
  dashboardNavButton.textContent = t("dashboard");
  const navLabels = document.querySelectorAll(".nav-section summary span");
  [t("navTrack"), t("navReview"), t("navPrepare"), t("navAutomation")].forEach((label, index) => {
    if (navLabels[index]) navLabels[index].textContent = label;
  });
  summaryNavButton.textContent = t("summarize");
  const moduleButtonLabels = {
    WEEKLY_REVIEW: t("weeklyReview"),
    QUESTION_BANK: t("questionBank"),
    INTERVIEW_STORIES: t("interviewStories"),
    COMPANY_NOTES: t("companyNotes"),
    EMAIL_SYNC: t("emailSync"),
    AI_ASSISTANT: t("aiAssistant"),
    COVER_LETTERS: t("coverLetters"),
    AUTO_APPLY: t("autoApply"),
  };
  moduleNavButtons.forEach((button) => {
    button.textContent = moduleButtonLabels[button.dataset.moduleView] || button.textContent;
  });
  profilesNavButton.textContent = t("resumeProfiles");
  languageToggle.textContent = t("languageToggle");
  searchInput.placeholder = t("searchPlaceholder");
  refreshBtn.textContent = t("refresh");
  emptyState.textContent = t("emptyJobs");
  profilesEmpty.textContent = t("profilesEmpty");
  editPersonalInfoBtn.textContent = t("editPersonalInfo");
  profilesExitBtn.textContent = t("exit");

  const tableLabels = [
    t("tableApplyTime"),
    t("tablePosition"),
    t("tableType"),
    t("tableStage"),
    t("tableStatus"),
    t("tableTimeline"),
    t("tableActions"),
  ];
  document.querySelectorAll("thead th").forEach((cell, index) => {
    cell.textContent = tableLabels[index] || cell.textContent;
  });

  setText("#jobDialog h3", t("addJobTitle"));
  setText("#editDialog h3", t("editJobTitle"));
  setText("#jdDialogTitle", t("openJdTitle"));
  setText("#profileDialog h3", t("addProfileTitle"));
  setText("#profileEditDialog h3", t("editProfileTitle"));
  setText("#personalInfoDialog h3", t("editPersonalInfo"));
  openOriginalJd.textContent = t("originalJd");
  openSavedJd.textContent = t("savedJd");
  openSavedHtml.textContent = t("savedHtml");
  profileDetailFile.textContent = t("openOriginalResume");

  [
    ["#jobForm label:nth-of-type(1)", "company"],
    ["#jobForm label:nth-of-type(2)", "position"],
    ["#jobForm label:nth-of-type(3)", "sourceUrl"],
    ["#jobForm label:nth-of-type(4)", "applyUrl"],
    ["#jobForm label:nth-of-type(5)", "applyTime"],
    ["#jobForm label:nth-of-type(6)", "jobType"],
    ["#jobForm label:nth-of-type(7)", "stage"],
    ["#jobForm label:nth-of-type(8)", "subStatus"],
    ["#customSubStatusField", "customSubStatus"],
    ["#jobForm label:nth-of-type(10)", "jdContent"],
    ["#editForm label:nth-of-type(1)", "company"],
    ["#editForm label:nth-of-type(2)", "position"],
    ["#editForm label:nth-of-type(3)", "sourceUrl"],
    ["#editForm label:nth-of-type(4)", "applyUrl"],
    ["#editForm label:nth-of-type(5)", "applyTime"],
    ["#editForm label:nth-of-type(6)", "jobType"],
    ["#editForm label:nth-of-type(7)", "stage"],
    ["#editForm label:nth-of-type(8)", "subStatus"],
    ["#editCustomSubStatusField", "customSubStatus"],
    ["#profileForm label:nth-of-type(1)", "profileName"],
    ["#profileForm label:nth-of-type(2)", "tags"],
    ["#profileForm label:nth-of-type(3)", "resumeFile"],
    ["#profileEditForm label:nth-of-type(1)", "profileName"],
    ["#profileEditForm label:nth-of-type(2)", "tags"],
    ["#personalInfoForm label:nth-of-type(1)", "fullName"],
    ["#personalInfoForm label:nth-of-type(2)", "firstName"],
    ["#personalInfoForm label:nth-of-type(3)", "lastName"],
    ["#personalInfoForm label:nth-of-type(4)", "phone"],
    ["#personalInfoForm label:nth-of-type(5)", "age"],
    ["#personalInfoForm label:nth-of-type(6)", "dateOfBirth"],
    ["#personalInfoForm label:nth-of-type(7)", "location"],
    ["#personalInfoForm label:nth-of-type(8)", "address"],
    ["#personalInfoForm label:nth-of-type(9)", "city"],
    ["#personalInfoForm label:nth-of-type(10)", "postcode"],
    ["#personalInfoForm label:nth-of-type(11)", "country"],
    ["#personalInfoForm label:nth-of-type(12)", "visaStatus"],
    ["#personalInfoForm label:nth-of-type(13)", "sponsorship"],
    ["#personalInfoForm label:nth-of-type(14)", "rightToWork"],
  ].forEach(([selector, key]) => setLeadingLabelText(selector, I18N[currentLang][key] || key));

  [
    ["#profileForm", "email", t("email")],
    ["#profileForm", "linkedin", "LinkedIn"],
    ["#profileForm", "github", "GitHub"],
    ["#profileForm", "portfolio", t("portfolio")],
    ["#profileEditForm", "email", t("email")],
    ["#profileEditForm", "linkedin", "LinkedIn"],
    ["#profileEditForm", "github", "GitHub"],
    ["#profileEditForm", "portfolio", t("portfolio")],
  ].forEach(([formSelector, fieldName, value]) => setFieldLabel(formSelector, fieldName, value));

  setPlaceholder("#customSubStatusInput", t("customStatusPlaceholder"));
  setPlaceholder("#editCustomSubStatusInput", t("customStatusPlaceholder"));
  setPlaceholder('#jobForm textarea[name="jd_content"]', t("jdPlaceholder"));
  setPlaceholder('#timelineForm input[name="event_title"]', t("addTimelineEvent"));
  setPlaceholder('#timelineForm textarea[name="notes"]', t("notes"));
  setPlaceholder("#personalNeedsSponsorship", currentLang === "zh" ? "是 / 否" : "Yes / No");
  setText("#timelineDialog .eyebrow", t("timeline"));

  document.querySelectorAll('button[value="cancel"]').forEach((button) => {
    button.textContent = button.classList.contains("icon-btn") ? "×" : t("cancel");
  });
  setText("#jobForm footer .primary", t("save"));
  setText("#editForm footer .primary", t("saveChanges"));
  setText("#profileForm footer .primary", t("uploadSave"));
  setText("#profileEditForm footer .primary", t("saveChanges"));
  setText("#personalInfoForm footer .primary", t("save"));
  setText("#timelineForm .primary", t("addEvent"));

  setText(".personal-info-panel .eyebrow", t("profilePanelEyebrow"));
  setText(".personal-info-panel h3", t("profilePanelTitle"));
  setText(".personal-info-panel .muted", t("profilePanelBody"));
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
      <button class="status-filter ${activeView === "APPLICATIONS" && activeStatus === status ? "active" : ""}" data-status="${status}">
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
    `<option value="${CUSTOM_STATUS_VALUE}">${currentLang === "zh" ? "自定义..." : "Custom..."}</option>`,
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
  summary.textContent = t("jobsCount", { count: jobs.length });
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
          ${t("timelineCount", { count: job.timeline_count || 0 })}
        </button>
      </td>
      <td>
        <div class="operation-stack">
          <button data-action="edit" data-id="${job.id}">${t("edit")}</button>
          <button class="danger-button" data-action="delete" data-id="${job.id}">${t("delete")}</button>
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
        nextStatus = window.prompt(t("customStatusPrompt"), job.status || "");
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
        t("deleteJobConfirm", { job: `${job.company_name} - ${job.position_name}` })
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
  const isDashboard = activeView === "DASHBOARD";
  const isSummary = activeView === "SUMMARY";
  const isProfiles = activeView === "PROFILES";
  const isModule = Boolean(MODULE_VIEWS[activeView]);
  dashboardView.hidden = !isDashboard;
  applicationsView.hidden = isDashboard || isSummary || isProfiles || isModule;
  summaryView.hidden = !isSummary;
  profilesView.hidden = !isProfiles;
  moduleView.hidden = !isModule;
  newJobBtn.hidden = isSummary || isModule;
  newJobBtn.textContent = isProfiles ? t("newProfile") : t("newJob");
  mainTitle.textContent = isDashboard
    ? t("dashboard")
    : isSummary
    ? t("summarize")
    : isProfiles
      ? t("resumeProfiles")
      : isModule
        ? t(MODULE_TITLE_KEYS[activeView])
        : t("applications");
  dashboardNavButton.classList.toggle("active", isDashboard);
  summaryNavButton.classList.toggle("active", isSummary);
  profilesNavButton.classList.toggle("active", isProfiles);
  moduleNavButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.moduleView === activeView);
  });
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
    { key: "root", title: t("sankeyRoot"), count: total, x: 80, y: 140 },
  ];
  if (stats.assessmentTotal > 0) {
    stageNodes.push({ key: "assessment", title: t("sankeyAssessment"), count: stats.assessmentTotal, x: 330, y: 140 });
  }
  if (stats.interviewTotal > 0) {
    stageNodes.push({ key: "interview", title: t("sankeyInterview"), count: stats.interviewTotal, x: 580, y: 140 });
  }

  const rejectedTooltip = [
    stats.appliedRejected ? `${stageLabel("APPLIED")}: ${stats.appliedRejected} ${stats.rejectedBreakdown.applied.map((job) => statusLabel(job.status)).join(", ")}` : "",
    stats.assessmentRejected ? `${stageLabel("ASSESSMENT")}: ${stats.assessmentRejected} ${stats.rejectedBreakdown.assessment.map((job) => statusLabel(job.status)).join(", ")}` : "",
    stats.interviewRejected ? `${stageLabel("INTERVIEW")}: ${stats.interviewRejected} ${stats.rejectedBreakdown.interview.map((job) => statusLabel(job.status)).join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const rejectedNode = rejectedTotal
    ? { key: "rejected", title: t("sankeyRejected"), count: rejectedTotal, x: 330, y: 260, tooltip: rejectedTooltip }
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
            color: "#ff8ba7",
            title: `${t("enteredAssessment")}: ${stats.assessmentTotal}`,
          }) : ""}
          ${interview ? sankeyFlow({
            from: { x: (assessment || root).x + 126, y: (assessment || root).y + 29 },
            to: { x: interview.x, y: interview.y + 29 },
            count: stats.interviewTotal,
            total,
            color: "#ff8ba7",
            title: `${t("enteredInterview")}: ${stats.interviewTotal}`,
          }) : ""}
          ${rejectedNode ? sankeyFlow({
            from: { x: root.x + 63, y: root.y + 58 },
            to: { x: rejectedNode.x + 63, y: rejectedNode.y },
            count: rejectedTotal,
            total,
            color: "#d94f79",
            title: rejectedTooltip || `${t("sankeyRejected")}: ${rejectedTotal}`,
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
  summary.textContent = t("summaryText", { total: stats.total, active: stats.activeOrUnknown });
  summaryView.innerHTML = `
    <div class="summary-panel">
      <div class="view-exit-row">
        <button type="button" data-view-exit>${t("exit")}</button>
      </div>
      ${renderSankey(stats)}
    </div>
  `;
  summaryView.querySelector("[data-view-exit]").addEventListener("click", () => {
    activeView = "DASHBOARD";
    loadJobs();
  });
}

function renderDashboardView() {
  const stats = buildSummaryStats();
  const rejectedTotal = stats.appliedRejected + stats.assessmentRejected + stats.interviewRejected;
  const recentJobs = allJobs.slice(0, 5);
  summary.textContent = t("dashboardSummary");
  dashboardView.innerHTML = `
    <section class="dashboard-grid">
      <article class="dashboard-card dashboard-card-wide">
        <div class="dashboard-metrics">
          <button type="button" data-dashboard-go="APPLICATIONS">
            <span>${t("totalApplied")}</span>
            <strong>${stats.total}</strong>
          </button>
          <button type="button" data-dashboard-go="APPLICATIONS">
            <span>${t("dashboardActive")}</span>
            <strong>${stats.activeOrUnknown}</strong>
          </button>
          <button type="button" data-dashboard-go="SUMMARY">
            <span>${t("dashboardAssessments")}</span>
            <strong>${stats.assessmentTotal}</strong>
          </button>
          <button type="button" data-dashboard-go="SUMMARY">
            <span>${t("dashboardInterviews")}</span>
            <strong>${stats.interviewTotal}</strong>
          </button>
          <button type="button" data-dashboard-go="SUMMARY">
            <span>${t("dashboardRejected")}</span>
            <strong>${rejectedTotal}</strong>
          </button>
        </div>
      </article>

      <article class="dashboard-card">
        <h3>${t("recentApplications")}</h3>
        <div class="dashboard-list">
          ${recentJobs.length ? recentJobs.map((job) => `
            <button type="button" data-dashboard-job="${job.id}">
              <strong>${escapeHtml(job.position_name)}</strong>
              <span>${escapeHtml(job.company_name)} · ${stageLabel(job.current_stage)} · ${statusLabel(job.status)}</span>
            </button>
          `).join("") : `<p class="muted">${t("noRecentApplications")}</p>`}
        </div>
      </article>

      <article class="dashboard-card">
        <h3>${t("quickActions")}</h3>
        <div class="dashboard-list">
          <button type="button" data-dashboard-go="APPLICATIONS">${t("goApplications")}</button>
          <button type="button" data-dashboard-go="SUMMARY">${t("summarize")}</button>
          <button type="button" data-dashboard-go="PROFILES">${t("resumeProfiles")}</button>
        </div>
      </article>
    </section>
  `;
  dashboardView.querySelectorAll("[data-dashboard-go]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.dashboardGo;
      loadJobs();
    });
  });
  dashboardView.querySelectorAll("[data-dashboard-job]").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = allJobs.find((item) => String(item.id) === button.dataset.dashboardJob);
      if (!job) return;
      timelineJob = job;
      await renderTimelineDialog(job);
      timelineDialog.showModal();
    });
  });
}

function renderModuleView() {
  const module = moduleText(activeView);
  if (!module) return;
  summary.textContent = module.summary;
  moduleView.innerHTML = `
    <div class="module-metrics">
      ${module.metrics.map((metric) => `<span>${escapeHtml(metric)}</span>`).join("")}
    </div>
    <div class="module-card-grid">
      ${module.cards.map(([title, body]) => `
        <article class="module-card">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(body)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderProfiles() {
  summary.textContent = `${resumeProfiles.length} ${t("resumeProfiles")}`;
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
          ${tags.length ? tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") : `<span>${t("noTags")}</span>`}
        </div>
        <dl class="profile-fields">
          <div><dt>${t("fullName")}</dt><dd>${escapeHtml(fields.full_name || "-")}</dd></div>
          <div><dt>${t("email")}</dt><dd>${escapeHtml(fields.email || "-")}</dd></div>
          <div><dt>${t("phone")}</dt><dd>${escapeHtml(fields.phone || "-")}</dd></div>
          <div><dt>${t("location")}</dt><dd>${escapeHtml(fields.location || "-")}</dd></div>
        </dl>
        <div class="profile-actions">
          <a href="/api/resume-profiles/${profile.id}/file" target="_blank" rel="noreferrer">${t("openFile")}</a>
          <button data-profile-action="detail" data-id="${profile.id}">${t("detail")}</button>
          <button data-profile-action="edit" data-id="${profile.id}">${t("edit")}</button>
          <button class="danger-button" data-profile-action="delete" data-id="${profile.id}">${t("delete")}</button>
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
      const ok = window.confirm(t("deleteProfileConfirm", { name: profile.name }));
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
  if (activeView === "DASHBOARD") {
    renderDashboardView();
  } else if (activeView === "SUMMARY") {
    renderSummaryView();
  } else if (activeView === "PROFILES") {
    await loadProfiles();
  } else if (MODULE_VIEWS[activeView]) {
    renderModuleView();
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
  profileDetailFile.textContent = t("openOriginalResume");
  profileDetailText.textContent = profile.extracted_text || t("noResumeText");
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
  `).join("") : `<p class="muted">${t("noTimeline")}</p>`;
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
languageToggle.addEventListener("click", () => {
  currentLang = currentLang === "zh" ? "en" : "zh";
  localStorage.setItem("jobTrackerLanguage", currentLang);
  updateStaticText();
  loadJobs();
});
refreshBtn.addEventListener("click", loadJobs);
dashboardNavButton.addEventListener("click", () => {
  activeView = "DASHBOARD";
  loadJobs();
});
summaryNavButton.addEventListener("click", () => {
  activeView = "SUMMARY";
  loadJobs();
});
profilesNavButton.addEventListener("click", () => {
  activeView = "PROFILES";
  loadJobs();
});
moduleNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.moduleView;
    loadJobs();
  });
});
editPersonalInfoBtn.addEventListener("click", openPersonalInfoDialog);
profilesExitBtn.addEventListener("click", () => {
  activeView = "DASHBOARD";
  loadJobs();
});
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
    window.alert(t("selectResumeFile"));
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

document.querySelectorAll('button[value="cancel"]').forEach((btn) => {
  btn.formNoValidate = true;
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

updateStaticText();
renderStatusControls();
loadJobs().catch((error) => {
  summary.textContent = error.message;
});

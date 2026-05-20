const NAV_FILTERS = ["ALL", "PART_TIME", "FULL_TIME", "INTERNSHIP", "REJECTED"];
const JOB_TYPE_OPTIONS = ["PART_TIME", "FULL_TIME", "INTERNSHIP"];
const STAGE_OPTIONS = ["APPLIED", "ASSESSMENT", "INTERVIEW"];
const MODULE_VIEWS = {
  WEEKLY_REVIEW: {
    title: "每周复盘",
    summary: "每周复盘投递进展、停滞岗位和下周行动。",
    status: "Planned",
    metrics: ["本周新增投递", "本周状态变化", "超过 7 天未更新", "下周重点"],
    cards: [
      ["本周活动汇总", "汇总本周新增岗位、OA、面试、拒绝和手动 Timeline。"],
      ["停滞岗位", "找出长时间没有更新的岗位，提醒是否 follow up 或归档。"],
      ["下周行动清单", "把需要准备、跟进、复盘的事项整理成一页。"],
    ],
  },
  QUESTION_BANK: {
    title: "申请题答案库",
    summary: "保存申请表常见问题和可复用答案版本。",
    status: "New feature",
    metrics: ["问题分类", "答案模板", "岗位标签", "复制使用"],
    cards: [
      ["常见申请题", "例如 sponsorship、salary expectation、notice period、why this company。"],
      ["答案多版本", "同一个问题可保存正式版、简短版、技术岗版、校招版。"],
      ["未来自动填表接口", "后续可和插件连接，但模块本身先作为答案知识库独立存在。"],
    ],
  },
  INTERVIEW_STORIES: {
    title: "面试故事库",
    summary: "用 STAR 结构管理可复用的面试故事。",
    status: "New feature",
    metrics: ["STAR 故事", "能力标签", "岗位关联", "面试复盘"],
    cards: [
      ["故事素材", "沉淀 leadership、teamwork、conflict、ownership 等故事素材。"],
      ["按标签检索", "面试前按能力标签快速筛选能讲的案例。"],
      ["面试复盘备注", "记录每次面试后哪些故事有效、哪些需要重写。"],
    ],
  },
  COMPANY_NOTES: {
    title: "公司研究笔记",
    summary: "以公司为中心管理研究笔记和关联岗位。",
    status: "New feature",
    metrics: ["公司档案", "关联岗位", "为什么感兴趣", "面试重点"],
    cards: [
      ["公司档案", "记录业务、产品、文化、新闻、风险点和个人兴趣点。"],
      ["关联岗位", "同一家公司多个岗位共用研究资料，减少重复准备。"],
      ["面试重点", "把面试前需要复习的公司信息集中到一个地方。"],
    ],
  },
  EMAIL_SYNC: {
    title: "Email Sync",
    summary: "同步招聘邮件并写入岗位 Timeline。",
    status: "Planned",
    metrics: ["Gmail", "Outlook", "邮件分类", "人工确认"],
    cards: [
      ["邮件导入", "从邮箱拉取确认、OA、面试、拒信等求职邮件。"],
      ["岗位匹配", "先做半自动匹配，避免同公司多岗位造成误判。"],
      ["Timeline 更新", "确认后写入 Timeline，并更新当前阶段或子状态。"],
    ],
  },
  AI_ASSISTANT: {
    title: "AI Assistant",
    summary: "围绕 JD、邮件、状态和准备材料提供自动化建议。",
    status: "Planned",
    metrics: ["JD 摘要", "邮件识别", "匹配评分", "行动建议"],
    cards: [
      ["JD 解析", "提炼岗位要求、关键词、缺口和准备重点。"],
      ["邮件识别", "识别 OA、面试、拒信、follow-up 等邮件类型。"],
      ["流程建议", "根据当前状态给出下一步操作建议。"],
    ],
  },
  COVER_LETTERS: {
    title: "Cover Letters",
    summary: "按岗位和公司生成、保存、管理求职信草稿。",
    status: "Planned",
    metrics: ["草稿", "版本", "岗位关联", "导出"],
    cards: [
      ["草稿工作区", "把 JD、公司笔记和简历 Profile 组合成一版初稿。"],
      ["版本历史", "保留不同语气和不同岗位重点的版本。"],
      ["可复用段落", "沉淀可复用段落，减少重复写作。"],
    ],
  },
  AUTO_APPLY: {
    title: "Auto Apply",
    summary: "长期自动化投递能力的控制台。",
    status: "Long-term",
    metrics: ["表单填入", "材料选择", "投递确认", "人工审核"],
    cards: [
      ["人工确认投递", "自动填表和材料选择需要人工确认后提交。"],
      ["平台规则集", "针对不同招聘系统维护独立规则。"],
      ["操作日志", "每次自动化操作都记录到 Timeline，方便追踪。"],
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
    weeklyReviewPeriod: "本周动态（过去 7 天）",
    newThisWeek: "本周新增岗位",
    recentTimeline: "近期动态",
    staleApps: "待跟进（7天+未更新）",
    noNewApps: "本周没有新增岗位",
    noRecentTimeline: "暂无近期动态",
    noStaleApps: "没有超过 7 天未更新的岗位",
    lastUpdated: "最后更新",
    addQuestion: "+ 新增问题",
    editQuestion: "编辑问题",
    questionTextLabel: "问题描述",
    questionCategoryLabel: "问题分类",
    answersLabel: "参考答案",
    addAnswerBtn: "+ 添加答案",
    answerLabelField: "版本名称",
    answerContentField: "答案内容",
    noAnswers: "暂无答案，点击添加。",
    noQuestions: "暂无问题，先新增一条。",
    deleteQuestionConfirm: "确认删除此问题及所有答案吗？",
    questionCount: "{count} 个问题",
    addStory: "+ 新增故事",
    editStory: "编辑故事",
    storyTitleField: "故事标题",
    storySituationLabel: "背景 (Situation)",
    storyTaskLabel: "任务 (Task)",
    storyActionLabel: "行动 (Action)",
    storyResultLabel: "结果 (Result)",
    storyNotesLabel: "面试备注",
    noStories: "暂无故事，先新增一条。",
    deleteStoryConfirm: "确认删除此故事吗？",
    storyCount: "{count} 个故事",
    addCompanyNote: "+ 新增公司笔记",
    editCompanyNote: "编辑公司笔记",
    industryLabel: "行业",
    overviewLabel: "公司介绍",
    cultureLabel: "文化 / 工作氛围",
    whyInterestedLabel: "为什么感兴趣",
    interviewFocusLabel: "面试重点",
    otherNotesLabel: "其他备注",
    linkedJobs: "关联岗位",
    noLinkedJobs: "暂无关联岗位",
    noCompanyNotes: "暂无公司笔记，先新增一条。",
    deleteCompanyNoteConfirm: "确认删除此公司笔记吗？",
    companyNoteCount: "{count} 个公司笔记",
    phQuestionCategory: "例如：motivation、behavioral、technical",
    phQuestionTags: "例如：常见题、HR 面",
    phStoryTitle: "例如：领导团队完成紧急项目",
    phStoryTags: "例如：leadership、teamwork",
    phStorySituation: "描述当时的背景和情况",
    phStoryTask: "你的任务或责任是什么",
    phStoryAction: "你采取了哪些具体行动",
    phStoryResult: "最终结果如何，有什么量化数据",
    phStoryNotes: "例如：在某公司面试中使用，反应良好",
    phCompanyIndustry: "例如：Tech、Finance、Consulting",
    phCompanyTags: "例如：大公司、初创",
    phCompanyOverview: "主营业务、产品、规模",
    phCompanyCulture: "团队氛围、工作方式、价值观",
    phCompanyWhy: "吸引你的原因，面试时用到",
    phCompanyFocus: "需要重点准备的方向",
    back: "← 返回",
    cardView: "卡片",
    tableView: "表格",
    filterPlaceholder: "筛选...",
    hintQuestion: "写下这道面试题，可以是行为类、技术类或动机类问题",
    hintCategory: "用于分组和筛选，例如：behavioral、technical、motivation",
    hintAnswers: "可以为同一道题准备多个版本的回答，针对不同公司或场景使用",
    hintTags: "用逗号分隔，例如：常见题、HR面、leadership",
    hintStoryTitle: "简短概括这个故事，例如：带领团队完成紧急项目",
    hintSituation: "描述当时的背景、项目规模、团队情况和你的角色",
    hintTask: "你的具体目标或职责是什么",
    hintAction: "你采取的具体行动步骤，越细节越好，突出你的主观能动性",
    hintResult: "最终结果，尽量包含量化数据，例如：提升效率30%、节省成本",
    hintStoryNotes: "备注使用场景，例如：在某公司面试中用过，效果好",
    hintCompanyName: "与投递记录中的公司名保持一致，系统将自动关联岗位",
    hintIndustry: "例如：Tech、Finance、Healthcare",
    hintOverview: "主营业务、主要产品、公司规模和发展阶段",
    hintCulture: "团队氛围、工作方式、价值观，可从Glassdoor或官网了解",
    hintWhyInterested: "面试时几乎必问，事先整理好，和公司价值观对齐",
    hintInterviewFocus: "根据JD和同类公司经验，总结这家公司面试的侧重方向",
    prepLabel: "面试备考",
    prepBtn: "备考",
    prepQuestionsSection: "题目清单",
    prepStoriesSection: "故事清单",
    prepProgress: "{q}/{qTotal} 题已准备 · {s}/{sTotal} 个故事已准备",
    prepNoQuestions: "题库为空，请先在「题库」中添加题目。",
    prepNoStories: "故事库为空，请先在「故事库」中添加故事。",
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
    weeklyReviewPeriod: "This week (past 7 days)",
    newThisWeek: "New applications this week",
    recentTimeline: "Recent activity",
    staleApps: "Follow up needed (7+ days)",
    noNewApps: "No new applications this week",
    noRecentTimeline: "No recent activity",
    noStaleApps: "No stale applications",
    lastUpdated: "Last updated",
    addQuestion: "+ New question",
    editQuestion: "Edit question",
    questionTextLabel: "Question",
    questionCategoryLabel: "Category",
    answersLabel: "Answers",
    addAnswerBtn: "+ Add answer",
    answerLabelField: "Label",
    answerContentField: "Answer",
    noAnswers: "No answers yet. Click to add.",
    noQuestions: "No questions yet. Add one to get started.",
    deleteQuestionConfirm: "Delete this question and all its answers?",
    questionCount: "{count} questions",
    addStory: "+ New story",
    editStory: "Edit story",
    storyTitleField: "Story title",
    storySituationLabel: "Situation",
    storyTaskLabel: "Task",
    storyActionLabel: "Action",
    storyResultLabel: "Result",
    storyNotesLabel: "Interview notes",
    noStories: "No stories yet. Add one to get started.",
    deleteStoryConfirm: "Delete this story?",
    storyCount: "{count} stories",
    addCompanyNote: "+ New company note",
    editCompanyNote: "Edit company note",
    industryLabel: "Industry",
    overviewLabel: "Overview",
    cultureLabel: "Culture",
    whyInterestedLabel: "Why interested",
    interviewFocusLabel: "Interview focus",
    otherNotesLabel: "Other notes",
    linkedJobs: "Linked roles",
    noLinkedJobs: "No linked roles",
    noCompanyNotes: "No company notes yet. Add one to get started.",
    deleteCompanyNoteConfirm: "Delete this company note?",
    companyNoteCount: "{count} companies",
    phQuestionCategory: "e.g. motivation, behavioral, technical",
    phQuestionTags: "e.g. common, hr, technical",
    phStoryTitle: "e.g. Led a team through a critical project",
    phStoryTags: "e.g. leadership, teamwork, conflict",
    phStorySituation: "Describe the context and background",
    phStoryTask: "What was your specific task or goal",
    phStoryAction: "What specific steps did you take",
    phStoryResult: "What was the outcome, include numbers if possible",
    phStoryNotes: "e.g. Used at a Google interview, landed well",
    phCompanyIndustry: "e.g. Tech, Finance, Consulting",
    phCompanyTags: "e.g. large corp, startup",
    phCompanyOverview: "Products, market focus, team size",
    phCompanyCulture: "Team culture, work style, values",
    phCompanyWhy: "What draws you in — use this at interviews",
    phCompanyFocus: "Key areas to prepare for this company",
    back: "← Back",
    cardView: "Cards",
    tableView: "Table",
    filterPlaceholder: "Filter...",
    hintQuestion: "Write out the interview question — behavioral, technical, or motivational",
    hintCategory: "Used for grouping and filtering, e.g. behavioral, technical, motivation",
    hintAnswers: "Prepare multiple answer versions for the same question",
    hintTags: "Comma-separated, e.g. common, hr, leadership",
    hintStoryTitle: "A short title for this story, e.g. Led team through critical migration",
    hintSituation: "Set the scene — project, team size, your role, what was at stake",
    hintTask: "Your specific goal or responsibility",
    hintAction: "Step-by-step actions you took — be specific, show your initiative",
    hintResult: "The outcome — ideally with numbers, e.g. improved efficiency 30%",
    hintStoryNotes: "Where you've used this story and how it landed",
    hintCompanyName: "Match the name in your Applications — the system will auto-link your roles",
    hintIndustry: "e.g. Tech, Finance, Healthcare",
    hintOverview: "Core products, market focus, company size and stage",
    hintCulture: "Team dynamics, work style, values — check Glassdoor or career page",
    hintWhyInterested: "You'll almost always be asked this — align with company values",
    hintInterviewFocus: "Based on the JD and peer experience — what does this company test for",
    prepLabel: "Interview Prep",
    prepBtn: "Prep",
    prepQuestionsSection: "Question Checklist",
    prepStoriesSection: "Story Checklist",
    prepProgress: "{q}/{qTotal} questions ready · {s}/{sTotal} stories ready",
    prepNoQuestions: "No questions yet — add some in the Question Bank first.",
    prepNoStories: "No stories yet — add some in the Story Library first.",
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
let questionBankItems = [];
let interviewStoryItems = [];
let companyNoteItems = [];
let questionAnswerCounter = 0;
let timelineJob = null;
let prepJob = null;
let activeEditor = null; // null | { type: "question"|"story"|"company", id: number|null, data: object|null }
let moduleViewMode = {}; // { QUESTION_BANK: "card"|"table", ... }
let moduleSearchText = {}; // { QUESTION_BANK: "", ... }
let activeStatus = "ALL";
let activeView = "DASHBOARD";
let currentLang = localStorage.getItem("jobTrackerLanguage") || "zh";
if (!I18N[currentLang]) currentLang = "zh";

const statusFilters = document.querySelector("#statusFilters");
const jobsTable = document.querySelector("#jobsTable");
const emptyState = document.querySelector("#emptyState");
const mainTitle = document.querySelector("#mainTitle");
const summary = document.querySelector("#summary");
const toolbar = document.querySelector(".toolbar");
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
const prepDialog = document.querySelector("#prepDialog");
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
          <button class="prep-btn" data-action="prep" data-id="${job.id}">${t("prepBtn")}</button>
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

  jobsTable.querySelectorAll("[data-action='prep']").forEach((button) => {
    button.addEventListener("click", async () => {
      const job = jobs.find((item) => String(item.id) === button.dataset.id);
      if (job) await openPrepDialog(job);
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
  const moduleHasAdd = ["QUESTION_BANK", "INTERVIEW_STORIES", "COMPANY_NOTES"].includes(activeView);
  newJobBtn.hidden = isSummary || (isModule && !moduleHasAdd) || activeEditor !== null;
  if (isProfiles) newJobBtn.textContent = t("newProfile");
  else if (activeView === "QUESTION_BANK") newJobBtn.textContent = t("addQuestion");
  else if (activeView === "INTERVIEW_STORIES") newJobBtn.textContent = t("addStory");
  else if (activeView === "COMPANY_NOTES") newJobBtn.textContent = t("addCompanyNote");
  else newJobBtn.textContent = t("newJob");
  mainTitle.textContent = isDashboard
    ? t("dashboard")
    : isSummary
    ? t("summarize")
    : isProfiles
      ? t("resumeProfiles")
      : isModule
        ? t(MODULE_TITLE_KEYS[activeView])
        : t("applications");
  toolbar.hidden = activeEditor !== null;
  if (isModule && !activeEditor) {
    const mod = moduleText(activeView);
    if (mod) summary.textContent = mod.summary;
  }
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

async function renderWeeklyReviewView() {
  const data = await api("/api/weekly-review");
  summary.textContent = t("weeklyReviewPeriod");
  moduleView.innerHTML = `
    <div class="weekly-review">
      <section class="weekly-section">
        <div class="weekly-section-header">
          <h3>${t("newThisWeek")}</h3>
          <span class="tag-count">${data.new_jobs.length}</span>
        </div>
        ${data.new_jobs.length ? `<div class="module-list">${data.new_jobs.map((job) => `
          <div class="module-item-row">
            <div>
              <strong>${escapeHtml(job.position_name)}</strong>
              <span class="muted"> · ${escapeHtml(job.company_name)}</span>
            </div>
            <span class="muted">${stageLabel(job.current_stage)} · ${formatDate(job.created_at)}</span>
          </div>
        `).join("")}</div>` : `<p class="muted">${t("noNewApps")}</p>`}
      </section>
      <section class="weekly-section">
        <div class="weekly-section-header">
          <h3>${t("recentTimeline")}</h3>
          <span class="tag-count">${data.recent_timeline.length}</span>
        </div>
        ${data.recent_timeline.length ? `<div class="module-list">${data.recent_timeline.map((event) => `
          <div class="module-item-row">
            <div>
              <strong>${escapeHtml(event.event_title)}</strong>
              <span class="muted"> · ${escapeHtml(event.company_name)} - ${escapeHtml(event.position_name)}</span>
            </div>
            <span class="muted">${formatDate(event.event_time)}</span>
          </div>
        `).join("")}</div>` : `<p class="muted">${t("noRecentTimeline")}</p>`}
      </section>
      <section class="weekly-section">
        <div class="weekly-section-header">
          <h3>${t("staleApps")}</h3>
          <span class="tag-count">${data.stale_jobs.length}</span>
        </div>
        ${data.stale_jobs.length ? `<div class="module-list">${data.stale_jobs.map((job) => `
          <div class="module-item-row">
            <div>
              <strong>${escapeHtml(job.position_name)}</strong>
              <span class="muted"> · ${escapeHtml(job.company_name)}</span>
            </div>
            <span class="muted">${t("lastUpdated")}: ${formatDate(job.updated_at)}</span>
          </div>
        `).join("")}</div>` : `<p class="muted">${t("noStaleApps")}</p>`}
      </section>
    </div>
  `;
}

function addAnswerRow(container, label = "", content = "") {
  const idx = questionAnswerCounter++;
  const div = document.createElement("div");
  div.className = "answer-row";
  div.innerHTML = `
    <div class="answer-row-fields">
      <input class="answer-label-input" placeholder="${t("answerLabelField")}">
      <textarea class="answer-content-input" rows="3" placeholder="${t("answerContentField")}"></textarea>
    </div>
    <button type="button" class="icon-btn" aria-label="Remove">×</button>
  `;
  div.querySelector(".answer-label-input").value = label;
  const ta = div.querySelector(".answer-content-input");
  ta.value = content;
  ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; });
  if (content) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  div.querySelector(".icon-btn").addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function renderModuleToolbar(viewKey) {
  const mode = moduleViewMode[viewKey] || "card";
  const search = escapeHtml(moduleSearchText[viewKey] || "");
  return `
    <div class="module-toolbar-bar">
      <input type="text" class="module-filter-input" id="moduleFilterInput" placeholder="${t("filterPlaceholder")}" value="${search}" />
      <div class="view-mode-toggle">
        <button class="vmtoggle-btn${mode === "card" ? " active" : ""}" data-mode="card">${t("cardView")}</button>
        <button class="vmtoggle-btn${mode === "table" ? " active" : ""}" data-mode="table">${t("tableView")}</button>
      </div>
    </div>`;
}

function attachModuleToolbarHandlers(viewKey, rerender) {
  document.querySelector("#moduleFilterInput")?.addEventListener("input", (e) => {
    moduleSearchText[viewKey] = e.target.value;
    rerender();
  });
  document.querySelectorAll(".vmtoggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      moduleViewMode[viewKey] = btn.dataset.mode;
      rerender();
    });
  });
}

async function renderQuestionBankView() {
  questionBankItems = await api("/api/question-bank");
  renderQuestionBankContent();
}

function renderQuestionBankContent() {
  const search = (moduleSearchText.QUESTION_BANK || "").toLowerCase();
  const items = questionBankItems.filter((q) => !search ||
    q.question.toLowerCase().includes(search) ||
    (q.category || "").toLowerCase().includes(search) ||
    (q.tags || []).some((tg) => tg.toLowerCase().includes(search)));
  summary.textContent = t("questionCount", { count: items.length });
  const mode = moduleViewMode.QUESTION_BANK || "card";
  let content;
  if (items.length === 0) {
    content = `<p class="muted module-empty">${t("noQuestions")}</p>`;
  } else if (mode === "table") {
    content = `<table class="module-table">
      <thead><tr><th>${t("questionTextLabel")}</th><th>${t("questionCategoryLabel")}</th><th>${t("tags")}</th><th>${t("answersLabel")}</th><th>${t("tableActions")}</th></tr></thead>
      <tbody>${items.map((q) => `
        <tr>
          <td class="cell-truncate">${escapeHtml(q.question)}</td>
          <td>${escapeHtml(q.category || "")}</td>
          <td>${(q.tags || []).map((tg) => `<span class="tag-chip">${escapeHtml(tg)}</span>`).join(" ")}</td>
          <td>${(q.answers || []).length}</td>
          <td><div class="operation-stack"><button data-action="edit-question" data-id="${q.id}">${t("edit")}</button><button class="danger-button" data-action="delete-question" data-id="${q.id}">${t("delete")}</button></div></td>
        </tr>`).join("")}
      </tbody></table>`;
  } else {
    content = items.map((q) => `
      <article class="module-item-card" data-id="${q.id}">
        <div class="module-item-header">
          <div class="module-item-body">
            <h3>${escapeHtml(q.question)}</h3>
            <div class="tag-row">
              ${q.category && q.category !== "general" ? `<span>${escapeHtml(q.category)}</span>` : ""}
              ${(q.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
          <div class="operation-stack item-actions">
            <button data-action="edit-question" data-id="${q.id}">${t("edit")}</button>
            <button class="danger-button" data-action="delete-question" data-id="${q.id}">${t("delete")}</button>
          </div>
        </div>
        ${(q.answers || []).length ? `
          <div class="answer-list">
            ${q.answers.map((ans) => `
              <div class="answer-item">
                ${(typeof ans === "object" && ans.label) ? `<p class="answer-label-tag">${escapeHtml(ans.label)}</p>` : ""}
                <p>${escapeHtml(typeof ans === "string" ? ans : (ans.content || ""))}</p>
              </div>`).join("")}
          </div>` : `<p class="muted">${t("noAnswers")}</p>`}
      </article>`).join("");
  }
  moduleView.innerHTML = renderModuleToolbar("QUESTION_BANK") + content;
  attachModuleToolbarHandlers("QUESTION_BANK", renderQuestionBankContent);
  moduleView.querySelectorAll("[data-action='edit-question']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = questionBankItems.find((item) => String(item.id) === btn.dataset.id);
      if (q) openNoteEditor("question", q);
    });
  });
  moduleView.querySelectorAll("[data-action='delete-question']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const q = questionBankItems.find((item) => String(item.id) === btn.dataset.id);
      if (!q || !window.confirm(t("deleteQuestionConfirm"))) return;
      await api(`/api/question-bank/${q.id}`, { method: "DELETE" });
      questionBankItems = questionBankItems.filter((x) => x.id !== q.id);
      renderQuestionBankContent();
    });
  });
}

async function renderInterviewStoriesView() {
  interviewStoryItems = await api("/api/interview-stories");
  renderInterviewStoriesContent();
}

function renderInterviewStoriesContent() {
  const search = (moduleSearchText.INTERVIEW_STORIES || "").toLowerCase();
  const items = interviewStoryItems.filter((s) => !search ||
    s.title.toLowerCase().includes(search) ||
    (s.situation || "").toLowerCase().includes(search) ||
    (s.tags || []).some((tg) => tg.toLowerCase().includes(search)));
  summary.textContent = t("storyCount", { count: items.length });
  const mode = moduleViewMode.INTERVIEW_STORIES || "card";
  let content;
  if (items.length === 0) {
    content = `<p class="muted module-empty">${t("noStories")}</p>`;
  } else if (mode === "table") {
    content = `<table class="module-table">
      <thead><tr><th>${t("storyTitleField")}</th><th>${t("tags")}</th><th>Situation</th><th>${t("tableActions")}</th></tr></thead>
      <tbody>${items.map((s) => `
        <tr>
          <td>${escapeHtml(s.title)}</td>
          <td>${(s.tags || []).map((tg) => `<span class="tag-chip">${escapeHtml(tg)}</span>`).join(" ")}</td>
          <td class="cell-truncate">${escapeHtml((s.situation || "").slice(0, 80))}${(s.situation || "").length > 80 ? "…" : ""}</td>
          <td><div class="operation-stack"><button data-action="edit-story" data-id="${s.id}">${t("edit")}</button><button class="danger-button" data-action="delete-story" data-id="${s.id}">${t("delete")}</button></div></td>
        </tr>`).join("")}
      </tbody></table>`;
  } else {
    content = items.map((story) => `
      <article class="module-item-card" data-id="${story.id}">
        <div class="module-item-header">
          <div class="module-item-body">
            <h3>${escapeHtml(story.title)}</h3>
            <div class="tag-row">
              ${(story.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
          <div class="operation-stack item-actions">
            <button data-action="edit-story" data-id="${story.id}">${t("edit")}</button>
            <button class="danger-button" data-action="delete-story" data-id="${story.id}">${t("delete")}</button>
          </div>
        </div>
        <div class="star-grid">
          ${story.situation ? `<div class="star-field"><dt>${t("storySituationLabel")}</dt><dd>${escapeHtml(story.situation)}</dd></div>` : ""}
          ${story.task ? `<div class="star-field"><dt>${t("storyTaskLabel")}</dt><dd>${escapeHtml(story.task)}</dd></div>` : ""}
          ${story.action ? `<div class="star-field"><dt>${t("storyActionLabel")}</dt><dd>${escapeHtml(story.action)}</dd></div>` : ""}
          ${story.result ? `<div class="star-field"><dt>${t("storyResultLabel")}</dt><dd>${escapeHtml(story.result)}</dd></div>` : ""}
        </div>
        ${story.notes ? `<p class="story-notes muted">${escapeHtml(story.notes)}</p>` : ""}
      </article>`).join("");
  }
  moduleView.innerHTML = renderModuleToolbar("INTERVIEW_STORIES") + content;
  attachModuleToolbarHandlers("INTERVIEW_STORIES", renderInterviewStoriesContent);
  moduleView.querySelectorAll("[data-action='edit-story']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const story = interviewStoryItems.find((item) => String(item.id) === btn.dataset.id);
      if (story) openNoteEditor("story", story);
    });
  });
  moduleView.querySelectorAll("[data-action='delete-story']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const story = interviewStoryItems.find((item) => String(item.id) === btn.dataset.id);
      if (!story || !window.confirm(t("deleteStoryConfirm"))) return;
      await api(`/api/interview-stories/${story.id}`, { method: "DELETE" });
      interviewStoryItems = interviewStoryItems.filter((x) => x.id !== story.id);
      renderInterviewStoriesContent();
    });
  });
}

async function renderCompanyNotesView() {
  companyNoteItems = await api("/api/company-notes");
  renderCompanyNotesContent();
}

function renderCompanyNotesContent() {
  const search = (moduleSearchText.COMPANY_NOTES || "").toLowerCase();
  const items = companyNoteItems.filter((n) => !search ||
    n.company_name.toLowerCase().includes(search) ||
    (n.industry || "").toLowerCase().includes(search) ||
    (n.tags || []).some((tg) => tg.toLowerCase().includes(search)));
  summary.textContent = t("companyNoteCount", { count: items.length });
  const mode = moduleViewMode.COMPANY_NOTES || "card";
  let content;
  if (items.length === 0) {
    content = `<p class="muted module-empty">${t("noCompanyNotes")}</p>`;
  } else if (mode === "table") {
    content = `<table class="module-table">
      <thead><tr><th>${t("company")}</th><th>${t("industryLabel")}</th><th>${t("tags")}</th><th>${t("linkedJobs")}</th><th>${t("tableActions")}</th></tr></thead>
      <tbody>${items.map((note) => {
        const linked = allJobs.filter((j) => j.company_name.toLowerCase() === note.company_name.toLowerCase());
        return `<tr>
          <td>${escapeHtml(note.company_name)}</td>
          <td>${escapeHtml(note.industry || "")}</td>
          <td>${(note.tags || []).map((tg) => `<span class="tag-chip">${escapeHtml(tg)}</span>`).join(" ")}</td>
          <td>${linked.length}</td>
          <td><div class="operation-stack"><button data-action="edit-company" data-id="${note.id}">${t("edit")}</button><button class="danger-button" data-action="delete-company" data-id="${note.id}">${t("delete")}</button></div></td>
        </tr>`;
      }).join("")}
      </tbody></table>`;
  } else {
    content = items.map((note) => {
      const linked = allJobs.filter((job) => job.company_name.toLowerCase() === note.company_name.toLowerCase());
      return `
        <article class="module-item-card" data-id="${note.id}">
          <div class="module-item-header">
            <div class="module-item-body">
              <h3>${escapeHtml(note.company_name)}</h3>
              <div class="tag-row">
                ${note.industry ? `<span>${escapeHtml(note.industry)}</span>` : ""}
                ${(note.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              </div>
            </div>
            <div class="operation-stack item-actions">
              <button data-action="edit-company" data-id="${note.id}">${t("edit")}</button>
              <button class="danger-button" data-action="delete-company" data-id="${note.id}">${t("delete")}</button>
            </div>
          </div>
          ${note.overview ? `<p>${escapeHtml(note.overview)}</p>` : ""}
          ${note.why_interested ? `<div class="note-field"><dt>${t("whyInterestedLabel")}</dt><dd>${escapeHtml(note.why_interested)}</dd></div>` : ""}
          ${note.interview_focus ? `<div class="note-field"><dt>${t("interviewFocusLabel")}</dt><dd>${escapeHtml(note.interview_focus)}</dd></div>` : ""}
          <div class="linked-jobs-row">
            <span class="muted">${t("linkedJobs")}:</span>
            ${linked.length ? linked.map((job) => `<span class="linked-job-tag">${escapeHtml(job.position_name)}</span>`).join("") : `<span class="muted">${t("noLinkedJobs")}</span>`}
          </div>
        </article>`;
    }).join("");
  }
  moduleView.innerHTML = renderModuleToolbar("COMPANY_NOTES") + content;
  attachModuleToolbarHandlers("COMPANY_NOTES", renderCompanyNotesContent);
  moduleView.querySelectorAll("[data-action='edit-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const note = companyNoteItems.find((item) => String(item.id) === btn.dataset.id);
      if (note) openNoteEditor("company", note);
    });
  });
  moduleView.querySelectorAll("[data-action='delete-company']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const note = companyNoteItems.find((item) => String(item.id) === btn.dataset.id);
      if (!note || !window.confirm(t("deleteCompanyNoteConfirm"))) return;
      await api(`/api/company-notes/${note.id}`, { method: "DELETE" });
      companyNoteItems = companyNoteItems.filter((x) => x.id !== note.id);
      renderCompanyNotesContent();
    });
  });
}

async function openPrepDialog(job) {
  prepJob = job;
  await renderPrepDialog();
  prepDialog.showModal();
}

async function renderPrepDialog() {
  if (!prepJob) return;
  const data = await api(`/api/jobs/${prepJob.id}/prep`);

  document.querySelector("#prepDialogTitle").textContent = prepJob.position_name;
  document.querySelector("#prepDialogMeta").textContent =
    `${prepJob.company_name} · ${stageLabel(prepJob.current_stage)} · ${statusLabel(prepJob.status)}`;
  document.querySelector("#prepDialogEyebrow").textContent = t("prepLabel");

  const totalItems = data.questions.length + data.stories.length;
  const readyQ = data.questions.filter((q) => q.is_ready).length;
  const readyS = data.stories.filter((s) => s.is_ready).length;
  const totalReady = readyQ + readyS;
  const pct = totalItems > 0 ? Math.round((totalReady / totalItems) * 100) : 0;

  document.querySelector("#prepProgress").innerHTML = `
    <div class="prep-progress">
      <span class="prep-progress-text">${t("prepProgress", { q: readyQ, qTotal: data.questions.length, s: readyS, sTotal: data.stories.length })}</span>
      <div class="prep-bar"><div class="prep-bar-fill" style="width:${pct}%"></div></div>
    </div>`;

  const byCategory = {};
  data.questions.forEach((q) => {
    const cat = q.category || "general";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(q);
  });

  const qHtml = data.questions.length === 0
    ? `<p class="prep-empty">${t("prepNoQuestions")}</p>`
    : Object.entries(byCategory).map(([cat, qs]) => `
        <div class="prep-category">
          <div class="prep-category-label">${escapeHtml(cat)}</div>
          ${qs.map((q) => `
            <label class="prep-item${q.is_ready ? " is-ready" : ""}">
              <input type="checkbox" class="prep-check" data-type="question" data-id="${q.id}" ${q.is_ready ? "checked" : ""} />
              <span class="prep-item-text">${escapeHtml(q.question)}</span>
              ${q.tags.length ? `<span class="prep-item-tags">${q.tags.map((tg) => `<span class="tag-chip">${escapeHtml(tg)}</span>`).join("")}</span>` : ""}
            </label>`).join("")}
        </div>`).join("");

  const sHtml = data.stories.length === 0
    ? `<p class="prep-empty">${t("prepNoStories")}</p>`
    : data.stories.map((s) => `
        <label class="prep-item${s.is_ready ? " is-ready" : ""}">
          <input type="checkbox" class="prep-check" data-type="story" data-id="${s.id}" ${s.is_ready ? "checked" : ""} />
          <span class="prep-item-text">${escapeHtml(s.title)}</span>
          ${s.tags.length ? `<span class="prep-item-tags">${s.tags.map((tg) => `<span class="tag-chip">${escapeHtml(tg)}</span>`).join("")}</span>` : ""}
          ${s.situation ? `<span class="prep-item-hint">${escapeHtml(s.situation.slice(0, 60))}${s.situation.length > 60 ? "…" : ""}</span>` : ""}
        </label>`).join("");

  document.querySelector("#prepContent").innerHTML = `
    <div class="prep-sections">
      <div class="prep-section">
        <h4 class="prep-section-title">${t("prepQuestionsSection")}</h4>
        ${qHtml}
      </div>
      <div class="prep-section">
        <h4 class="prep-section-title">${t("prepStoriesSection")}</h4>
        ${sHtml}
      </div>
    </div>`;

  document.querySelectorAll(".prep-check").forEach((cb) => {
    cb.addEventListener("change", async () => {
      const isReady = cb.checked ? 1 : 0;
      await api(`/api/jobs/${prepJob.id}/prep`, {
        method: "POST",
        body: JSON.stringify({ item_type: cb.dataset.type, item_id: parseInt(cb.dataset.id), is_ready: isReady }),
      });
      cb.closest(".prep-item")?.classList.toggle("is-ready", cb.checked);
      const allQ = document.querySelectorAll('.prep-check[data-type="question"]');
      const allS = document.querySelectorAll('.prep-check[data-type="story"]');
      const rQ = [...allQ].filter((c) => c.checked).length;
      const rS = [...allS].filter((c) => c.checked).length;
      const tot = allQ.length + allS.length;
      const rdy = rQ + rS;
      document.querySelector(".prep-progress-text").textContent =
        t("prepProgress", { q: rQ, qTotal: allQ.length, s: rS, sTotal: allS.length });
      document.querySelector(".prep-bar-fill").style.width = tot > 0 ? `${Math.round((rdy / tot) * 100)}%` : "0%";
    });
  });
}

function openNoteEditor(type, item = null) {
  activeEditor = { type, id: item?.id ?? null, data: item };
  loadJobs();
}

function getNoteEditorFields(type, data) {
  const h = (s) => escapeHtml(String(s ?? ""));
  const tagStr = (v) => Array.isArray(v) ? v.join(", ") : (v || "");
  if (type === "question") {
    return `
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("questionTextLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintQuestion"))}">?</span>
        </div>
        <textarea name="question" class="note-field-input" rows="4" required>${h(data?.question)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("questionCategoryLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintCategory"))}">?</span>
        </div>
        <input name="category" class="note-field-input" value="${h(data?.category)}" placeholder="${h(t("phQuestionCategory"))}" />
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("tags")}</span>
          <span class="note-hint" data-hint="${h(t("hintTags"))}">?</span>
        </div>
        <input name="tags" class="note-field-input" value="${h(tagStr(data?.tags))}" placeholder="${h(t("phQuestionTags"))}" />
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("answersLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintAnswers"))}">?</span>
        </div>
        <div id="noteAnswersList" class="note-answers-list"></div>
        <button type="button" class="note-add-btn" id="noteAddAnswerBtn">${t("addAnswerBtn")}</button>
      </div>`;
  }
  if (type === "story") {
    return `
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("storyTitleField")}</span>
          <span class="note-hint" data-hint="${h(t("hintStoryTitle"))}">?</span>
        </div>
        <input name="title" class="note-field-input" value="${h(data?.title)}" required placeholder="${h(t("phStoryTitle"))}" />
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("tags")}</span>
          <span class="note-hint" data-hint="${h(t("hintTags"))}">?</span>
        </div>
        <input name="tags" class="note-field-input" value="${h(tagStr(data?.tags))}" placeholder="${h(t("phStoryTags"))}" />
      </div>
      <div class="note-field-section-label">STAR</div>
      <div class="note-field">
        <div class="note-field-label">
          <span>S — ${t("storySituationLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintSituation"))}">?</span>
        </div>
        <textarea name="situation" class="note-field-input" rows="4" placeholder="${h(t("phStorySituation"))}">${h(data?.situation)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>T — ${t("storyTaskLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintTask"))}">?</span>
        </div>
        <textarea name="task" class="note-field-input" rows="4" placeholder="${h(t("phStoryTask"))}">${h(data?.task)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>A — ${t("storyActionLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintAction"))}">?</span>
        </div>
        <textarea name="action" class="note-field-input" rows="5" placeholder="${h(t("phStoryAction"))}">${h(data?.action)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>R — ${t("storyResultLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintResult"))}">?</span>
        </div>
        <textarea name="result" class="note-field-input" rows="4" placeholder="${h(t("phStoryResult"))}">${h(data?.result)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("storyNotesLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintStoryNotes"))}">?</span>
        </div>
        <textarea name="notes" class="note-field-input" rows="3" placeholder="${h(t("phStoryNotes"))}">${h(data?.notes)}</textarea>
      </div>`;
  }
  if (type === "company") {
    return `
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("company")}</span>
          <span class="note-hint" data-hint="${h(t("hintCompanyName"))}">?</span>
        </div>
        <input name="company_name" class="note-field-input" value="${h(data?.company_name)}" required />
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("industryLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintIndustry"))}">?</span>
        </div>
        <input name="industry" class="note-field-input" value="${h(data?.industry)}" placeholder="${h(t("phCompanyIndustry"))}" />
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("tags")}</span>
          <span class="note-hint" data-hint="${h(t("hintTags"))}">?</span>
        </div>
        <input name="tags" class="note-field-input" value="${h(tagStr(data?.tags))}" placeholder="${h(t("phCompanyTags"))}" />
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("overviewLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintOverview"))}">?</span>
        </div>
        <textarea name="overview" class="note-field-input" rows="4" placeholder="${h(t("phCompanyOverview"))}">${h(data?.overview)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("cultureLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintCulture"))}">?</span>
        </div>
        <textarea name="culture" class="note-field-input" rows="4" placeholder="${h(t("phCompanyCulture"))}">${h(data?.culture)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("whyInterestedLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintWhyInterested"))}">?</span>
        </div>
        <textarea name="why_interested" class="note-field-input" rows="4" placeholder="${h(t("phCompanyWhy"))}">${h(data?.why_interested)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("interviewFocusLabel")}</span>
          <span class="note-hint" data-hint="${h(t("hintInterviewFocus"))}">?</span>
        </div>
        <textarea name="interview_focus" class="note-field-input" rows="4" placeholder="${h(t("phCompanyFocus"))}">${h(data?.interview_focus)}</textarea>
      </div>
      <div class="note-field">
        <div class="note-field-label">
          <span>${t("otherNotesLabel")}</span>
        </div>
        <textarea name="notes" class="note-field-input" rows="4">${h(data?.notes)}</textarea>
      </div>`;
  }
  return "";
}

function renderNoteEditor() {
  const { type, id, data } = activeEditor;
  moduleView.innerHTML = `
    <div class="note-editor">
      <div class="note-editor-nav">
        <button type="button" class="note-back-btn" id="noteBackBtn">${t("back")}</button>
      </div>
      <form id="noteEditorForm" class="note-editor-form">
        ${getNoteEditorFields(type, data)}
        <div class="note-editor-footer">
          <button type="button" class="note-back-btn" id="noteBackBtn2">${t("cancel")}</button>
          <button type="submit" class="primary">${t("save")}</button>
        </div>
      </form>
    </div>`;

  if (type === "question") {
    const container = document.querySelector("#noteAnswersList");
    const answers = data?.answers || [];
    if (answers.length) {
      answers.forEach((ans) => addAnswerRow(container, typeof ans === "object" ? (ans.label || "") : "", typeof ans === "object" ? (ans.content || "") : String(ans)));
    } else {
      addAnswerRow(container);
    }
    document.querySelector("#noteAddAnswerBtn").addEventListener("click", () => addAnswerRow(container));
  }

  const backHandler = () => {
    activeEditor = null;
    renderViewShell();
    if (activeView === "QUESTION_BANK") renderQuestionBankContent();
    else if (activeView === "INTERVIEW_STORIES") renderInterviewStoriesContent();
    else if (activeView === "COMPANY_NOTES") renderCompanyNotesContent();
  };
  document.querySelector("#noteBackBtn")?.addEventListener("click", backHandler);
  document.querySelector("#noteBackBtn2")?.addEventListener("click", backHandler);

  function autoResize(el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  moduleView.querySelectorAll("textarea.note-field-input").forEach((ta) => {
    autoResize(ta);
    ta.addEventListener("input", () => autoResize(ta));
  });

  document.querySelector("#noteEditorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveNoteEditor(event.target);
  });
}

async function saveNoteEditor(form) {
  const { type, id } = activeEditor;
  const fd = new FormData(form);
  let payload, url, method;

  if (type === "question") {
    const container = document.querySelector("#noteAnswersList");
    const answers = [];
    container?.querySelectorAll(".answer-row").forEach((row) => {
      const label = (row.querySelector(".answer-label-input")?.value || "").trim();
      const content = (row.querySelector(".answer-content-input")?.value || "").trim();
      if (content) answers.push({ label, content });
    });
    payload = { question: fd.get("question"), category: fd.get("category") || "general", tags: fd.get("tags") || "", answers };
    url = id ? `/api/question-bank/${id}` : "/api/question-bank";
    method = id ? "PATCH" : "POST";
  } else if (type === "story") {
    payload = { title: fd.get("title"), tags: fd.get("tags") || "", situation: fd.get("situation") || "", task: fd.get("task") || "", action: fd.get("action") || "", result: fd.get("result") || "", notes: fd.get("notes") || "" };
    url = id ? `/api/interview-stories/${id}` : "/api/interview-stories";
    method = id ? "PATCH" : "POST";
  } else {
    payload = { company_name: fd.get("company_name"), industry: fd.get("industry") || "", tags: fd.get("tags") || "", overview: fd.get("overview") || "", culture: fd.get("culture") || "", why_interested: fd.get("why_interested") || "", interview_focus: fd.get("interview_focus") || "", notes: fd.get("notes") || "" };
    url = id ? `/api/company-notes/${id}` : "/api/company-notes";
    method = id ? "PATCH" : "POST";
  }

  await api(url, { method, body: JSON.stringify(payload) });
  activeEditor = null;
  await loadJobs();
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
    if (activeEditor !== null) {
      renderNoteEditor();
    } else if (activeView === "WEEKLY_REVIEW") {
      await renderWeeklyReviewView();
    } else if (activeView === "QUESTION_BANK") {
      renderQuestionBankContent();
      await renderQuestionBankView();
    } else if (activeView === "INTERVIEW_STORIES") {
      renderInterviewStoriesContent();
      await renderInterviewStoriesView();
    } else if (activeView === "COMPANY_NOTES") {
      renderCompanyNotesContent();
      await renderCompanyNotesView();
    } else {
      renderModuleView();
    }
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
  if (activeView === "QUESTION_BANK") {
    openNoteEditor("question");
    return;
  }
  if (activeView === "INTERVIEW_STORIES") {
    openNoteEditor("story");
    return;
  }
  if (activeView === "COMPANY_NOTES") {
    openNoteEditor("company");
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
  activeEditor = null;
  loadJobs();
});
summaryNavButton.addEventListener("click", () => {
  activeView = "SUMMARY";
  activeEditor = null;
  loadJobs();
});
profilesNavButton.addEventListener("click", () => {
  activeView = "PROFILES";
  activeEditor = null;
  loadJobs();
});
moduleNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.moduleView;
    activeEditor = null;
    loadJobs();
  });
});

document.querySelector("#sidebarCollapseBtn").addEventListener("click", () => {
  const shell = document.querySelector(".app-shell");
  const collapsed = shell.classList.toggle("sidebar-collapsed");
  document.querySelector("#sidebarCollapseBtn").textContent = collapsed ? "›" : "‹";
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

prepDialog.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-prep]")) {
    prepJob = null;
    prepDialog.close();
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

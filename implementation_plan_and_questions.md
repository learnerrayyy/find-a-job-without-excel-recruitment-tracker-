# Job Application Tracker 可行方案与待确认需求

本文基于当前 `requirement.md` 整理，目标是把现有想法拆成可落地的开发阶段，并列出目前还不够明确、需要你进一步回答的问题。

---

# 一、我对当前需求的理解

你想做的不是普通表格，而是一个本地运行的求职管理系统：

```text
个人 Job CRM + 自动化求职 Agent
```

核心对象是一次岗位投递 `JobApplication`，系统要记录从发现岗位、保存 JD、投递、收到邮件、OA、面试、Offer / Rejection 的完整生命周期。

系统长期目标包括：

* Chrome 插件一键保存岗位
* 本地保存 JD、HTML、截图
* SQLite 数据库存储岗位、状态、时间线、邮件
* Dashboard 查看和搜索
* Gmail / Outlook 邮件同步
* AI 自动识别邮件类型和更新状态
* 后续扩展自动填表、简历匹配、Cover Letter、自动投递

---

# 二、推荐落地策略

当前需求范围偏大，建议不要一开始就做完整 Electron + 插件 + 邮件 + AI。更稳的方式是先做一个可用的本地 Web App，再逐步补插件和自动化。

推荐分为 4 个阶段。

---

# 三、阶段 0：项目骨架与数据模型

## 目标

先建立一个能长期扩展的基础工程。

## 推荐技术

```text
Next.js 或 React + Vite
Node.js / Fastify
SQLite
Prisma
Local file storage
```

如果你希望尽快做出可用版本，我更推荐：

```text
React + Vite + Fastify + Prisma + SQLite
```

原因是结构简单，插件也更容易通过 HTTP API 与本地后端通信。

## 需要先定义的数据表

### JobApplication

建议字段：

```text
id
company_name
position_name
source_url
apply_url
jd_local_path
html_local_path
screenshot_local_path
apply_time
current_stage
status
latest_email_id
created_at
updated_at
```

### TimelineEvent

建议字段：

```text
id
job_application_id
event_type
event_title
event_time
source
notes
created_at
```

### EmailMessage

建议字段：

```text
id
job_application_id
provider
provider_message_id
sender
subject
received_at
email_type
raw_content
is_read
created_at
```

---

# 四、阶段 1：真正 MVP

## 目标

先让你能真实管理岗位，而不是先追求自动化。

## 功能范围

### 1. Dashboard

实现一个本地 Dashboard，支持：

* 查看所有岗位
* 新增岗位
* 编辑公司、岗位、状态、投递链接
* 按状态筛选
* 按公司 / 岗位 / JD 内容搜索
* 点击岗位打开本地 Markdown JD
* 查看单个岗位的 Timeline
* 手动新增 Timeline 事件

### 2. 本地文件保存

保存结构可以先使用：

```text
data/jobs/company_position_timestamp/
    jd.html
    jd.md
    screenshot.png
```

第一版可以先允许手动粘贴 JD 内容，并保存为 Markdown。

### 3. 状态流转

第一版状态建议使用：

```text
DISCOVERED
SAVED
APPLIED
OA
INTERVIEW
OFFER
REJECTED
GHOSTED
WITHDRAWN
```

说明：`INTERVIEW_1`、`INTERVIEW_2`、`INTERVIEW_FINAL` 可以由 Timeline 表达，不一定必须放在主状态里，否则状态会变得很难维护。

---

# 五、阶段 2：Chrome 插件保存岗位

## 目标

让浏览岗位时可以一键保存。

## 插件职责

Chrome Extension 负责：

* 获取当前页面 URL
* 获取页面 HTML
* 获取页面标题
* 尝试提取公司名和岗位名
* 截图当前页面
* 发送到本地后端 API

## 本地后端职责

Local Backend 负责：

* 接收插件数据
* 生成本地目录
* 保存 `jd.html`
* 转换并保存 `jd.md`
* 保存截图
* 写入 SQLite
* 创建 Timeline 事件：`岗位已保存`

## 注意点

不同招聘网站 DOM 差异很大，自动提取公司名、岗位名不能一开始就追求 100% 准确。建议第一版插件保存后弹出一个确认表单，让你修正公司名和岗位名。

---

# 六、阶段 3：邮件同步

## 目标

先同步 Gmail，Outlook 放到后面。

## 推荐策略

第一版 Gmail 同步只做：

* OAuth 登录 Gmail
* 拉取最近 N 天邮件
* 根据关键词初步分类
* 让用户确认匹配到哪个岗位
* 写入 EmailMessage
* 写入 Timeline
* 更新 JobApplication 当前状态

## 不建议第一版直接全自动

邮件自动匹配岗位存在歧义，例如：

* 邮件里没有岗位名
* 招聘系统发件人不是公司域名
* 同一家公司投了多个岗位
* OA / 面试邮件来自第三方平台

所以建议先做“半自动确认”，等数据积累后再做 AI 自动判断。

---

# 七、阶段 4：AI 与自动化扩展

## 可扩展能力

后续可以增加：

* AI 解析 JD 技术栈
* AI 判断是否需要 Sponsorship
* AI 邮件分类
* AI 生成 Timeline 摘要
* AI 简历匹配
* AI Cover Letter
* Playwright 自动填表

## 建议优先级

更推荐先做：

```text
AI 邮件分类
→ AI JD 结构化解析
→ 简历匹配
→ Cover Letter
→ 自动填表 / 自动投递
```

自动投递风险最高，建议最后做。

---

# 八、建议的第一版开发任务清单

## P0

* 初始化项目结构
* 配置 SQLite + Prisma
* 定义 JobApplication / TimelineEvent / EmailMessage schema
* 实现后端 API
* 实现 Dashboard 表格
* 实现岗位新增 / 编辑 / 删除
* 实现状态更新
* 实现 Timeline 查看和新增
* 实现本地 Markdown JD 保存

## P1

* 实现本地全文搜索
* 实现点击岗位打开本地 JD
* 实现 Chrome 插件基本保存
* 实现页面截图保存
* 实现 HTML 到 Markdown 转换

## P2

* Gmail OAuth
* Gmail 拉取邮件
* 邮件关键词分类
* 邮件与岗位半自动匹配
* 未读提醒

## P3

* AI 邮件分类
* AI JD 解析
* 面试时间识别
* Calendar 提醒
* Outlook 同步

---

# 九、目前还没有完全明确的需求

下面这些问题需要你回答后，才能更准确地进入实现。

## 1. 使用形态

1. 第一版你想要哪种形式？
   * A. 本地 Web App，运行一个本地服务，然后浏览器打开 Dashboard
   * B. Electron 桌面 App
   * C. 先做 Chrome 插件 + 极简后端，没有完整 Dashboard

2. 你主要使用什么系统？
   * macOS
   * Windows
   * Linux

3. 这个工具只给你自己用，还是未来希望给别人安装使用？

## 2. MVP 范围

4. 第一版是否必须包含 Chrome 插件？

5. 第一版是否必须包含 Gmail 同步？

6. 第一版是否可以先手动粘贴 JD，后续再做插件自动抓取？

7. 第一版是否需要截图功能，还是先保存 HTML + Markdown 即可？

## 3. 招聘网站范围

8. 你最常用哪些招聘网站？
   * LinkedIn
   * Indeed
   * Greenhouse
   * Lever
   * Workday
   * Otta / Welcome to the Jungle
   * 公司官网
   * 其他

9. 插件保存岗位时，是否需要针对特定网站做精准解析？

10. 如果自动识别公司名 / 岗位名失败，你是否接受手动修正？

## 4. 文件保存

11. 本地文件希望保存在项目目录里，还是固定保存在某个全局目录？

12. 文件夹命名是否需要中文 / 英文 / slug 格式？

13. 是否需要支持 Obsidian Vault？

14. Markdown JD 是否需要固定模板，例如 frontmatter？

示例：

```markdown
---
company: OpenAI
position: Software Engineer
status: APPLIED
source_url: ...
apply_url: ...
---
```

## 5. 状态系统

15. 面试轮次你希望作为主状态，还是放在 Timeline 里？

16. 是否需要区分：
   * 已保存但未投递
   * 已投递等待回复
   * OA 已完成
   * 面试已安排
   * 面试已完成等待结果

17. 是否需要 `WITHDRAWN`、`EXPIRED`、`NO_LONGER_INTERESTED` 这类状态？

## 6. Timeline

18. Timeline 事件是否需要支持附件？

19. Timeline 是否需要支持提醒时间？

20. Timeline 是否需要和日历同步？

## 7. 邮件同步

21. 你第一版主要用 Gmail 还是 Outlook？

22. 是否接受本地保存邮件原文？

23. 邮件是否需要保存附件？

24. 自动匹配邮件到岗位时，如果不确定，是否允许进入“待确认”列表？

25. 邮件同步频率希望是多少？
   * 手动点击同步
   * 每 15 分钟
   * 每小时
   * 每天

## 8. 搜索

26. 搜索第一版是否只需要公司、岗位、JD 内容？

27. 是否需要高级筛选，例如地点、薪资、技术栈、是否 Sponsor？

## 9. AI 能力

28. 你是否已经有 OpenAI API Key？

29. AI 功能第一版是否必须做？

30. 你更想先做哪一个 AI 功能？
   * 邮件分类
   * JD 提取技术栈
   * 简历匹配
   * Cover Letter
   * 自动投递

## 10. 数据安全

31. 数据是否必须完全本地，不允许上传任何 JD / 邮件到云端？

32. 如果使用 OpenAI API，是否允许把 JD 和邮件内容发送给模型处理？

33. 是否需要数据库备份 / 导出功能？

## 11. UI 偏好

34. Dashboard 想更像 Notion、Airtable，还是 Excel？

35. 是否需要 Kanban 视图？

36. 是否需要统计图，例如每周投递数量、各状态数量？

---

# 十、我的建议结论

建议第一版先做：

```text
本地 Web Dashboard
+ SQLite
+ Prisma
+ 手动新增岗位
+ 本地 Markdown 保存
+ Timeline
+ 搜索
```

然后第二步再加：

```text
Chrome 插件一键保存岗位
```

再第三步加：

```text
Gmail 半自动同步
```

这样可以最快得到一个你每天真的能用的工具，同时不会一开始被插件权限、Gmail OAuth、AI 自动匹配这些复杂点卡住。

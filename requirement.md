# Job Application Tracker 系统需求文档（MVP + 扩展规划）

# 一、项目目标

开发一个本地化的求职追踪系统，用于管理整个找工作的生命周期，包括：

* 保存岗位 JD
* 保存投递入口
* 追踪投递状态
* 自动同步邮件
* 自动更新招聘流程状态
* 查看时间线
* 管理往来邮件
* 后续扩展 AI 自动化能力

该系统的目标不是简单记录投递，而是构建一个：

```text
个人 Job CRM + 自动化求职 Agent
```

系统需要支持：

* 本地运行
* 浏览器插件交互
* 邮件自动同步
* 本地文件保存
* Dashboard 可视化
* 后续 AI 扩展

---

# 二、完整业务流程

系统围绕一次岗位投递（Job Application）展开。

完整流程：

```text
浏览岗位
→ 查看 JD
→ 保存岗位
→ 点击投递入口
→ 填写申请表
→ 提交申请
→ 收到投递确认邮件
→ 等待
→ 收到 OA 邮件
→ 收到面试邮件
→ 多轮面试
→ Offer / Rejection
```

系统需要能够记录整个生命周期中的所有状态变化。

---

# 三、核心功能需求

# 1. 岗位保存系统（核心 MVP）

## 功能目标

在用户浏览招聘网站时，能够快速保存岗位信息。

---

## 用户行为

用户在招聘网站中：

* 浏览 JD
* 点击插件按钮
* 保存当前岗位

---

## 系统需要完成的功能

### 自动抓取：

* 岗位名称
* 公司名称
* JD 内容
* 当前页面 URL
* 投递入口 URL

---

## 本地保存内容

系统需要保存：

### 1. HTML 原始页面

用于完整备份。

---

### 2. Markdown 格式 JD

用于全文搜索和 Obsidian 支持。

---

### 3. 页面截图

用于视觉备份。

---

## 本地文件结构

```text
/jobs/company_position_timestamp/
    jd.html
    jd.md
    screenshot.png
```

---

# 2. 投递记录数据库

系统需要维护一个本地数据库。

数据库核心对象：

```text
JobApplication
```

---

## 需要保存的信息

### 基础字段

| 字段            | 含义       |
| ------------- | -------- |
| company_name  | 公司名称     |
| position_name | 岗位名称     |
| apply_url     | 投递入口     |
| source_url    | JD 页面    |
| jd_local_path | 本地 JD 路径 |
| apply_time    | 投递时间     |
| current_stage | 当前阶段     |
| status        | 当前状态     |
| latest_email  | 最后邮件     |
| created_at    | 创建时间     |

---

# 3. 投递状态系统

系统需要维护岗位当前状态。

---

## 状态枚举

```text
DISCOVERED
SAVED
APPLIED
OA
INTERVIEW_1
INTERVIEW_2
INTERVIEW_FINAL
OFFER
REJECTED
GHOSTED
```

---

## 状态更新来源

状态更新可以来自：

### 手动更新

用户自己修改状态。

---

### 邮件自动更新（扩展）

系统自动解析邮件。

---

# 4. 时间线系统（重要）

每个岗位需要有完整 Timeline。

---

## 示例

```text
5月1日  投递完成
5月3日  OA
5月7日  一面
5月12日 二面
5月20日 Offer
```

---

## Timeline 需要保存：

| 字段          | 含义   |
| ----------- | ---- |
| event_type  | 事件类型 |
| event_title | 事件标题 |
| event_time  | 时间   |
| source      | 来源   |
| notes       | 备注   |

---

# 5. Dashboard（主界面）

系统需要有一个统一管理界面。

---

## 形式

类似：

* Notion Table
* Airtable
* Excel Dashboard

---

## 需要展示的信息

| 字段       | 功能       |
| -------- | -------- |
| 公司       | 公司名      |
| 岗位       | 点击进入 JD  |
| 投递时间     | 日期       |
| 当前状态     | OA / 面试等 |
| Timeline | 招聘流程     |
| 最后邮件     | 最新沟通     |
| 未读提醒     | 红点提示     |

---

## 特殊功能

### 点击岗位名称：

能够打开：

```text
本地 JD 文件
```

而不是仅打开网页。

---

# 6. 邮件同步系统（扩展功能）

系统需要能够同步 Gmail / Outlook 邮件。

---

## 功能目标

自动识别：

* 投递确认
* OA
* 面试通知
* Offer
* Rejection

---

## 邮件同步流程

```text
Gmail API
→ 拉取邮件
→ AI/规则分类
→ 更新 application 状态
→ 写入 timeline
```

---

## 邮件需要保存的信息

| 字段          | 含义   |
| ----------- | ---- |
| sender      | 发件人  |
| subject     | 标题   |
| received_at | 收件时间 |
| email_type  | 邮件类型 |
| raw_content | 原始内容 |
| is_read     | 是否已读 |

---

# 7. 邮件提醒功能

Dashboard 中需要展示：

```text
最后一封邮件
```

如果有新的未读邮件：

```text
显示红点
```

---

# 8. 本地全文搜索

系统需要支持：

* 搜索岗位
* 搜索公司
* 搜索 JD 内容
* 搜索邮件内容

---

# 四、技术实现方案

# 1. 浏览器插件

## 技术

```text
Chrome Extension
```

---

## 功能

负责：

* 获取页面内容
* 获取 JD
* 获取 URL
* 一键保存岗位
* 后续自动填表

---

# 2. 本地后端

## 技术

```text
Node.js + Express/Fastify
```

---

## 功能

负责：

* 接收插件数据
* 保存数据库
* 保存文件
* 邮件同步
* AI 分类

---

# 3. 数据库

## 技术

```text
SQLite
```

---

## 原因

* 本地化
* 无需服务器
* 轻量
* 查询快
* Electron 兼容好

---

# ORM

```text
Prisma
```

---

# 4. 本地文件系统

用于保存：

* HTML
* Markdown
* Screenshot
* 邮件附件

---

# 5. 前端 Dashboard

## 技术

```text
React
Tailwind
TanStack Table
```

---

## 功能

负责：

* 表格展示
* Timeline 展示
* 状态修改
* 搜索
* 邮件提醒

---

# 6. Desktop App

## 技术

```text
Electron
```

---

## 原因

需要：

* 本地数据库
* 本地文件访问
* 插件通信
* 跨平台

---

# 7. 邮件同步

## 技术

```text
Gmail API
Outlook API
```

---

## 功能

定时同步邮件。

---

# 8. AI 能力（扩展）

## 技术

```text
OpenAI API
```

---

## 用途

### 邮件分类

识别：

* OA
* 面试
* Offer
* Rejection

---

### JD 解析

提取：

* 岗位等级
* 技术栈
* 地点
* 是否 Sponsorship

---

# 五、推荐系统架构

```text
[Chrome Extension]
        ↓
[Local Backend API]
        ↓
[SQLite Database]
        ↓
[Local File Storage]
        ↓
[React Dashboard]
```

邮件部分：

```text
[Gmail API]
      ↓
[Email Parser]
      ↓
[AI Classifier]
      ↓
[Application Status Update]
```

---

# 六、第一阶段 MVP

第一版只实现：

---

## 1. Chrome 插件保存岗位

支持：

* 保存 JD
* 保存 URL
* 保存截图

---

## 2. SQLite 数据库存储

支持：

* 岗位记录
* Timeline

---

## 3. 本地 Dashboard

支持：

* 查看岗位
* 查看状态
* 查看时间线
* 搜索岗位

---

## 4. Gmail 同步

支持：

* 自动识别投递确认邮件
* 自动更新状态

---

# 七、第二阶段扩展

---

## 自动识别 OA

---

## 自动识别面试时间

提取：

* 时间
* 地点
* Zoom 链接
* 线上/线下

---

## 自动生成 Timeline

---

## 自动提醒

---

## 自动简历匹配

---

## 自动生成 Cover Letter

---

## 自动投递（未来）

通过：

```text
Playwright
```

实现。

---

# 八、推荐技术栈（最终）

| 模块      | 技术               |
| ------- | ---------------- |
| 插件      | Chrome Extension |
| 前端      | React            |
| UI      | Tailwind         |
| Desktop | Electron         |
| 后端      | Node.js          |
| API     | Fastify          |
| 数据库     | SQLite           |
| ORM     | Prisma           |
| 自动化     | Playwright       |
| 邮件同步    | Gmail API        |
| AI      | OpenAI API       |

---

# 九、最终目标

最终形成一个：

```text
本地化 AI Job Application Operating System
```

能够：

* 保存所有岗位
* 自动追踪状态
* 自动同步邮件
* 管理完整求职时间线
* 后续支持 AI 自动化投递
* 支持 Obsidian / Notion 同步

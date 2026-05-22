# PDF 解析、自动填表与新问题回流架构

本文描述下一阶段申请表自动化的核心架构：简历 PDF 如何解析，解析出的内容如何填入招聘网站，当网站出现基础问题库无法回答的问题时如何收集、保存，并重新进入填表工作流。

---

# 一、目标

系统要把当前的 `Job Application Tracker` 从“岗位追踪 + 简历档案”扩展为：

```text
Resume Profile
→ Application Form Autofill
→ Unknown Question Capture
→ Question Bank Review
→ Answer Reuse
→ Continue Autofill
```

核心原则：

* 自动填表只负责填入和建议，不自动提交申请。
* 要能够上传这个cv的源文件，在网站需要的时候，如果能够直接直接使用求职网站的pdf解析就用
* 在招聘网站的Ppdf解析之后，需要系统去交叉确认填入的内容体
* 所有无法确定的字段都进入人工确认队列。
* 新问题一旦被用户回答，就沉淀进问题库，下次可以复用。
* 每次自动化行为都要能追溯到来源：简历、个人信息、问题库、用户临时输入。

---

# 二、当前系统基础

当前代码里已经有这些基础能力：

## 1. Resume Profiles

后端表：

```text
resume_profiles
```

已保存：

* 原始简历文件
* 文件类型
* 提取文本 `extracted_text`
* 解析字段 `parsed_json`
* 标签 `tags`

## 2. User Profile

后端表：

```text
user_profile
```

已保存：

* 姓名
* 电话
* 地址
* 城市
* 邮编
* 国家
* 签证状态
* 是否需要 sponsorship
* right to work

但是现在这一个部分有一些问题
就是说有的填入的内容通过下拉框去选中的 比如说生日
有的填入的方式是勾选，比如是不是需要spensorship
如果是只有答案的话是不行的 还要能够适应不同的填入方式

## 3. Chrome Extension Autofill

插件当前会：

* 拉取 `resume_profiles`
* 拉取 `user_profile`
* 合并为 `autofill_fields`
* 在当前网页里按字段别名匹配输入框
* 填入姓名、邮箱、电话、链接等基础字段

这些能力可以作为下一阶段自动填表的起点。

---

# 三、整体架构

推荐把系统拆成 5 个模块。

```text
1. Resume Parser
   解析 PDF / DOCX / TXT，生成结构化 Resume Profile。

2. Autofill Field Mapper
   把网站表单字段映射到系统字段或问题库答案。

3. Question Bank
   保存常见申请问题、答案模板、变体和适用条件。

4. Unknown Question Inbox
   收集无法自动回答的新问题，等待用户补充答案。

5. Autofill Session
   记录一次具体网站填表过程，支持暂停、补答案、继续填。
```

数据流：

```text
上传简历
→ 解析为 Resume Profile
→ 打开申请网站
→ 插件扫描表单
→ 字段匹配
→ 可回答字段自动填入
→ 无法回答字段进入 Unknown Question Inbox
→ 用户补答案
→ 写入 Question Bank
→ 回到当前 Autofill Session
→ 继续填入
→ 用户人工检查并提交
```

---

# 四、PDF 应该怎么解析

PDF 解析不要只做“文本抽取”，而应该分三层。

## 第 1 层：文件保存

保存原始文件，保证任何解析失败时仍能打开原文件。

当前已有：

```text
data/resumes/{profile_timestamp}/resume.pdf
```

建议继续保留。

## 第 2 层：文本抽取

MVP 可以继续使用当前 `extract_pdf_text()`，但它只适合简单 PDF。

现在建议引入两个轻量 Python 依赖：

```text
pdfplumber
pypdf
```

添加位置：

```text
requirements.txt
server.py
```

职责划分：

```text
pdfplumber
→ 作为主解析器，适合普通文本型 PDF，能更好保留换行和页面结构。

pypdf
→ 作为备用解析器，pdfplumber 失败或结果太少时再尝试。

server.py 里的旧标准库解析
→ 作为最后 fallback，保证没安装依赖时系统仍能运行。
```

后续如果遇到扫描版 PDF，再加 OCR：

```text
pytesseract
pdf2image
系统级 tesseract / poppler
```

OCR 不建议现在立刻加入，因为它需要额外安装系统工具，部署成本比 `pdfplumber` 和 `pypdf` 高很多。

推荐策略：

```text
先抽文字
→ 如果文字少于阈值，例如 200 字
→ 判断可能是扫描版 PDF
→ 标记为 needs_ocr
→ 让用户手动补字段，或后续接 OCR
```

## 第 3 层：结构化解析

从简历文本中解析出统一字段。

建议输出结构：

```json
{
  "full_name": "",
  "first_name": "",
  "last_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "education": [],
  "experience": [],
  "skills": [],
  "projects": [],
  "work_authorization": {
    "right_to_work": "",
    "needs_sponsorship": "",
    "visa_status": ""
  }
}
```

当前 `parsed_json` 可以先保存基础字段；以后再扩展 education、experience、skills。

---

# 五、PDF 内容怎么填到网站

自动填表需要分成两类字段。

## 1. 标准资料字段

这类字段来自 `user_profile` + `resume_profiles.parsed_json`。

例子：

```text
First name
Last name
Email
Phone
Address
City
Postcode
Country
LinkedIn
GitHub
Portfolio
Right to work
Need sponsorship
```

处理方式：

```text
网站字段 label / placeholder / aria-label / name / id
→ 标准化成 field_key
→ 从 autofill_fields 取值
→ 填入页面
```

例子：

```text
label = "Do you require visa sponsorship?"
→ field_key = needs_sponsorship
→ value = user_profile.needs_sponsorship
```

## 2. 申请问题字段

这类字段不能简单来自简历，而是需要问题库回答。

例子：

```text
Why do you want to work here?
What is your salary expectation?
What is your notice period?
Describe a project you are proud of.
Are you willing to relocate?
Do you have experience with React?
```

处理方式：

```text
网站问题文本
→ 生成 normalized_question
→ 查 Question Bank
→ 找到匹配答案
→ 根据岗位、公司、简历档案选择答案变体
→ 填入或展示给用户确认
```

---

# 六、问题库设计

建议新增表：

```sql
CREATE TABLE application_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    canonical_key TEXT,
    question_text TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    category TEXT NOT NULL,
    answer_type TEXT NOT NULL DEFAULT 'text',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE application_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    resume_profile_id INTEGER,
    job_application_id INTEGER,
    company_name TEXT,
    role_type TEXT,
    confidence INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES application_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_profile_id) REFERENCES resume_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE SET NULL
);
```

`application_questions` 保存“问题本身”。

`application_answers` 保存“这个问题可以怎么答”，允许同一个问题有多个版本。

例如：

```text
question: Do you require sponsorship?
answer A: No, I have the right to work in the UK.
answer B: Yes, I would require employer sponsorship.
```

---

# 七、新问题怎么收集

当插件扫描网站时，每个表单控件都会得到一个 `field_candidate`。

建议结构：

```json
{
  "session_id": 12,
  "page_url": "https://company.com/apply",
  "label": "Why are you interested in this company?",
  "input_type": "textarea",
  "required": true,
  "dom_selector": "...",
  "normalized_text": "why are you interested in this company",
  "status": "unresolved"
}
```

匹配失败的条件：

* 不是标准资料字段
* Question Bank 没有相似问题
* 找到了问题但没有可用答案
* 找到了答案但置信度低，需要人工确认

这些问题进入新表：

```sql
CREATE TABLE autofill_unknown_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    job_application_id INTEGER,
    resume_profile_id INTEGER,
    page_url TEXT,
    label TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    input_type TEXT,
    required INTEGER NOT NULL DEFAULT 0,
    dom_selector TEXT,
    status TEXT NOT NULL DEFAULT 'unresolved',
    resolved_question_id INTEGER,
    resolved_answer_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

状态建议：

```text
unresolved
answered
ignored
needs_review
```

---

# 八、新问题怎么保存并回到填表工作流

推荐使用 `Autofill Session` 作为中间状态，而不是让插件一次性做完。

## 1. 创建填表会话

用户在插件里选择：

```text
Job Application
Resume Profile
```

插件创建：

```sql
CREATE TABLE autofill_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_application_id INTEGER,
    resume_profile_id INTEGER NOT NULL,
    page_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## 2. 插件扫描页面

插件把页面上的字段发给本地后端：

```text
POST /api/autofill-sessions/{id}/scan
```

后端返回：

```json
{
  "fillable": [
    {
      "dom_selector": "...",
      "source": "resume_profile",
      "field_key": "email",
      "value": "name@example.com"
    }
  ],
  "answerable": [
    {
      "dom_selector": "...",
      "source": "question_bank",
      "question_id": 3,
      "answer_id": 8,
      "value": "..."
    }
  ],
  "unknown": [
    {
      "unknown_question_id": 21,
      "label": "Why this company?"
    }
  ]
}
```

## 3. 插件填入已知字段

插件只填：

* 标准资料字段
* 高置信度问题库答案

无法回答的问题不乱填。

## 4. 用户在 Dashboard 里补答案

Dashboard 提供一个 `Unknown Questions` 页面：

```text
问题
来源网站
关联岗位
是否必填
输入答案
保存为问题库
应用到当前会话
```

保存时执行：

```text
unknown_question
→ application_questions
→ application_answers
→ unknown_question.status = answered
→ unknown_question.resolved_answer_id = new_answer_id
```

## 5. 回到插件继续填

插件重新拉取当前 session：

```text
GET /api/autofill-sessions/{id}/pending-actions
```

后端返回刚刚补好的答案，插件填入对应 `dom_selector`。

这个流程让新问题自然进入下一次自动填表，而不是只停留在“收集问题”。

---

# 九、字段匹配策略

字段匹配建议按优先级执行。

## 1. 精确别名匹配

维护一个本地字典：

```json
{
  "first_name": ["first name", "given name", "forename"],
  "last_name": ["last name", "surname", "family name"],
  "email": ["email", "email address"],
  "phone": ["phone", "mobile", "telephone"],
  "needs_sponsorship": ["sponsorship", "visa sponsorship", "work visa"],
  "right_to_work": ["right to work", "authorized to work"]
}
```

当前插件里的 alias 逻辑可以逐步迁移成可配置字典。

## 2. 标准化问题匹配

对问题文本做 normalized：

```text
小写
去标点
合并空格
移除无意义词
```

再查 `application_questions.normalized_text`。

## 3. 相似度匹配

MVP 可以先用简单规则：

```text
包含关键词
Jaccard overlap
Levenshtein ratio
```

后续可以接 embedding，但不建议一开始就引入。

## 4. 置信度门槛

建议：

```text
>= 90: 自动填入
70-89: 展示建议，用户确认
< 70: 进入 Unknown Question Inbox
```

---

# 十、API 建议

新增 API：

```text
GET    /api/question-bank/questions
POST   /api/question-bank/questions
PATCH  /api/question-bank/questions/:id
DELETE /api/question-bank/questions/:id

GET    /api/question-bank/answers
POST   /api/question-bank/answers
PATCH  /api/question-bank/answers/:id
DELETE /api/question-bank/answers/:id

POST   /api/autofill-sessions
GET    /api/autofill-sessions/:id
POST   /api/autofill-sessions/:id/scan
GET    /api/autofill-sessions/:id/pending-actions
PATCH  /api/autofill-sessions/:id

GET    /api/unknown-questions
POST   /api/unknown-questions/:id/resolve
PATCH  /api/unknown-questions/:id
```

---

# 十一、前端页面建议

## Dashboard 新增页面

```text
Application Question Bank
```

功能：

* 查看问题
* 新增问题
* 编辑标准答案
* 给答案加标签
* 标记适用岗位类型
* 标记是否可自动填入

```text
Unknown Questions
```

功能：

* 查看从网站收集来的新问题
* 关联当前岗位
* 写入答案
* 保存到问题库
* 应用回当前 Autofill Session

## 插件新增界面

当前插件可以增加：

```text
选择 Job Application
选择 Resume Profile
开始扫描
填入已知字段
显示未解决问题数量
打开 Dashboard 处理问题
处理后继续填入
```

---

# 十二、Timeline 与审计记录

每次重要自动化动作都应该写入 `timeline_events`。

建议事件：

```text
AUTOFILL_SESSION_STARTED
AUTOFILL_FIELDS_FILLED
UNKNOWN_QUESTIONS_CAPTURED
UNKNOWN_QUESTIONS_RESOLVED
APPLICATION_READY_FOR_REVIEW
```

例子：

```text
5月22日  使用 Software Engineer Resume Profile 填入 12 个字段，发现 3 个新问题。
5月22日  已为 3 个新问题补充答案，并写入问题库。
```

---

# 十三、MVP 落地顺序

推荐分 4 步做。

## 阶段 1：问题库本地 CRUD

目标：

* 新增 `application_questions`
* 新增 `application_answers`
* Dashboard 能增删改查
* 先手动维护常见问题

## 阶段 2：插件扫描未知问题

目标：

* 插件扫描 textarea、input、select
* 已知 profile 字段继续自动填
* 未知文本问题发到后端保存
* Dashboard 能看到 Unknown Questions

## 阶段 3：回答后回填当前页面

目标：

* 引入 `autofill_sessions`
* Unknown Question 保存 `dom_selector`
* 用户回答后，插件能继续把答案填回原页面

## 阶段 4：更强 PDF 解析

目标：

* 替换当前轻量 PDF 解析
* 增加 education、experience、skills
* 对扫描版 PDF 标记 `needs_ocr`
* 允许用户手动修正结构化字段

---

# 十四、关键边界

自动填表必须保持这些边界：

* 不自动点击 Submit。
* 对低置信度答案必须让用户确认。
* 对 salary、sponsorship、right to work 这类高风险问题，默认不静默填写，除非用户明确允许。
* 保存问题时要保留原始问题文本，避免过度归一化后丢失上下文。
* 同一问题可以有多个答案，不要把问题库设计成一个问题只能有一个答案。

---

# 十五、最终工作流示例

```text
1. 用户上传 Software Engineer CV.pdf
2. 系统解析出姓名、邮箱、电话、LinkedIn、GitHub
3. 用户打开公司申请页面
4. 插件选择该 Resume Profile 和对应岗位
5. 插件填入基础信息
6. 插件发现 2 个未知问题：
   - Why are you interested in our company?
   - Describe your experience with React.
7. Unknown Questions 页面显示这 2 个问题
8. 用户补答案，并保存到 Question Bank
9. 插件回到同一个 Autofill Session
10. 系统把刚刚保存的答案填回网页
11. 用户检查页面并手动提交
12. Timeline 记录本次填表过程
```

这个设计可以先很朴素地实现，但后面能自然接入 AI 匹配、语义搜索、OCR、Playwright 自动化和更完整的求职 Agent。

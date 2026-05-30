# Job Application Tracker

一个本地优先的求职流程管理工具，用来替代散乱的 Excel、Notion 表格和浏览器收藏夹。

项目目前由三部分组成：

- **Local Web App**：浏览器里的 Main Dashboard 和详细模块页面。
- **Local API + SQLite**：`server.py` 提供本地 API，数据写入本机 SQLite。
- **Chrome Extension**：从招聘网页抓取 JD、链接和页面内容，一键保存到本地 tracker。

核心原则：代码可以推到 GitHub，个人求职数据留在本地。

## 功能模块

### Track

- 保存和管理岗位。
- 记录公司、岗位、链接、JD、投递时间、阶段、状态和下一步动作。
- 支持阶段流转、状态更新、Timeline、搜索、删除确认。
- Dashboard 汇总整体投递进度和近期需要处理的事项。

### Prepare

- **Application Question Bank**：沉淀常见申请问题和可复用答案。
- **Interview Story Library**：用 STAR 结构管理面试故事。
- **Company Research Notes**：保存公司研究、行业、文化、动机和面试重点。
- **Resume Profiles**：为不同方向保存不同简历版本和自动填表字段。

### Review

- **Weekly Review**：保存每周复盘内容。
- **Calendar Review**：在 Main Dashboard 里按日期查看当天操作、Timeline 和复盘。
- **Funnel Analysis**：查看投递流程中的阶段分布和卡点。

### Automation

- Chrome 插件保存当前招聘页面。
- 插件读取当前 URL、页面标题、完整 HTML 和选中的 JD 文本。
- 插件可打开 Main Dashboard。
- 可选 Native Messaging helper：让插件在本地服务未启动时尝试启动 `server.py`。
- 自动化模块保留 Email Sync、AI Assistant、Cover Letters、Auto Apply 的入口，用于后续扩展。

## 安装

推荐先创建虚拟环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

当前 Python 依赖主要用于更可靠地解析简历 PDF：

- `pdfplumber`：优先解析 PDF 文本，保留较好的版面和换行信息。
- `pypdf`：PDF 文本解析备用方案。

如果没有安装依赖，系统会回退到标准库解析方式，但复杂 PDF 的解析质量会比较有限。

## 启动网站

在项目根目录运行：

```bash
python3 server.py
```

然后打开：

```text
http://127.0.0.1:8765
```

如果浏览器显示 `127.0.0.1 refused to connect`，通常表示本地服务没有启动，重新运行 `python3 server.py` 即可。

## 安装 Chrome 插件

先确认本地服务已经启动，然后：

1. 打开 `chrome://extensions/`
2. 打开右上角 `Developer mode`
3. 点击 `Load unpacked`
4. 选择本项目里的 `extension/` 文件夹

使用方式：

1. 打开一个招聘 JD 页面。
2. 推荐先选中页面里的 JD 正文。
3. 点击 Chrome 工具栏里的 `Job Tracker Capture`。
4. 确认公司名和岗位名。
5. 点击保存。

插件会把当前页面 URL、页面标题、完整 HTML、JD 文本发送到本地服务，并写入 Dashboard。

## 插件一键启动服务

普通浏览器扩展出于安全限制，不能直接执行本机 Python 命令。所以插件想要“一键启动 `server.py`”，必须额外安装 Native Messaging helper。

安装方式：

```bash
python3 native_host/install_native_host.py <你的 Chrome 扩展 ID>
```

扩展 ID 可以在 `chrome://extensions` 中打开 Developer mode 后看到。安装完成后，重新加载插件。

安装 helper 后，如果插件检测到本地服务离线，会显示：

- `尝试启动`：通过 Native Messaging helper 启动 `server.py`。
- `复制命令`：复制 `python3 server.py`，方便手动运行。
- `重新检测`：重新检查 `http://127.0.0.1:8765`。

helper 日志写入：

```text
data/native_host.log
```

## 本地数据和隐私

运行时数据都在：

```text
data/
```

常见内容包括：

- `data/tracker.db`：SQLite 数据库。
- `data/jobs/`：保存的 JD Markdown 和 HTML 备份。
- `data/resumes/`：上传或生成的简历文件。
- `data/native_host.log`：Native Messaging helper 日志。

`data/` 已经在 `.gitignore` 中，不会提交到 GitHub。真实求职数据、个人简历、复盘内容都只保存在本机。

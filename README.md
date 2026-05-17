# Job Application Tracker MVP

这是一个零依赖本地 MVP，用 Python 标准库提供本地 API、SQLite 数据库和浏览器 Dashboard。

## 运行

```bash
python3 server.py
```

然后打开：

```text
http://127.0.0.1:8765
```

## 当前支持

* 新增岗位
* Chrome 插件保存当前网页
* 插件抓取当前 URL、页面标题、完整 HTML、选中的 JD 文本
* 保存 JD 为 Markdown
* 保存 HTML 备份
* SQLite 本地数据库
* Dashboard 表格
* 状态筛选和搜索
* 状态更新自动写入 Timeline
* 手动新增 Timeline 事件
* 点击打开本地 JD
* 删除岗位及对应本地 JD 文件夹

## 本地数据位置

```text
data/tracker.db
data/jobs/
```

`data/` 是运行时生成目录，后续可以加入备份和导出功能。

## Chrome 插件 MVP

先启动本地服务：

```bash
python3 server.py
```

然后安装插件：

1. 打开 Chrome 的 `chrome://extensions/`
2. 打开右上角 `Developer mode`
3. 点击 `Load unpacked`
4. 选择本项目里的 `extension/` 文件夹

使用方式：

1. 打开一个招聘 JD 页面
2. 推荐先选中页面里的 JD 正文
3. 点击 Chrome 工具栏里的 `Job Tracker Capture`
4. 确认公司名和岗位名
5. 点击保存

插件会把当前页面 URL、页面标题、完整 HTML、JD 文本发送到本地服务，并自动写入 Dashboard。

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

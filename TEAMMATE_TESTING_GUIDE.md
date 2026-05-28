# Teammate Testing Guide

这份文档给开发和测试使用，不面向最终用户。README 只保留客户视角的使用说明；测试数据、demo seed、协作流程都放在这里。

## 数据边界

真实使用数据不要提交到任何分支。

本地运行时数据都在：

```text
data/
```

包括：

- `data/tracker.db`
- `data/jobs/`
- `data/resumes/`
- `data/native_host.log`

`data/` 已经在 `.gitignore` 中，所以默认不会进入 GitHub。测试时如果需要样例数据，请用 seed 脚本生成，不要手动提交数据库或简历文件。

## Demo 用户画像

当前 seed 脚本会生成一组真实感但完全虚构的数据，方便模拟不同使用场景。

### Persona A: Data Analyst Graduate

- 目标岗位：Junior Product Analyst、Data Analyst、BI Intern
- 关注点：SQL、Python、dashboard、funnel analysis、A/B testing
- 使用重点：
  - Resume Profiles 里选择 Data Analyst 版本。
  - Application Question Bank 里复用 sponsorship、dashboard impact 类答案。
  - Company Notes 里重点看 analytics / SaaS 公司。
  - Weekly Review 里总结投递转化和 follow-up。

### Persona B: Product Operations Candidate

- 目标岗位：Product Operations Associate、Operations Data Analyst
- 关注点：流程优化、CRM、stakeholder management、documentation
- 使用重点：
  - Resume Profiles 里选择 Product Operations 版本。
  - Interview Story Library 里使用流程优化和优先级排序故事。
  - Company Notes 里记录公司流程、文化和面试重点。
  - Calendar Review 里查看每天的投递和复盘。

### Persona C: Active Interview Pipeline

- 目标状态：已有 OA、面试和待 follow-up 岗位。
- 关注点：下一步动作是否清楚、Timeline 是否完整、准备材料是否能复用。
- 使用重点：
  - Track 页面检查每个岗位的 stage、status、next action。
  - Main Dashboard 查看近期需要处理的事项。
  - Weekly Review 判断本周卡点。
  - Interview Stories 准备行为面试答案。

## 生成 Demo 数据

先启动服务：

```bash
python3 server.py
```

然后运行：

```bash
python3 scripts/seed_demo_data.py
```

脚本会在本地 `data/` 中创建带 `demo` 标签的样例：

- 用户画像
- Resume Profiles
- 岗位记录
- Timeline
- Application Question Bank
- Interview Story Library
- Company Research Notes

再次运行会先清理旧 demo 数据，再重新生成。它不会自动运行，也不会把 demo 数据提交到 GitHub。

## Chrome 插件测试

1. 启动本地服务：

```bash
python3 server.py
```

2. 打开 Chrome：

```text
chrome://extensions/
```

3. 打开 `Developer mode`。
4. 点击 `Load unpacked`。
5. 选择项目里的 `extension/` 文件夹。
6. 打开一个招聘 JD 页面。
7. 选中 JD 正文。
8. 点击插件并保存岗位。
9. 回到 `http://127.0.0.1:8765` 检查岗位是否出现在 Dashboard 和 Track 页面。

如果插件显示 `Offline`，先确认 `python3 server.py` 还在运行，再点击插件里的 `重新检测`。

## Native Messaging Helper 测试

普通 Chrome 插件不能直接启动本地 Python 进程。要测试插件里的 `尝试启动`，需要安装 Native Messaging helper。

1. 在 `chrome://extensions/` 找到插件 ID。
2. 运行：

```bash
python3 native_host/install_native_host.py <你的 Chrome 扩展 ID>
```

3. 重新加载插件。
4. 停掉本地 `server.py`。
5. 打开插件，点击 `尝试启动`。
6. 检查 Dashboard 是否能打开。

日志位置：

```text
data/native_host.log
```

## 自动化检查

运行 smoke test：

```bash
python3 tests/smoke_test.py
```

检查前端 JavaScript：

```bash
node --check web/app.js
node --check extension/popup.js
```

检查 Python：

```bash
python3 -m py_compile server.py tests/smoke_test.py scripts/seed_demo_data.py native_host/job_tracker_launcher.py native_host/install_native_host.py
```

## Git 工作流

克隆仓库后运行一次：

```bash
./setup.sh
```

它会启用 `.githooks/pre-push`。

pre-push 会在每次 push 前检查当前分支和 `origin/main` 的关系：

- 如果当前分支只是落后 main，且没有未提交改动，会自动 fast-forward。
- 如果当前分支有新提交，同时 main 也更新了，会尝试用普通 merge 合入 `origin/main`。
- 如果检测到历史 squash merge 导致的重复提交风险，会停止并给出处理建议。
- 如果设置 `PRE_PUSH_RESET_MERGED=1`，可以在确认提交内容已经等价进入 main 后，自动备份并把当前分支同步到 `origin/main`。

这个 hook 的目标是减少两个人长期功能分支开发时的重复冲突，但它不会在有未提交改动时自动改写分支历史。

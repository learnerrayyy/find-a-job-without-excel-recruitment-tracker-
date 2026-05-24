#!/bin/sh
# 克隆仓库后运行一次，安装 git hooks
git config core.hooksPath .githooks
chmod +x .githooks/pre-push
echo "✅ Git hooks 安装完成。每次 push 前会检查与 main 的同步状态，不会自动改写历史。"

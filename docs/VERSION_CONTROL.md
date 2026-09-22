# 本地版本管理

本仓库从 Quiet Paper **0.1.1** 开始记录历史，默认分支为 `main`，初始基准标签为 `v0.1.1`。这不是对更早开发过程的补录；此前的 0.1.0 没有独立的 Git 提交。

仓库保存在当前项目目录的 `.git` 中，可直接用 VS Code、Git 命令行或其他 Git 客户端管理。当前只做本地版本管理，没有配置远程仓库。

## 查看现状

在项目目录打开终端：

```sh
git status
git log --oneline --decorate --graph --all
git show --stat HEAD
```

查看当前文件相对基准版本的变化：

```sh
git diff v0.1.1
```

## 保存下一轮改动

每轮修改后先检查差异，运行相应验证，再提交。修改主题源码时运行 `npm run check`，间距相关修改另运行 `npm run test:spacing`，外观与界面修改另运行 `npm run test:appearance`，同时提交源码和生成的根目录 `theme.css`。

```sh
git diff
npm run check
git add src theme.css
git diff --cached
git commit -m "fix: describe the typography adjustment"
```

若本轮还修改了文档、版本号或脚本，请一并选择这些文件暂存。可以使用 VS Code 的源代码管理面板完成选择、比较与提交。

## 查看旧版

仅查看某个旧文件，不改变当前工作目录：

```sh
git show v0.1.1:src/00-settings.css
```

确实需要切换旧版进行检查时，先提交或妥善保存当前改动，然后从旧标签创建新分支：

```sh
git switch -c inspect-v0.1.1 v0.1.1
```

检查结束后可切回 `main`。需要撤销已提交的某次修改时，优先考虑 `git revert <提交号>`，它会生成一条新的撤销记录并保留历史；遇到冲突应先解决再提交。

## 哪些文件会保存

会保存主题源码、生成的 `theme.css`、字体资源与许可、构建脚本、依赖锁文件、演示笔记和说明文档。

不保存 `node_modules/`、`.local/`、`dist/`、演示库的临时工作区状态及重复生成的主题副本。安装包可以通过构建和打包脚本重新生成。Git 提交只保存在本机；同步到 GitHub 等远程服务需要另行配置与推送。

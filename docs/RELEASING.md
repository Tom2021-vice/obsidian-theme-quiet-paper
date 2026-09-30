# 发布流程

1. 更新 `manifest.json`、`package.json`、锁文件版本与 `versions.json`，补充 CHANGELOG，并同步英文与中文 README。
2. 运行 `npm ci`、`npm run check`、`npm run check:community`、`npm test`。
3. 在独立测试库中手动检查此次修改涉及的视图与交互。
4. 运行 `python scripts/package.py`，检查两个版本化 ZIP。
5. 提交源码、文档和生成的 `theme.css`；确认工作区干净。
6. 在目标公开仓库创建与 manifest 版本一致的标签（例如 `0.1.8`）与 GitHub Release，上传 `theme.css`、`manifest.json`、主题 ZIP 和演示 ZIP。

GitHub 上的源码发布与提交 Obsidian 社区主题列表是两件事。社区上架需另外按官方流程提交。

安装包采用明确文件清单，不包含 `.local`、开发依赖、工作区状态、Git 历史或个人配置。主题与演示包都附带 MIT、字体许可和来源说明。

README 中的静态预览若需要更新，先运行 `npm run test:appearance`，再复制 `.local/review/appearance-virtual-root-theme-light.png` 与对应深色文件到 `docs/assets/preview-light.png` 和 `preview-dark.png`；检查图中没有个人数据，保留静态样张标记。

Community Directory 支持先使用 Review branch 检查分支或提交，无需立即发布。保留警告的原因见 [审查记录](COMMUNITY-REVIEW.md)，远端结果不由本地 Stylelint 成功与否代替。

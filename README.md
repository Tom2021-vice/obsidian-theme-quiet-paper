# Quiet Paper · 静纸

为 Obsidian 打造的纸张风格主题：舒适的中西文衬线排版、温暖的浅深配色，以及更清楚的内容层级。

A paper-inspired Obsidian theme with serif typography, warm light and dark palettes, and a colorful file explorer.

**版本 0.1.6 · Obsidian ≥ 1.13.7 · Windows 优先 · 无必需插件**

## 预览

| 浅色 | 深色 |
| --- | --- |
| ![浅色静态样张](docs/assets/preview-light.png) | ![深色静态样张](docs/assets/preview-dark.png) |

以上是从主题 CSS 生成的静态样张，不是 Obsidian 实机截图。实际效果受字体、缩放与应用版本影响。

## 特性

- **纸面布局**：居中的正文区域、柔和阴影与自适应留白。
- **中西文衬线正文**：内嵌 TeX Gyre Pagella 西文字体，中文使用本机宋体类字体。
- **双视图排版**：阅读视图与实时预览共享字体、版心与间距参数。
- **清楚的内容边界**：暖色引用底板、琥珀色行内代码、低饱和 Callout 提示框。
- **有层次的排版**：六级标题、实心圆 / 空心圆 / 方形列表符号，以及暖色表头；表格不使用斑马纹。
- **自然的混排**：默认左对齐，可选择两端对齐；字号、界面与代码字体遵循 Obsidian 设置。
- **彩虹目录**：八组低饱和配色、层级线、开合文件夹图标与选中高亮。
- **柔和的界面**：浅深配色、圆角文档标签，保留 Obsidian 原有操作方式。
- **离线可用**：字体嵌入主题 CSS，运行时不请求远程资源。

## 安装

当前使用手动安装；GitHub 开源不等于已经上架 Obsidian 社区主题列表。

1. 如果已有 [Release](https://github.com/Tom2021-vice/obsidian-theme-quiet-paper/releases)，可下载主题安装包；也可以直接下载根目录的 [theme.css](theme.css) 和 [manifest.json](manifest.json) 原始文件。
2. 在自己的笔记库中创建 `.obsidian/themes/Quiet Paper/`，将这两个文件放进去：

   ```text
   你的笔记库/
   └─ .obsidian/themes/Quiet Paper/
      ├─ manifest.json
      └─ theme.css
   ```

3. 打开 Obsidian「设置 → 外观 → 主题」，选择 **Quiet Paper**。
4. 按喜好选择浅色或深色，建议先将正文字号设为 **18**，并在编辑器设置中开启「缩减栏宽」。

更新时替换 `theme.css` 与 `manifest.json` 即可。若没有立即生效，可手动切换到默认主题，再切回 Quiet Paper。演示库配置用于独立测试，请勿覆盖个人笔记库的 `.obsidian` 配置。

## 字体

| 用途 | 默认方案 | 是否内嵌 |
| --- | --- | --- |
| 西文正文 | TeX Gyre Pagella，含粗体、斜体与粗斜体 | 是 |
| 中文正文 | Noto Serif SC / Source Han Serif SC，回退到系统宋体 | 否 |
| 界面 | Obsidian 的界面字体设置或系统默认 | 否 |
| 代码 | Obsidian 的等宽字体设置或系统默认 | 否 |
| 数学公式 | Obsidian 原生 MathJax 字体 | 否 |

建议安装 [Noto Serif SC](https://fonts.google.com/noto/specimen/Noto+Serif+SC) 或 [思源宋体](https://github.com/adobe-fonts/source-han-serif)。在 Obsidian 外观设置中清空自定义的**正文字体**，可以让主题的中西文字体搭配生效；界面字体和等宽字体沿用个人设置；没有自定义时使用 Obsidian 原生默认值。主题不固定正文字号，18 只是建议值，段间距会随字号缩放。

H4 / H5 / H6 请求字重为 650 / 600 / 600，H6 另用次要文字颜色。实际粗细取决于字体可用字重；内嵌 Pagella 只有 400 与 700，浏览器会匹配可用字重。

## 自定义

主题可以独立使用。若已安装 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings)，可在 **Quiet Paper · 静纸** 中调整：

| 选项 | 默认值 / 作用 |
| --- | --- |
| 正文宽度 | `40em` |
| 正文行高 | `1.6` |
| 纸面内边距 | `1.9em` |
| 中文字体 | 优先使用本机 Noto Serif SC / 思源宋体 |
| 保留完整空行高度 | 默认关闭；开启后取消实时预览的空行收紧 |
| 简洁文件目录 | 默认关闭；开启后移除彩虹分组与装饰图标 |
| 平整纸面 | 去掉纸面圆角与阴影 |
| 两端对齐正文 | 默认关闭；开启后使用两端对齐，打印仍左对齐 |

从 0.1.5 升级时，旧「左对齐正文」选项已被默认左对齐取代。需要书籍式对齐时，请开启新的「两端对齐正文」；长路径和中英混排建议保持默认。

也可以使用 CSS 片段调整数值：

```css
body {
  --qp-line-width: 40em;
  --qp-line-height: 1.6;
  --qp-paper-padding: 1.9em;
  --qp-cjk-font: "Noto Serif SC", "Source Han Serif SC", "SimSun";
}
```

## 兼容性与已知限制

- Windows 上已获得实际使用反馈；其他平台、移动端和打印尚未完整验收。
- 实时预览会在光标进入空行时恢复正常行高，可能出现局部位移；可开启「保留完整空行高度」。
- 彩虹目录按当前挂载的顶层文件夹顺序配色。排序或长目录滚动可能改变色序，目前没有固定路径配色。
- 表格前的空行属于 Markdown 内容，主题只调整显示，不改变解析规则或笔记文本。
- 两端对齐使用浏览器原生能力，没有实现 Knuth–Plass 全段断行；公式仍由 MathJax 渲染。
- Style Settings 面板及第三方图标插件的组合兼容性仍需更多实测。

详细范围见 [验证说明](docs/VALIDATION.md)。

## 开发

需要 Node.js 22+；打包另需 Python 3.10+。浏览器检查默认使用本机 Microsoft Edge。

```sh
npm ci
npm run check
npm test
python scripts/package.py
```

编辑 `src/*.css`，再构建生成根目录 `theme.css`。构建同时更新 `dist/Quiet Paper/` 和项目演示库中的主题副本，不写入个人笔记库，也不启动 Obsidian。首次安装依赖需要联网，常规构建与测试使用本地资源。

使用其他 Chromium 浏览器时，设置 `QP_BROWSER_EXECUTABLE` 为其可执行文件路径。测试启动独立无界面浏览器，不连接已有会话。

```text
src/             分模块维护的主题 CSS
assets/fonts/    内嵌字体、来源记录与许可
demo-vault/      原创排版与编辑检查笔记
scripts/         构建、字体准备与打包脚本
tests/           独立浏览器 CSS 回归检查
docs/            验证说明、路线图与预览图
.github/         CI、Issue 与 PR 模板
theme.css        可直接安装的生成文件
manifest.json    Obsidian 主题元数据
versions.json    版本与最低应用版本映射
```

提交前请阅读 [贡献指南](CONTRIBUTING.md)。问题反馈请使用 [GitHub Issues](https://github.com/Tom2021-vice/obsidian-theme-quiet-paper/issues)。版本变化见 [CHANGELOG](CHANGELOG.md)，后续方向见 [路线图](docs/ROADMAP.md)。

## 致谢与许可

设计灵感来自 [Telari](https://telari.app/) 的文档排版。本项目是独立主题，与 Telari 无关联，也不包含其应用代码、截图或转录样例文案。

主题代码、文档与原创演示采用 [MIT License](LICENSE)。内嵌字体采用 **GUST Font License**，不属于 MIT 许可范围；来源、格式转换与完整许可见 [ATTRIBUTION](ATTRIBUTION.md)。

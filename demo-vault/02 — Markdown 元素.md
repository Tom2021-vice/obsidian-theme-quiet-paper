# 把内容安放在纸上

这是一页用于检查主题的普通笔记。**粗体帮助辨认重点**，*italic gives a sentence a different voice*，而 ==标记== 与 ~~删除线~~ 都应保留清晰的含义。中英文混排需要观察字面、标点、数字 2026 和行内公式 $a^2+b^2=c^2$ 的关系。

## 链接与层级

读完后，可以回到 [[01 — 排版样本]]，或者访问 [Obsidian 官方帮助](https://help.obsidian.md/)。尚未创建的 [[未来的一页]] 应有不同的状态。

### 三级标题 · 小节

标题应像正文的一部分，与上下文保持连续。一个很长很长的标题在狭窄的面板里也应自然换行，不压住正文与相邻的内容。

#### 四级标题

段落有清楚的起点，也有自然的行尾。

##### 五级标题

这行文字检查小标题与正文之间的间距。

###### 六级标题

小层级同样应该容易辨认。

## 列表与任务

- 阅读：字体、行距和正文宽度。
- 写作：中文输入、光标、选择和撤销。
  - 嵌套内容保持一致的缩进。
  - 比较实时预览与阅读视图。
- 回看：切换模式后找到原来的位置。

1. 先确定字体。
2. 再确定版心。
3. 最后调整细节。

- [ ] 检查行内链接和公式的编辑状态
- [x] 准备一份可重复使用的样例

## 引用与提示

> 文字需要留白，也需要边界。
>
> A paragraph should have room to breathe, without losing its place on the page.

> [!note] 阅读笔记
> 这是一段 Callout。它可以包含 **强调**、链接和公式 $E=mc^2$。

> [!warning]- 可折叠提示
> 检查折叠箭头、展开后的内容与键盘操作。

## 表格

| 内容 | 阅读视图 | 实时预览 |
| :--- | :---: | :---: |
| 正文与标题 | 校准字体 | 校准字体 |
| 公式 $\frac{1}{n^2}$ | 检查基线 | 检查编辑 |
| 行内 `code` | 独立字体 | 独立字体 |

## 代码

在正文里执行 `npm run build`，行内代码与前后的文字应有轻微间隔。

```javascript
function proportion(width, ratio = (1 + Math.sqrt(5)) / 2) {
  // Keep the measure, let the margins breathe.
  return { column: width / ratio, remainder: width - width / ratio };
}
```

## 数学

行内分数 $\frac{1+\sqrt5}{2}$、上下标 $x_i^{(t+1)}$ 与根号 $\sqrt{a^2+b^2}$ 不应被截断。

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0}, &
\nabla \cdot \mathbf{B} &= 0,\\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t}, &
\nabla \times \mathbf{B} &= \mu_0\mathbf{J}+\mu_0\varepsilon_0\frac{\partial \mathbf{E}}{\partial t}.
\end{aligned}
$$

## 图片与嵌入

![[assets/proportion.svg]]

![[03 — 边界检查#短段落]]

---

注释与正文应形成轻柔的层级，而不影响阅读。[^note]

[^note]: 这是脚注。包含 [链接](https://obsidian.md/) 与数字 1735。

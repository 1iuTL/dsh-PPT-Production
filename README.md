# PPT 工作台

[![GitHub](https://img.shields.io/badge/GitHub-dsh--PPT--Production-181717?logo=github)](https://github.com/1iuTL/dsh-PPT-Production)

> 内部包名：`dsh-ppt-production`；GitHub 仓库：`1iuTL/dsh-PPT-Production`；右侧栏工作台显示名：**PPT 工作台**。

在 DeepSeek Harness 里做**原生可编辑**的 PPT：JSON deck 模型 → `.pptx` + HTML 预览 + 可继续编辑的模型。

- **真实文本框**：pptx 里的文字是 `<a:t>` 文本 run，不是整页 PNG；可在 PowerPoint / WPS / Keynote 直接改。
- **模型是事实源**：`.deck.json` 记录内容与顺序；改稿只改模型再重建。
- **零运行期依赖**：PptxGenJS 已打包进 `vendor/`，运行时不装 npm 包、不联网。
- **原创资产**：风格名、文案、图标全部原创；不含任何第三方产品的预设名、预览 HTML、代码或图标。

## 安装

在 DSH 会话里把本目录作为 bundle 安装（需要审批）：

```text
plugin_manager action=install_bundle target=C:\path\to\dsh-ppt-plugin
```

或从 [Releases](https://github.com/1iuTL/dsh-PPT-Production/releases) 下载 `dsh-ppt-production.tgz`，用同一个 `install_bundle` 指向本地 tgz：

```text
plugin_manager action=install_bundle target=C:\path\to\dsh-ppt-production.tgz
```

> `v*` tag 会触发 GitHub Actions 打包并在 Release 挂上 `dsh-ppt-production.tgz`。

安装后可见五个工具：`deck_styles` / `deck_plan` / `deck_build` / `deck_read` / `deck_edit`，以及 `deck-maker` 工作流 skill 和右侧 **PPT 工作台**。

## 五个工具

| 工具 | 用途 |
|---|---|
| `deck_styles` | 列出内置原创风格（色板/字体/密度/三条规则）。 |
| `deck_plan` | 把逐页大纲与推荐风格登记到右侧工作台，供用户查看/编辑/批准。 |
| `deck_build` | deck 模型 → `.deck.json` + `.pptx` + `.preview.html`。 |
| `deck_read` | 读现有 pptx 的页数、每页文字、形状/图片计数。 |
| `deck_edit` | 对 `.deck.json` 施加一个 patch，再重建三件套。 |

## 内置工作台

制作 PPT 时，AI 先一次问清，再调用 `deck_plan`；客户端会：

1. 在对话里显示 **计划卡**（缩略色条 / 标题 / `N 张幻灯片 · 字体` / 展开收起 / “查看大纲”）；
2. **自动展开右侧工作台**并显示逐页大纲与风格；
3. “查看大纲”可随时把工作台重新聚焦。

工作台内容：

- **幻灯片大纲**：模型调用 `deck_plan` 后显示逐页标题与要点；可点“编辑”直接改（每行一页：`标题 | 要点1；要点2`）。
- **视觉风格**：建议 / 预设 / 自定义三个页签；点卡片选风格。自定义页签内置 Photoshop 风格取色器：色域方块、色相条、HEX、RGB / HSB / CMYK。背景色 / 正文色 / 强调色各是一组颜色：主色 + 附属色，点 `+` 添加颜色；**右键任意颜色 → “删除此颜色”**（删主色时由第一条附属色顶上；没有附属色时不可删）。强调色附属色会按页轮换到页眉色条，背景/正文的附属色先随 `styleOverrides` 保存。
- **建议更改 / 批准并构建**：批准会把大纲、风格和 `styleOverrides` 写进输入框并发送；模型随后 `deck_build`，再用 `present` 交付 pptx。
- **构建结果**：工作台显示已构建页数与 pptx 路径；点击对话里的交付卡，即可在 DSH 右侧内置窗口预览 PPTX（本地转 PDF）。

对话里还会出现一张 **计划卡**（`deck_plan` 的工具视图）：标题、`N 张幻灯片 · 字体`、展开/收起大纲，以及“查看大纲”入口；点“查看大纲”直接打开右侧工作台。

## 快速开始

```json
{
  "meta": { "title": "示例演示" },
  "style": "ink-paper",
  "slides": [
    { "id": "s1", "layout": "cover", "title": "示例演示", "subtitle": "原生可编辑" },
    { "id": "s2", "layout": "title-body", "title": "要点", "body": ["真实文本框", "HTML 预览"], "notes": "演讲备注" },
    { "id": "s3", "layout": "closing", "title": "谢谢" }
  ]
}
```

```text
deck_build { deck: <上面的模型>, outDir: "C:\\decks" }
```

构建后调用 `present` 交付 `.pptx`；点击交付卡在右侧内置窗口预览，不需要外部 PowerPoint。需要直接编辑时再用 PowerPoint/WPS 打开。

输出：

```text
C:\decks\示例演示.deck.json
C:\decks\示例演示.pptx
C:\decks\示例演示.preview.html
```

改稿：

```text
deck_edit { modelPath: "C:\\decks\\示例演示.deck.json", patch: { op: "set-text", slideId: "s2", field: "title", value: "新标题" } }
```

## 模型

- `layout`：`cover` / `section` / `title-body` / `two-col` / `image` / `closing`。
- `body` / `left` / `right`：字符串数组。
- `image`：`{ path, caption? }`；图片用本地路径，版权素材须用户提供或可再分发。
- `notes`：演讲备注，写入 pptx 备注页。
- `id` 可省略；重复 id 会被拒绝。

## 局限

- HTML 预览只用于看内容与大致版式，**不等于 pptx 像素**；最终视觉须在外部 PowerPoint/WPS 打开确认。
- 本机没有 PowerPoint 渲染器；自动化验收是结构校验（解压断言真实 `<a:t>`）、build→read 往返、编辑重建与 HTML 预览，不等于视觉正确。
- `deck_read` 是零依赖 unzip + 正则抽取的只读摘要，不是完整 OOXML 解析。
- MVP 不提供“外部已有 pptx 的无损原生编辑”。

## 验证

```text
node --test "tests/*.test.mjs"
node scripts/spike.mjs
```

本机验证记录见 [docs/VALIDATION.md](docs/VALIDATION.md)。

## 许可

MIT。pptx 生成使用 [PptxGenJS](https://github.com/gitbrent/PptxGenJS)（MIT），已打包进 `vendor/pptxgen.bundle.mjs`，许可文本见 `vendor/pptxgenjs.LICENSE`。

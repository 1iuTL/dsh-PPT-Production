# PPT 工作台（dsh-ppt-production）

在 DeepSeek Harness 里把一份 JSON deck 模型变成：

1. **原生可编辑的 `.pptx`**：文字是真实文本框，图片与形状是原生对象，可在 PowerPoint / WPS / Keynote 里直接改；
2. **HTML 预览**：单文件、无外部依赖，双击即可在浏览器里看版式；
3. **`.deck.json` 模型**：唯一事实源，后续改稿只改模型再重建。

## 工具

| 工具 | 用途 |
|---|---|
| `deck_styles` | 列出内置原创风格（色板/字体/密度/三条规则）。 |
| `deck_plan` | 把逐页大纲与推荐风格登记到右侧工作台，供用户查看/编辑/批准。 |
| `deck_build` | 把 deck 模型渲染成 `.deck.json` + `.pptx` + `.preview.html`，返回三件套路径。 |
| `deck_read` | 读现有 pptx：页数、每页文字、形状/图片计数（只读摘要）。 |
| `deck_edit` | 对 `.deck.json` 施加一个 patch，再重建三件套。 |

## 右侧内置工作台

安装后，用户说“制作 PPT”时，AI 先一次问清，再调用 `deck_plan`；客户端会在对话里显示计划卡（缩略色条 / 标题 / `N 张幻灯片 · 字体` / 展开收起 / “查看大纲”），并**自动展开右侧工作台**。

工作台内容：

- 模型调用 `deck_plan` 登记大纲后，工作台显示逐页标题、要点与备注。
- “编辑”把大纲变成文本框（每行一页：`标题 | 要点1；要点2`）；“重置”回到模型版本。
- “视觉风格”提供建议 / 预设 / 自定义；自定义页签有 Photoshop 风格取色器（色域方块、色相条、HEX、RGB / HSB / CMYK）。背景色 / 正文色 / 强调色各是一组颜色：主色 + 附属色，点 `+` 添加；右键任意颜色可选“删除此颜色”（删主色时第一条附属色顶上；没有附属色时不可删）。强调色附属色按页轮换到页眉色条；背景附属色用于 section/closing 页背景，正文附属色用于这些页的大标题并自动检查对比度。
- “批准并构建”会把大纲、风格和 overrides 写进输入框并发送；模型调用 `deck_build`，再 `present` 交付。
- 构建后工作台显示页数与 pptx 路径；点击对话里的交付卡，在右侧内置窗口预览 PPTX（本地转 PDF），不需要外部 PowerPoint。

`deck_plan` 还会在对话里渲染一张计划卡：缩略色条、标题、`N 张幻灯片 · 字体`、展开/收起大纲和“查看大纲”；“查看大纲”打开右侧工作台。

`deck_build` 参数：

- `deck`：deck 模型（必填）。
- `style`：风格 id；缺省用模型里的 `style`，再缺省 `ink-paper`。
- `outDir`：输出目录；建议显式传会话工作区。

`deck_edit` 参数：

- `modelPath`：`deck_build` 落盘的 `.deck.json` 路径（必填）。
- `patch`：单个 patch 操作（必填）。
- `outDir`：输出目录；缺省模型所在目录。

## deck 模型

```json
{
  "meta": {
    "title": "示例演示",
    "author": "dsh-ppt-production",
    "subject": "可选主题",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "style": "ink-paper",
  "slides": [
    { "id": "s1", "layout": "cover", "title": "标题", "subtitle": "副标题" },
    { "id": "s2", "layout": "title-body", "title": "要点", "body": ["第一点", "第二点"], "notes": "演讲备注" }
  ]
}
```

- `layout`：`cover` / `section` / `title-body` / `two-col` / `image` / `closing`。
- `body` / `left` / `right`：字符串数组。
- `image`：`{ "path": "本地图片路径", "caption": "可选图注" }`。
- `notes`：演讲备注，写入 pptx 备注页。
- `id` 可省略，`normalizeDeck` 会补 `s1`、`s2`…；重复 id 会被拒绝。

## patch 操作

| op | 参数 | 作用 |
|---|---|---|
| `set-text` | `slideId`, `field`(`title`/`subtitle`/`notes`), `value` | 改一段文字 |
| `set-body` | `slideId`, `body` | 换要点列表 |
| `swap-image` | `slideId`, `path`, `caption?` | 换图/改图注 |
| `delete-slide` | `slideId` | 删页 |
| `reorder` | `order`（必须含全部 id 且不重复） | 重排 |
| `add-slide` | `slide`, `after?` | 加页 |

patch 不可变：返回新模型，原对象不被修改；非法 op / 未知 id / 重复 id 会返回可读错误。

## 安装与启用

把插件目录作为 bundle 安装：

```text
plugin_manager action=install_bundle target=<dsh-ppt-plugin 绝对目录>
```

安装后新会话/刷新后可见四个 `deck_*` 工具、`deck-maker` skill 与一段 PPT 工作流提示。`cordis.patch.yml` 已声明 `insert` 行；不要手写 profile 的 `package.json` / `cordis.patch.yml`，也不要用 pnpm 直接装。

## 局限（必读）

- **HTML 预览 ≠ pptx 像素**：它只用于看内容与大致版式；最终视觉必须在外部 PowerPoint/WPS 打开确认。
- **本机无 PowerPoint 渲染器**：插件的自动化验收是结构校验（解压 pptx 断言真实 `<a:t>` 文本）、build→read 往返、编辑重建与 HTML 预览；这些不等于视觉正确。
- **`deck_read` 是只读摘要**：用零依赖 unzip + 正则抽取 `<a:t>` 文本与 shape/picture 计数，不是完整 OOXML 解析，也不还原排版。
- **原生可编辑 = 自建 deck**：MVP 不提供“外部已有 pptx 的无损原生编辑”；那是未来可选的 python-pptx 路径。
- **图片**：用本地路径；版权素材须用户提供或可再分发。`image` layout 按等比 contain 放置，不裁切。

## 原创与许可

- 插件代码、风格名、文案、图标均为原创；不含任何第三方产品的预设名、预览 HTML、图标或代码片段。
- pptx 生成使用 [PptxGenJS](https://github.com/gitbrent/PptxGenJS)（MIT），已打包进 `vendor/pptxgen.bundle.mjs`；其许可声明见 `vendor/pptxgenjs.LICENSE`。
- 本插件以 MIT 发布；运行期零 npm 依赖、零网络、零付费 API。

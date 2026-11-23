---
name: deck-maker
description: 在 DSH 里做原生可编辑 PPT 的工作流：计划→选风格→批准→构建→自检。当用户要做演示文稿/幻灯片/PPT 时使用。
---

# Deck Maker 工作流

用 `deck_styles / deck_plan / deck_build / deck_read / deck_edit` 五个工具做**原生可编辑** pptx（真实文本框，非整页图片）。

## 流程
1. **一次问清**：受众、目的、页数、关键内容、有无素材图。一次问完，别挤牙膏。
2. **计划卡**：调 `deck_plan` 把逐页 outline + 推荐风格登记到 PPT 工作台。调用后对话里出现计划卡，客户端会**自动展开右侧工作台**；用户在右侧确认/编辑/选风格。大改必须先批准；小改（改一句话/换一张图）直接做。
3. **选风格**：工作台会展示原创风格（建议/预设/自定义）；用户确认后批准消息里会带回 `plan`、`style` 和可选的 `styleOverrides`。
4. **构建**：按批准消息把内容组织成 JSON deck 模型，调 `deck_build`。模型是唯一事实源。
5. **自检**：调 `deck_read` 核对页数与文字；调 `present` 交付 `.pptx`，让用户在 DSH 右侧内置窗口预览（PPTX 本地转 PDF，文字可选中）。HTML 预览只作补充，不等于 pptx 像素。
6. **改稿**：用 `deck_edit` 改模型再重建，再 `present` 一次。两次修不好就记录并告知用户，别死循环。

## 模型要点
- `deck_plan`：`{ plan:{title,audience?,slides:[{title,bullets[],notes?}]}, style }`；只登记，不落盘。
- slide.layout ∈ cover / section / title-body / two-col / image / closing。
- 改内容用 set-text/set-body/swap-image；改结构用 delete-slide/reorder/add-slide。
- 图片用本地路径；版权素材须用户提供或可再分发。

## 红线
- 零支出：不调付费 API/云服务。
- 不抄任何第三方产品的预设名、文案、预览 HTML、代码或图标。

const POLICY = `## PPT 制作（PPT 工作台 / dsh-ppt-production）
做演示文稿时用 deck-maker 工作流与 deck_styles/deck_build/deck_read/deck_edit 工具，产原生可编辑 pptx（真实文本框）。
流程：一次问清 → deck_plan 登记大纲（对话里出现计划卡，客户端自动展开右侧工作台） → 用户在工作台确认/编辑 → deck_build 构建 → present 交付 pptx。
小改直接做，大改先批准。模型(.deck.json)是事实源，改稿用 deck_edit 改模型重建。
构建后调 present 交付 pptx；优先在 DSH 右侧内置窗口预览验收（本地转 PDF），不必先装外部 PowerPoint。HTML 预览只是布局近似。零支出，不抄任何第三方产品资产。`

export function registerDeckPrompt(ctx, config) {
  return ctx.systemPrompt.section({
    name: 'dsh-ppt-production-policy',
    order: 6100,
    interpolate: false,
    text: () => POLICY,
  })
}

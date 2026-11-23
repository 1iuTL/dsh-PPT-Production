import { registerDeckTools } from './src/tools.mjs'
import { registerDeckSkill } from './src/skill.mjs'
import { registerDeckPrompt } from './src/prompt.mjs'
import { registerDeckWorkbench } from './src/workbench-route.mjs'

export const name = 'dsh-ppt-production'
export const inject = ['tools']

export function apply(ctx, config = {}) {
  registerDeckTools(ctx, config)
  if (typeof ctx.inject === 'function') {
    ctx.inject(['webServer'], (c) => {
      try { registerDeckWorkbench(c) } catch (e) { ctx.logger?.warn?.('dsh-ppt-production: 工作台路由注册失败: ' + String(e?.message ?? e)) }
    })
    ctx.inject(['skills'], (c) => {
      try { registerDeckSkill(c) } catch (e) { ctx.logger?.warn?.('dsh-ppt-production: skill 注册失败: ' + String(e?.message ?? e)) }
    })
    if (config.promptPolicy !== false) {
      ctx.inject(['systemPrompt'], (c) => {
        try { registerDeckPrompt(c, config) } catch (e) { ctx.logger?.warn?.('dsh-ppt-production: prompt 注册失败: ' + String(e?.message ?? e)) }
      })
    }
  }
}

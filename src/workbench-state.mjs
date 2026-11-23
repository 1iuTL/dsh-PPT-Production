import { STYLES } from './styles.mjs'

// H2: 按 sessionKey 分桶，避免多会话串写
const DEFAULT_KEY = 'default'
const MAX_SESSIONS = 100
const sessions = new Map()
const emptyState = () => ({
  plan: null,
  planUpdatedAt: null,
  build: null,
  buildUpdatedAt: null,
  selectedStyle: null,
  openedAt: null,
})

function getState(key) {
  if (!sessions.has(key)) {
    if (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value)
    sessions.set(key, emptyState())
  }
  return sessions.get(key)
}

export function setPlan(plan, style, sessionKey = DEFAULT_KEY) {
  const now = new Date().toISOString()
  const prev = getState(sessionKey)
  sessions.set(sessionKey, {
    ...prev,
    plan,
    planUpdatedAt: now,
    selectedStyle: style || plan.recommendedStyle || prev.selectedStyle,
  })
}

export function setBuild(build, sessionKey = DEFAULT_KEY) {
  const prev = getState(sessionKey)
  sessions.set(sessionKey, { ...prev, build: { ...build }, buildUpdatedAt: new Date().toISOString() })
}

export function markOpened(sessionKey = DEFAULT_KEY) {
  const prev = sessions.get(sessionKey)
  if (!prev) return
  sessions.set(sessionKey, { ...prev, openedAt: new Date().toISOString() })
}

export function snapshot(sessionKey = DEFAULT_KEY) {
  // 只读查询不创建桶，避免任意 session 参数导致 Map 无界增长
  const state = sessions.get(sessionKey) || emptyState()
  const styles = STYLES.map(({ id, name, tags, density, palette, fonts, rules }) => ({
    id, name, tags, density, palette, fonts, rules,
  }))
  return {
    version: 1,
    plan: state.plan,
    planUpdatedAt: state.planUpdatedAt,
    build: state.build,
    buildUpdatedAt: state.buildUpdatedAt,
    selectedStyle: state.selectedStyle,
    styles,
    openedAt: state.openedAt,
    updatedAt: state.buildUpdatedAt || state.planUpdatedAt,
  }
}

export function resetWorkbenchState() {
  sessions.clear()
}

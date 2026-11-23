import { STYLES } from './styles.mjs'

let state = {
  plan: null,
  planUpdatedAt: null,
  build: null,
  buildUpdatedAt: null,
  selectedStyle: null,
  openedAt: null,
}

export function setPlan(plan, style) {
  const now = new Date().toISOString()
  state = {
    ...state,
    plan,
    planUpdatedAt: now,
    selectedStyle: style || plan.recommendedStyle || state.selectedStyle,
  }
}

export function setBuild(build) {
  state = { ...state, build: { ...build }, buildUpdatedAt: new Date().toISOString() }
}

export function markOpened() {
  state = { ...state, openedAt: new Date().toISOString() }
}

export function snapshot() {
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
  state = {
    plan: null,
    planUpdatedAt: null,
    build: null,
    buildUpdatedAt: null,
    selectedStyle: null,
    openedAt: null,
  }
}

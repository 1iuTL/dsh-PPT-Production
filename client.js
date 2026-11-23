window.__ModuleLoader__.load({
  id: 'dsh-ppt-production',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef } = React

    const KIND = 'dsh-ppt-production'

    // H2: 获取当前会话 ID，用于工作台状态隔离
    function getSessionId(explicit) {
      if (explicit) return String(explicit)
      try {
        // 兼容旧宿主：尝试从 URL 查询参数获取
        const params = new URLSearchParams(window.location.search)
        const fromUrl = params.get('session') || params.get('sessionId') || params.get('conversation')
        if (fromUrl) return fromUrl
        if (window.__DSH_SESSION_ID__) return window.__DSH_SESSION_ID__
        if (window.__DSH_CONVERSATION_ID__) return window.__DSH_CONVERSATION_ID__
      } catch { /* fallback */ }
      return 'default'
    }
    // H2: 拼接带 session 的 URL
    function stateUrl(sessionId) { return '/dsh-ppt-production/state?session=' + encodeURIComponent(getSessionId(sessionId)) }
    function openedUrl(sessionId) { return '/dsh-ppt-production/opened?session=' + encodeURIComponent(getSessionId(sessionId)) }
    const CSS = `
.dsm-root{height:100%;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}
.dsm-head{padding:14px 16px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsm-head h2{margin:0;font-size:16px;font-weight:600}
.dsm-head p{margin:3px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px}
.dsm-scroll{flex:1;min-height:0;overflow:auto;padding:12px 16px 8px}
.dsm-section{margin:14px 0 8px;display:flex;align-items:center;gap:8px}
.dsm-section h3{margin:0;font-size:13px;font-weight:600;flex:1}
.dsm-muted{color:var(--dsw-alias-label-secondary);font-size:12px}
.dsm-btn{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:5px 10px;font:inherit;font-size:12px;cursor:pointer}
.dsm-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.dsm-btn:disabled{opacity:.5;cursor:not-allowed}
.dsm-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.dsm-btn-primary:hover{filter:brightness(1.06);background:var(--dsw-alias-brand-primary)}
.dsm-tabs{display:flex;gap:6px;margin:6px 0 10px;flex-wrap:wrap}
.dsm-tab{border:0;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:4px 11px;font:inherit;font-size:12px;cursor:pointer}
.dsm-tab.is-active{background:var(--dsw-alias-brand-primary);color:#fff}
.dsm-card{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:10px 12px;margin:8px 0}
.dsm-slide-title{font-weight:600;font-size:13px;margin-bottom:4px}
.dsm-slide-index{color:var(--dsw-alias-label-secondary);font-size:11px;margin-bottom:2px}
.dsm-slide ul{margin:4px 0 0 18px;padding:0}
.dsm-slide li{margin:2px 0;font-size:12px;color:var(--dsw-alias-label-primary)}
.dsm-notes{margin-top:6px;padding:6px 8px;border-left:2px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:12px;background:var(--dsw-alias-bg-layer-2);border-radius:0 6px 6px 0}
.dsm-placeholder{border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:12px;color:var(--dsw-alias-label-secondary);font-size:12px}
.dsm-style-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.dsm-style{display:block;text-align:left;border:2px solid transparent;border-radius:10px;padding:10px;cursor:pointer;font:inherit;min-height:96px}
.dsm-style.is-selected{box-shadow:0 0 0 2px var(--dsw-alias-brand-primary)}
.dsm-swatches{display:flex;gap:3px;margin-bottom:6px}
.dsm-swatch{width:14px;height:14px;border-radius:4px;border:1px solid rgba(0,0,0,.12)}
.dsm-style-name{font-weight:600;font-size:13px}
.dsm-style-tags{font-size:11px;opacity:.75;margin-top:2px}
.dsm-style-rule{font-size:11px;opacity:.8;margin-top:5px;line-height:1.35}
.dsm-color-slots{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap}
.dsm-color-slot{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:5px 8px;font:inherit;font-size:12px;cursor:pointer}
.dsm-color-slot.is-active{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}
.dsm-color-dot{width:16px;height:16px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1)}
.dsm-color-sub{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:0 0 8px}
.dsm-subtab{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:3px 8px;font:inherit;font-size:11px;cursor:pointer}
.dsm-subtab.is-active{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.dsm-sub-dot{width:10px;height:10px;border-radius:3px;border:1px solid var(--dsw-alias-border-l1)}
.dsm-add-color{width:24px;height:24px;border:1px dashed var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:16px;line-height:1;cursor:pointer}
.dsm-add-color:disabled{opacity:.4;cursor:not-allowed}
.dsm-ctx{position:fixed;z-index:10000;min-width:132px;padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));box-shadow:0 8px 24px rgba(0,0,0,.18)}
.dsm-ctx-item{display:block;width:100%;border:0;background:transparent;color:var(--dsw-alias-label-primary);text-align:left;padding:7px 10px;border-radius:6px;font:inherit;font-size:12px;cursor:pointer}
.dsm-ctx-item:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
.dsm-ctx-item:disabled{color:var(--dsw-alias-label-tertiary);cursor:not-allowed}
.dsm-picker{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px;background:var(--dsw-alias-bg-layer-1)}
.dsm-sv{position:relative;height:140px;border-radius:6px;overflow:hidden;cursor:crosshair;border:1px solid var(--dsw-alias-border-l1);touch-action:none}
.dsm-sv-handle{position:absolute;width:12px;height:12px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.6);transform:translate(-50%,-50%)}
.dsm-hue{position:relative;height:14px;border-radius:7px;margin:10px 0;background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);cursor:pointer;touch-action:none}
.dsm-hue-handle{position:absolute;top:50%;width:10px;height:18px;border:1px solid rgba(0,0,0,.35);border-radius:3px;background:#fff;transform:translate(-50%,-50%)}
.dsm-hex-row{display:flex;align-items:center;gap:4px;margin:6px 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsm-hex-input{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase}
.dsm-field-group{margin-top:8px}
.dsm-group-title{display:block;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);margin-bottom:3px}
.dsm-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;font-size:11px}
.dsm-field{display:flex;align-items:center;gap:4px;min-width:0;color:var(--dsw-alias-label-tertiary)}
.dsm-field>span{flex:none;width:10px;text-align:center}
.dsm-num{padding:4px 6px;font-size:11px;border-radius:6px;height:24px}
.dsm-input,.dsm-textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:8px 10px;font:inherit;font-size:12px;resize:vertical}
.dsm-textarea{min-height:110px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.dsm-build{border:1px solid var(--dsw-alias-state-success-primary);border-radius:10px;padding:8px 10px;margin:10px 0;font-size:12px;color:var(--dsw-alias-label-primary)}
.dsm-path{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary);word-break:break-all;margin-top:3px}
.dsm-foot{border-top:1px solid var(--dsw-alias-border-l1);padding:10px 16px 12px;background:var(--dsw-alias-bg-base)}
.dsm-foot .dsm-textarea{min-height:44px;max-height:90px;margin-bottom:8px}
.dsm-actions{display:flex;justify-content:flex-end;gap:8px}
.dsm-error{color:var(--dsw-alias-state-error-primary);font-size:12px;margin:6px 0}
.dsm-plan-card{display:flex;flex-direction:column;min-width:0;margin-top:4px;overflow:hidden;border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}
.dsm-plan-head{display:flex;align-items:center;gap:10px;box-sizing:border-box;width:100%;min-width:0;min-height:60px;margin:0;padding:8px 10px;border:0;background:var(--dsw-alias-card-fill,var(--dsw-alias-bg-layer-1));color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color 120ms ease}
.dsm-plan-head:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
@media (hover:hover){.dsm-plan-head:hover{background:var(--dsw-alias-card-fill-hover,var(--dsw-alias-bg-layer-2))}}
.dsm-plan-thumb{display:flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:40px;height:40px;gap:3px;border:0.5px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-card-tile-fill,var(--dsw-alias-bg-layer-2))}
.dsm-plan-thumb i{display:block;width:4px;height:24px;border-radius:2px}
.dsm-plan-main{display:flex;flex:1;flex-direction:column;min-width:0}
.dsm-plan-title{overflow:hidden;font-size:13px;font-weight:500;line-height:20px;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary)}
.dsm-plan-meta{display:inline-flex;font-size:10px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dsm-plan-chevron{flex:none;color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:20px}
.dsm-plan-list{border-top:0.5px solid var(--dsw-alias-border-l2);max-height:220px;overflow:auto;padding:0}
.dsm-plan-slide{padding:7px 14px;border-bottom:0.5px solid var(--dsw-alias-border-l1)}
.dsm-plan-slide:last-child{border-bottom:0}
.dsm-plan-slide b{display:block;font-size:12px;font-weight:500;line-height:18px;margin-bottom:2px;color:var(--dsw-alias-label-primary)}
.dsm-plan-slide ul{margin:2px 0 0 16px;padding:0}
.dsm-plan-slide li{font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary);margin:1px 0}
.dsm-plan-link{display:flex;align-items:center;justify-content:center;gap:4px;width:100%;border:0;border-top:0.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-brand-primary);padding:10px 14px;font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.dsm-plan-link:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}
`

    function useWorkbenchState(sessionId) {
      const [state, setState] = useState(null)
      const [error, setError] = useState('')
      useEffect(() => {
        let alive = true
        let timer
        async function load() {
          // L7: 页面隐藏时跳过轮询
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
          try {
            const response = await fetch(stateUrl(sessionId), { cache: 'no-store' })
            if (!response.ok) throw new Error('HTTP ' + response.status)
            const value = await response.json()
            if (alive) { setState(value); setError('') }
          } catch (e) {
            if (alive) setError(String(e && e.message ? e.message : e))
          }
        }
        load()
        timer = setInterval(load, 2500)
        return () => { alive = false; clearInterval(timer) }
      }, [sessionId])
      return { state, error }
    }

    function escapeOutlineTitle(title) {
      return String(title || '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|')
    }

    function splitOutlineLine(line) {
      let title = '', rest = '', escaped = false, separated = false
      for (const char of line) {
        if (escaped) {
          if (separated) rest += char
          else title += char
          escaped = false
          continue
        }
        if (char === '\\') { escaped = true; continue }
        if (char === '|' && !separated) { separated = true; continue }
        if (separated) rest += char
        else title += char
      }
      if (escaped) title += '\\'
      return [title, rest]
    }

    function planToText(plan) {
      return (plan && plan.slides ? plan.slides : []).map(slide => {
        const bullets = Array.isArray(slide.bullets) ? slide.bullets : []
        return escapeOutlineTitle(slide.title) + (bullets.length ? ' | ' + bullets.join('；') : '')
      }).join('\n')
    }

    function textToSlides(text, base) {
      return String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, i) => {
        const [rawTitle, bulletText] = splitOutlineLine(line)
        const title = rawTitle.trim()
        const bullets = bulletText.split(/[；;]/).map(x => x.trim()).filter(Boolean)
        // L8: 仅在标题可唯一匹配时继承 notes/id；改标题视为新页，不继承旧备注
        const baseSlides = base && Array.isArray(base.slides) ? base.slides : []
        const prevByIndex = baseSlides[i]
        const matches = baseSlides.filter(s => s.title === title)
        const previous = (prevByIndex && prevByIndex.title === title)
          ? prevByIndex
          : (matches.length === 1 ? matches[0] : undefined)
        return {
          id: previous && previous.id ? previous.id : 'p' + (i + 1),
          title,
          bullets,
          ...(previous && previous.notes ? { notes: previous.notes } : {}),
        }
      }).filter(slide => slide.title)
    }

    function hexToRgb(hex) {
      const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim())
      const value = match ? parseInt(match[1], 16) : 0
      return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
    }

    function rgbToHex({ r, g, b }) {
      const clamp = value => Math.max(0, Math.min(255, Math.round(Number(value) || 0)))
      return '#' + [clamp(r), clamp(g), clamp(b)].map(value => value.toString(16).padStart(2, '0')).join('')
    }

    function rgbToHsv({ r, g, b }) {
      const rn = r / 255, gn = g / 255, bn = b / 255
      const max = Math.max(rn, gn, bn)
      const min = Math.min(rn, gn, bn)
      const delta = max - min
      let h = 0
      if (delta !== 0) {
        if (max === rn) h = ((gn - bn) / delta) % 6
        else if (max === gn) h = (bn - rn) / delta + 2
        else h = (rn - gn) / delta + 4
        h *= 60
        if (h < 0) h += 360
      }
      return { h, s: max === 0 ? 0 : delta / max, v: max }
    }

    function hsvToRgb({ h, s, v }) {
      const hh = ((h % 360) + 360) % 360
      const c = v * s
      const x = c * (1 - Math.abs((hh / 60) % 2 - 1))
      const m = v - c
      const table = hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x]
        : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x]
      return { r: Math.round((table[0] + m) * 255), g: Math.round((table[1] + m) * 255), b: Math.round((table[2] + m) * 255) }
    }

    function hsvToHex(hsv) {
      return rgbToHex(hsvToRgb(hsv))
    }

    function cmykOf(rgb) {
      const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
      const k = 1 - Math.max(r, g, b)
      if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 }
      const c = (1 - r - k) / (1 - k)
      const m = (1 - g - k) / (1 - k)
      const y = (1 - b - k) / (1 - k)
      return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) }
    }

    function cmykToHex(cmyk) {
      const c = Math.max(0, Math.min(100, Number(cmyk.c) || 0)) / 100
      const m = Math.max(0, Math.min(100, Number(cmyk.m) || 0)) / 100
      const y = Math.max(0, Math.min(100, Number(cmyk.y) || 0)) / 100
      const k = Math.max(0, Math.min(100, Number(cmyk.k) || 0)) / 100
      return rgbToHex({
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k)),
      })
    }

    function deleteColorEntry(entry, slot) {
      const extras = Array.isArray(entry && entry.extras) ? [...entry.extras] : []
      if (slot === 'main') {
        if (extras.length === 0) return null
        return { main: extras.shift(), extras }
      }
      const index = Number(slot)
      if (!Number.isInteger(index) || index < 0 || index >= extras.length) return null
      extras.splice(index, 1)
      return { main: entry.main, extras }
    }

    // M5: HEX 输入框本地草稿，blur/回车提交，允许逐字编辑
    function DraftHexInput({ color, onChange }) {
      const [draft, setDraft] = useState(() => color.replace('#', '').toUpperCase())
      const focused = useRef(false)
      useEffect(() => {
        if (!focused.current) setDraft(color.replace('#', '').toUpperCase())
      }, [color])
      function commit() {
        focused.current = false
        const value = draft.trim()
        if (/^[0-9a-fA-F]{6}$/.test(value)) onChange('#' + value.toLowerCase())
        else setDraft(color.replace('#', '').toUpperCase())
      }
      return h('input', {
        className: 'dsm-input dsm-hex-input', value: draft,
        onFocus: () => { focused.current = true },
        onChange: event => setDraft(event.target.value),
        onBlur: commit,
        onKeyDown: event => { if (event.key === 'Enter') commit() },
      })
    }

    // M5: 数字输入框本地草稿，blur/回车提交，允许清空/中间态
    function DraftNumField({ label, value, min, max, onCommit }) {
      const [draft, setDraft] = useState(String(value))
      const focused = useRef(false)
      useEffect(() => {
        if (!focused.current) setDraft(String(value))
      }, [value])
      function commit() {
        focused.current = false
        const trimmed = draft.trim()
        if (trimmed === '' || isNaN(Number(trimmed))) { setDraft(String(value)); return }
        onCommit(Math.max(min, Math.min(max, Number(trimmed))))
      }
      return h('label', { className: 'dsm-field' },
        h('span', null, label),
        h('input', {
          className: 'dsm-input dsm-num', type: 'number', min, max, value: draft,
          onFocus: () => { focused.current = true },
          onChange: event => setDraft(event.target.value),
          onBlur: commit,
          onKeyDown: event => { if (event.key === 'Enter') commit() },
        }))
    }

    function ColorPicker({ color, onChange }) {
      const rgb = hexToRgb(color)
      const hsv = rgbToHsv(rgb)
      const cmyk = cmykOf(rgb)
      const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 })
      function changeHsv(next) {
        onChange(hsvToHex({ ...hsv, ...next }))
      }
      function changeRgb(key, value) {
        onChange(rgbToHex({ ...rgb, [key]: value }))
      }
      function applySV(event) {
        const rect = event.currentTarget.getBoundingClientRect()
        const s = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        const v = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
        changeHsv({ s, v })
      }
      function applyHue(event) {
        const rect = event.currentTarget.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
        changeHsv({ h: ratio * 360 })
      }
      // M5: 数字输入用本地草稿，blur/回车提交，允许中间态空值
      const field = (label, value, min, max, onChangeValue) => h(DraftNumField, {
        key: label, label, value, min, max, onCommit: onChangeValue,
      })
      return h('div', { className: 'dsm-picker' },
        h('div', {
          className: 'dsm-sv',
          style: { background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, ${hueColor})` },
          onPointerDown: event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); applySV(event) },
          onPointerMove: event => { if (event.buttons & 1) applySV(event) },
        },
          h('span', { className: 'dsm-sv-handle', style: { left: (hsv.s * 100) + '%', top: ((1 - hsv.v) * 100) + '%' } })),
        h('div', {
          className: 'dsm-hue',
          onPointerDown: event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); applyHue(event) },
          onPointerMove: event => { if (event.buttons & 1) applyHue(event) },
        },
          h('span', { className: 'dsm-hue-handle', style: { left: ((hsv.h / 360) * 100) + '%' } })),
        h('div', { className: 'dsm-hex-row' },
          h('span', null, '#'),
          h(DraftHexInput, { color, onChange })),
        h('div', { className: 'dsm-field-group' },
          h('span', { className: 'dsm-group-title' }, 'RGB'),
          h('div', { className: 'dsm-fields' },
            field('R', rgb.r, 0, 255, value => changeRgb('r', value)),
            field('G', rgb.g, 0, 255, value => changeRgb('g', value)),
            field('B', rgb.b, 0, 255, value => changeRgb('b', value)))),
        h('div', { className: 'dsm-field-group' },
          h('span', { className: 'dsm-group-title' }, 'HSB'),
          h('div', { className: 'dsm-fields' },
            field('H', Math.round(hsv.h), 0, 360, value => changeHsv({ h: Number(value) || 0 })),
            field('S', Math.round(hsv.s * 100), 0, 100, value => changeHsv({ s: (Number(value) || 0) / 100 })),
            field('B', Math.round(hsv.v * 100), 0, 100, value => changeHsv({ v: (Number(value) || 0) / 100 })))),
        h('div', { className: 'dsm-field-group' },
          h('span', { className: 'dsm-group-title' }, 'CMYK'),
          h('div', { className: 'dsm-fields' },
            field('C', cmyk.c, 0, 100, value => onChange(cmykToHex({ ...cmyk, c: value }))),
            field('M', cmyk.m, 0, 100, value => onChange(cmykToHex({ ...cmyk, m: value }))),
            field('Y', cmyk.y, 0, 100, value => onChange(cmykToHex({ ...cmyk, y: value }))),
            field('K', cmyk.k, 0, 100, value => onChange(cmykToHex({ ...cmyk, k: value }))))
      ))
    }

    function StyleCard({ data, selected, onSelect }) {
      const palette = data.palette || {}
      return h('button', {
        type: 'button',
        className: 'dsm-style' + (selected ? ' is-selected' : ''),
        style: { background: palette.bg, color: palette.ink, borderColor: selected ? 'var(--dsw-alias-brand-primary)' : (palette.line || 'transparent') },
        onClick: () => onSelect(data.id),
      },
        h('div', { className: 'dsm-swatches' },
          ['bg', 'ink', 'accent', 'muted'].map(key => h('span', {
            key,
            className: 'dsm-swatch',
            style: { background: palette[key] || 'transparent' },
          }))),
        h('div', { className: 'dsm-style-name' }, data.name),
        h('div', { className: 'dsm-style-tags' }, (data.tags || []).join(' · ')),
        h('div', { className: 'dsm-style-rule' }, (data.rules || [])[0] || '')
      )
    }

    function WorkbenchAutoOpen({ onOpen, sessionId }) {
      const baseline = useRef(undefined)
      useEffect(() => {
        let alive = true
        let timer
        async function load() {
          // L7: 页面隐藏时跳过轮询
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
          try {
            const response = await fetch(stateUrl(sessionId), { cache: 'no-store' })
            if (!response.ok) return
            const value = await response.json()
            if (!alive) return
            const at = value.planUpdatedAt || null
            if (baseline.current === undefined) {
              baseline.current = at
              return
            }
            if (at !== baseline.current) {
              baseline.current = at
              if (value.plan) {
                onOpen()
                try { fetch(openedUrl(sessionId), { method: 'POST' }).catch(() => {}) } catch { /* marker only */ }
              }
            }
          } catch { /* state route unavailable */ }
        }
        load()
        timer = setInterval(load, 2000)
        return () => { alive = false; clearInterval(timer) }
      }, [onOpen, sessionId])
      return null
    }

    function PlanCard(props) {
      const { block, onOpen, sessionId } = props
      const [expanded, setExpanded] = useState(false)
      const [style, setStyle] = useState(null)
      const phase = block && block.phase
      const isResult = block && block.kind === 'tool-result'
      let result = null
      if (isResult && Array.isArray(block.content)) {
        const text = block.content
          .filter(item => item && item.type === 'text' && typeof item.text === 'string')
          .map(item => item.text)
          .join('')
        if (text) {
          try { result = JSON.parse(text) } catch { result = null }
        }
      }
      const args = block && block.args
      const argPlan = args && typeof args.value === 'function' ? args.value('plan') : undefined
      const plan = (result && result.plan) || (argPlan && typeof argPlan === 'object' ? argPlan : null)
      const styleId = (result && result.plan && result.plan.recommendedStyle)
        || (args && typeof args.text === 'function' ? args.text('style') : undefined)
      useEffect(() => {
        let alive = true
        fetch(stateUrl(sessionId), { cache: 'no-store' })
          .then(response => response.json())
          .then(value => {
            if (!alive) return
            const id = styleId || value.selectedStyle
            const found = (value.styles || []).find(item => item.id === id) || (value.styles || [])[0]
            setStyle(found || null)
          })
          .catch(() => {})
        return () => { alive = false }
      }, [styleId, sessionId])
      const slides = plan && Array.isArray(plan.slides) ? plan.slides : []
      const error = result && result.ok === false ? String(result.error || '生成大纲失败') : ''
      const title = plan && plan.title ? plan.title : (phase === 'preparing' ? '正在准备大纲…' : 'PPT 工作台大纲')
      const font = (style && style.fonts && style.fonts.heading) || 'Microsoft YaHei'
      const palette = (style && style.palette) || {}
      return h(React.Fragment, null,
        h('style', null, CSS),
        h('div', { className: 'dsm-plan-card' },
          h('button', {
            type: 'button', className: 'dsm-plan-head',
            'aria-expanded': expanded,
            onClick: () => setExpanded(value => !value),
          },
            h('div', { className: 'dsm-plan-thumb' },
              h('i', { style: { background: palette.ink || '#121214' } }),
              h('i', { style: { background: palette.accent || '#FF6900' } })),
            h('div', { className: 'dsm-plan-main' },
              h('div', { className: 'dsm-plan-title' }, title),
              h('div', { className: 'dsm-plan-meta' }, (slides.length ? slides.length + ' 张幻灯片 · ' : '') + font)),
            h('span', { className: 'dsm-plan-chevron', 'aria-hidden': true }, expanded ? '⌃' : '⌄')),
          expanded ? h('div', { className: 'dsm-plan-list' },
            slides.length
              ? slides.map((slide, index) => h('div', { key: slide.id || index, className: 'dsm-plan-slide' },
                  h('b', null, 'Slide ' + (index + 1) + ': ' + slide.title),
                  Array.isArray(slide.bullets) && slide.bullets.length
                    ? h('ul', null, slide.bullets.map((bullet, i) => h('li', { key: i }, bullet)))
                    : null))
              : h('div', { className: 'dsm-muted', style: { padding: '8px 14px' } }, '还没有大纲内容')) : null,
          error ? h('div', { className: 'dsm-error', style: { padding: '0 14px 8px' } }, error) : null,
          h('button', { type: 'button', className: 'dsm-plan-link', onClick: onOpen }, '查看大纲')))
    }

    function Workbench(props) {
      const { inputActions, initialTab, sessionId } = props
      const { state, error } = useWorkbenchState(sessionId)
      const [tab, setTab] = useState(initialTab || 'suggested')
      const [selectedStyle, setSelectedStyle] = useState('')
      const [styleTouched, setStyleTouched] = useState(false)
      const [slides, setSlides] = useState([])
      const [editing, setEditing] = useState(false)
      const [outline, setOutline] = useState('')
      const [feedback, setFeedback] = useState('')
      const [custom, setCustom] = useState({})
      const [activeColor, setActiveColor] = useState('bg')
      const [activeSlot, setActiveSlot] = useState('main')
      const [menu, setMenu] = useState(null)
      const [localError, setLocalError] = useState('')

      const plan = (state && state.plan) || null
      const styles = (state && state.styles) || []
      const planAt = (state && state.planUpdatedAt) || ''
      const style = styles.find(item => item.id === selectedStyle) || styles[0]
      const fallbackColors = { bg: '#F7F6F3', ink: '#121214', accent: '#FF6900' }
      const asColorEntry = (key) => {
        const existing = custom[key]
        const fallback = (style && style.palette && style.palette[key]) || fallbackColors[key]
        if (existing && typeof existing === 'object' && typeof existing.main === 'string') {
          return { main: existing.main, extras: Array.isArray(existing.extras) ? existing.extras.filter(color => typeof color === 'string') : [] }
        }
        return { main: fallback, extras: [] }
      }
      const colorEntries = { bg: asColorEntry('bg'), ink: asColorEntry('ink'), accent: asColorEntry('accent') }
      const activeEntry = colorEntries[activeColor] || colorEntries.bg
      const activeIndex = activeSlot === 'main' ? 0 : Number(activeSlot) + 1
      const activeColorValue = [activeEntry.main, ...activeEntry.extras][activeIndex] || activeEntry.main
      const customBg = colorEntries.bg.main
      const customInk = colorEntries.ink.main
      const customAccent = colorEntries.accent.main
      const build = (state && state.build) || null

      useEffect(() => {
        if (!plan) return
        setSlides(Array.isArray(plan.slides) ? plan.slides : [])
        setOutline(planToText(plan))
      }, [planAt])

      useEffect(() => {
        if (styleTouched) return
        const next = (state && state.selectedStyle) || (plan && plan.recommendedStyle) || (styles[0] && styles[0].id)
        if (next) setSelectedStyle(next)
      }, [state && state.selectedStyle, planAt, styles.length])

      function selectStyle(id) {
        setSelectedStyle(id)
        setStyleTouched(true)
        setCustom({})
        setActiveSlot('main')
      }

      function selectColorCategory(key) {
        setActiveColor(key)
        setActiveSlot('main')
        setMenu(null)
      }

      function updateActiveColor(value) {
        setCustom(current => {
          const fallback = (style && style.palette && style.palette[activeColor]) || fallbackColors[activeColor]
          const existing = current[activeColor]
          const entry = existing && typeof existing === 'object' && typeof existing.main === 'string'
            ? { main: existing.main, extras: Array.isArray(existing.extras) ? [...existing.extras] : [] }
            : { main: fallback, extras: [] }
          if (activeSlot === 'main') entry.main = value
          else {
            const index = Number(activeSlot)
            while (entry.extras.length <= index) entry.extras.push(entry.main)
            entry.extras[index] = value
          }
          return { ...current, [activeColor]: entry }
        })
      }

      function addColor() {
        const entry = colorEntries[activeColor]
        if (entry.extras.length >= 6) return
        const value = activeColorValue
        setCustom(current => {
          const existing = current[activeColor]
          const target = existing && typeof existing === 'object' && typeof existing.main === 'string'
            ? { main: existing.main, extras: Array.isArray(existing.extras) ? [...existing.extras] : [] }
            : { main: entry.main, extras: [] }
          target.extras.push(value)
          return { ...current, [activeColor]: target }
        })
        setActiveSlot(String(entry.extras.length))
      }

      function removeActiveColor() {
        if (activeSlot === 'main') return
        const index = Number(activeSlot)
        setCustom(current => {
          const existing = current[activeColor]
          if (!existing || !Array.isArray(existing.extras)) return current
          const extras = [...existing.extras]
          extras.splice(index, 1)
          return { ...current, [activeColor]: { main: existing.main, extras } }
        })
        setActiveSlot('main')
      }

      function openColorMenu(event, category, slot) {
        event.preventDefault()
        event.stopPropagation()
        setMenu({ category, slot, x: event.clientX, y: event.clientY })
      }

      function deleteMenuColor() {
        if (!menu) return
        const entry = colorEntries[menu.category]
        const next = deleteColorEntry(entry, menu.slot)
        if (!next) { setMenu(null); return }
        setCustom(current => ({ ...current, [menu.category]: next }))
        setActiveColor(menu.category)
        setActiveSlot('main')
        setMenu(null)
      }

      useEffect(() => {
        if (!menu) return undefined
        const close = () => setMenu(null)
        const onKey = (event) => { if (event.key === 'Escape') setMenu(null) }
        window.addEventListener('mousedown', close)
        window.addEventListener('keydown', onKey)
        window.addEventListener('scroll', close, true)
        return () => {
          window.removeEventListener('mousedown', close)
          window.removeEventListener('keydown', onKey)
          window.removeEventListener('scroll', close, true)
        }
      }, [menu])

      function beginEdit() {
        setOutline(planToText({ slides }))
        setEditing(true)
      }

      function finishEdit() {
        const next = textToSlides(outline, plan || { slides })
        setSlides(next)
        setEditing(false)
      }

      function resetPlan() {
        if (!plan) return
        setSlides(Array.isArray(plan.slides) ? plan.slides : [])
        setOutline(planToText(plan))
        setEditing(false)
      }

      function approve() {
        setLocalError('')
        const finalSlides = editing ? textToSlides(outline, plan || { slides }) : slides
        if (!finalSlides.length) {
          setLocalError('大纲为空：请先让模型出大纲，或点“编辑”填写。')
          return
        }
        if (!inputActions || typeof inputActions.setDraft !== 'function' || typeof inputActions.submit !== 'function') {
          setLocalError('当前输入框不可用；请直接在对话里说“批准构建”。')
          return
        }
        // M1: 只要 custom 有改动就携带 styleOverrides，不以当前页签决定
        const hasCustom = ['bg', 'ink', 'accent'].some(key => {
          const entry = custom[key]
          return entry && typeof entry === 'object' && typeof entry.main === 'string'
        })
        const styleOverrides = hasCustom
          ? {
              bg: customBg, ink: customInk, accent: customAccent,
              extras: {
                bg: colorEntries.bg.extras,
                ink: colorEntries.ink.extras,
                accent: colorEntries.accent.extras,
              },
            }
          : undefined
        const payload = {
          plan: {
            title: (plan && plan.title) || '未命名演示',
            audience: (plan && plan.audience) || '',
            slides: finalSlides.map(slide => ({
              title: slide.title,
              bullets: Array.isArray(slide.bullets) ? slide.bullets : [],
              ...(slide.notes ? { notes: slide.notes } : {}),
            })),
          },
          style: selectedStyle || (style && style.id),
          ...(styleOverrides ? { styleOverrides } : {}),
        }
        const message = '【PPT 工作台 批准构建】\n请按下面内容调用 deck_build：deck.style 用 style；deck.styleOverrides 原样传入；plan.slides 映射为 deck.slides，根据每页内容选择合适版式（cover/section/title-body/two-col/image/closing）。\n' +
          JSON.stringify(payload, null, 2) +
          '\n构建完成后调用 present 交付 pptx，让用户在右侧内置窗口预览。'
        inputActions.setDraft(message)
        inputActions.submit()
      }

      function suggest() {
        if (!inputActions || typeof inputActions.setDraft !== 'function' || typeof inputActions.submit !== 'function') {
          setLocalError('当前输入框不可用；请直接在对话里说明修改意见。')
          return
        }
        const message = '【PPT 工作台 建议更改】\n请按下面的意见调整工作台里的大纲/风格：\n' + (feedback.trim() || '请调整提纲与风格后重新给出方案。')
        inputActions.setDraft(message)
        inputActions.submit()
      }

      const styleTabContent = tab === 'custom'
        ? h('div', null,
            h('div', { className: 'dsm-color-slots' },
              [['bg', '背景色'], ['ink', '正文色'], ['accent', '强调色']].map(([key, label]) =>
                h('button', {
                  key, type: 'button',
                  className: 'dsm-color-slot' + (activeColor === key ? ' is-active' : ''),
                  onClick: () => selectColorCategory(key),
                },
                  h('span', {
                    className: 'dsm-color-dot',
                    style: { background: colorEntries[key].main },
                  }), label))),
            h('div', { className: 'dsm-color-sub' },
              h('button', {
                type: 'button',
                className: 'dsm-subtab' + (activeSlot === 'main' ? ' is-active' : ''),
                onClick: () => setActiveSlot('main'),
                onContextMenu: event => openColorMenu(event, activeColor, 'main'),
              },
                h('span', { className: 'dsm-sub-dot', style: { background: activeEntry.main } }), '主色'),
              activeEntry.extras.map((color, index) => h('button', {
                key: 'extra-' + index, type: 'button',
                className: 'dsm-subtab' + (activeSlot === String(index) ? ' is-active' : ''),
                onClick: () => setActiveSlot(String(index)),
                onContextMenu: event => openColorMenu(event, activeColor, String(index)),
              },
                h('span', { className: 'dsm-sub-dot', style: { background: color } }), '附属色 ' + (index + 1))),
              h('button', {
                type: 'button', className: 'dsm-add-color', title: '新增一个颜色',
                disabled: activeEntry.extras.length >= 6,
                onClick: addColor,
              }, '+')),
            h(ColorPicker, { color: activeColorValue, onChange: updateActiveColor }),
            activeSlot !== 'main'
              ? h('button', { type: 'button', className: 'dsm-btn', style: { marginTop: '8px' }, onClick: removeActiveColor }, '删除这个附属色')
              : null,
            h('div', { className: 'dsm-muted', style: { marginTop: '6px' } }, '风格里的背景/正文/强调各是一组颜色；主色进 deck_build；强调附属色轮换到页眉色条，背景附属色用于 section/closing 页背景，正文附属色用于这些页的大标题并自动检查对比度。'))
        : h('div', { className: 'dsm-style-grid' },
            (tab === 'suggested'
              ? [styles.find(item => item.id === ((state && state.selectedStyle) || (plan && plan.recommendedStyle))) || style].filter(Boolean)
              : styles
            ).map(item => h(StyleCard, {
              key: item.id, data: item, selected: item.id === selectedStyle, onSelect: selectStyle,
            })))

      return h('div', { className: 'dsm-root' },
        h('style', null, CSS),
        h('div', { className: 'dsm-head' },
          h('h2', null, 'PPT 工作台'),
          h('p', null, '演示工作台 · 大纲 / 风格 / 批准构建')),
        h('div', { className: 'dsm-scroll' },
          error ? h('div', { className: 'dsm-error' }, '工作台读取失败：' + error) : null,
          h('div', { className: 'dsm-section' },
            h('h3', null, '幻灯片大纲'),
            h('button', { type: 'button', className: 'dsm-btn', onClick: editing ? finishEdit : beginEdit }, editing ? '完成' : '编辑'),
            h('button', { type: 'button', className: 'dsm-btn', onClick: resetPlan, disabled: !plan }, '重置')),
          plan ? h('div', { className: 'dsm-muted', style: { marginBottom: '6px' } },
            plan.title + (plan.audience ? ' · ' + plan.audience : '') + ' · ' + (plan.slides || []).length + ' 页') : null,
          !plan && !editing ? h('div', { className: 'dsm-placeholder' }, '还没有大纲。让模型先出逐页大纲（会调用 deck_plan），或点“编辑”手写。') : null,
          editing ? h('textarea', {
            className: 'dsm-textarea', value: outline, onChange: e => setOutline(e.target.value),
            placeholder: '每行一页：标题 | 要点1；要点2',
          }) : h('div', null,
            slides.map((slide, index) => h('div', { key: slide.id || index, className: 'dsm-card dsm-slide' },
              h('div', { className: 'dsm-slide-index' }, 'Slide ' + (index + 1)),
              h('div', { className: 'dsm-slide-title' }, slide.title),
              Array.isArray(slide.bullets) && slide.bullets.length
                ? h('ul', null, slide.bullets.map((bullet, i) => h('li', { key: i }, bullet)))
                : null,
              slide.notes ? h('div', { className: 'dsm-notes' }, slide.notes) : null))),
          h('div', { className: 'dsm-section' }, h('h3', null, '来源')),
          h('div', { className: 'dsm-placeholder' }, '可选：把参考文件拖进对话，让模型读取后再更新大纲。'),
          h('div', { className: 'dsm-section' }, h('h3', null, '视觉风格')),
          h('div', { className: 'dsm-tabs' },
            [['suggested', '建议'], ['presets', '预设'], ['custom', '自定义']].map(([id, label]) =>
              h('button', {
                key: id, type: 'button', className: 'dsm-tab' + (tab === id ? ' is-active' : ''),
                onClick: () => setTab(id),
              }, label))),
          styleTabContent,
          build ? h('div', { className: 'dsm-build' },
            h('div', null, '已构建 ' + build.slideCount + ' 页 · ' + build.title),
            h('div', { className: 'dsm-path' }, build.pptxPath),
            h('div', { className: 'dsm-muted', style: { marginTop: '4px' } }, '构建完成后调用 present；点击对话里的交付卡即可在右侧内置窗口预览 PPTX。')) : null,
          localError ? h('div', { className: 'dsm-error' }, localError) : null),
        h('div', { className: 'dsm-foot' },
          h('textarea', {
            className: 'dsm-textarea', value: feedback, onChange: e => setFeedback(e.target.value),
            placeholder: '给模型的修改意见（可选）；“建议更改”会把它发出去',
          }),
          h('div', { className: 'dsm-actions' },
            h('button', { type: 'button', className: 'dsm-btn', onClick: suggest }, '建议更改'),
            h('button', { type: 'button', className: 'dsm-btn dsm-btn-primary', onClick: approve }, '批准并构建'))),
        menu ? (() => {
          // M6: fixed 菜单做视口边界 clamp，避免靠右/靠下右键时越界
          const left = Math.max(8, Math.min(menu.x, window.innerWidth - 150))
          const top = Math.max(8, Math.min(menu.y, window.innerHeight - 50))
          return h('div', {
            className: 'dsm-ctx',
            style: { left, top },
            onMouseDown: event => event.stopPropagation(),
          },
            h('button', {
              type: 'button', className: 'dsm-ctx-item',
              disabled: menu.slot === 'main' && colorEntries[menu.category].extras.length === 0,
              onClick: deleteMenuColor,
            }, '删除此颜色'))
        })() : null)
    }

    return {
      inject: ['slots'],
      __test: { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex, cmykOf, cmykToHex, deleteColorEntry, planToText, textToSlides },
      apply(ctx) {
        const read = (name) => (typeof ctx.get === 'function' ? ctx.get(name) : undefined)
        const sidebarRight = read('sidebarRight') || ctx.sidebarRight
        const tabs = read('sidebarRightTabs') || ctx.sidebarRightTabs
        if (!tabs || typeof tabs.register !== 'function') {
          console.warn('[dsh-ppt-production] sidebarRightTabs 不可用，工作台未注册')
          return
        }
        const openWorkbench = () => sidebarRight?.openTab(KIND)
        ctx.effect(() => tabs.register({
          id: 'dsh-ppt-production',
          kind: KIND,
          title: () => 'PPT 工作台',
          keepMounted: true,
        }), 'dsh-ppt-production: workbench tab type')

        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: 'dsh-ppt-production',
        }, Workbench))

        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview',
          key: 'deck_plan',
        }, (props) => h(PlanCard, { ...props, onOpen: openWorkbench })))

        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'dsh-ppt-production.auto',
          order: 20,
        }, (props) => h(WorkbenchAutoOpen, { ...props, onOpen: openWorkbench })))
      },
    }
  },
})

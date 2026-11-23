import { markOpened, snapshot } from './workbench-state.mjs'

// H2: 从请求 URL 中取 session 参数
function sessionOf(url) {
  try {
    const value = new URL(url, 'http://localhost').searchParams.get('session')
    return value && value.length <= 200 ? value : 'default'
  } catch { return 'default' }
}

// L10: 统一鉴权——principal.kind 必须为 owner（或缺省视为本地开发放行）
function authorize(peer) {
  if (peer?.principal?.kind && peer.principal.kind !== 'owner') return false
  return true
}

export function registerDeckWorkbench(ctx) {
  if (!ctx?.webServer?.register) return undefined
  return ctx.effect(() => {
    const stateRoute = ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-ppt-production/state',
      resource: async (request, peer) => {
        if (!authorize(peer)) {
          return new Response('forbidden', { status: 403 })
        }
        const session = sessionOf(request?.url)
        return new Response(JSON.stringify(snapshot(session)), {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          },
        })
      },
    })
    const openedRoute = ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-ppt-production/opened',
      handler: (request, response) => {
        const remote = String(request.socket?.remoteAddress || '')
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)) {
          response.statusCode = 403
          response.end('forbidden')
          return
        }
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('allow', 'POST')
          response.end()
          return
        }
        const session = sessionOf(request?.url)
        markOpened(session)
        response.statusCode = 204
        response.end()
      },
    })
    return () => { stateRoute(); openedRoute() }
  }, 'dsh-ppt-production: workbench routes')
}

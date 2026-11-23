import { markOpened, snapshot } from './workbench-state.mjs'

export function registerDeckWorkbench(ctx) {
  if (!ctx?.webServer?.register) return undefined
  return ctx.effect(() => {
    const stateRoute = ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-ppt-production/state',
      resource: async (_request, peer) => {
        if (peer?.principal?.kind && peer.principal.kind !== 'owner') {
          return new Response('forbidden', { status: 403 })
        }
        return new Response(JSON.stringify(snapshot()), {
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
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('allow', 'POST')
          response.end()
          return
        }
        markOpened()
        response.statusCode = 204
        response.end()
      },
    })
    return () => { stateRoute(); openedRoute() }
  }, 'dsh-ppt-production: workbench routes')
}

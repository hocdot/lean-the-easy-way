// The local backend: runs Lean for the site, and serves the built site itself (make start).
//
//   GET  /api/health   → { lean: boolean, mathlib: boolean }
//   POST /api/run      { code, audit? } → RunResult (see lean.ts)
//
// It listens on 127.0.0.1 only: Lean code can run programs (#eval), so it must not be
// reachable from other machines.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { leanReady, mathlibReady, runLean } from './lean.ts'

const PORT = Number(process.env.PORT ?? 8787)
const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../frontend/dist')

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readBody(req: IncomingMessage): Promise<string> {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 200_000) throw new Error('Request too large.')
  }
  return body
}

function serveStatic(req: IncomingMessage, res: ServerResponse) {
  const path = normalize(decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname))
  let file = join(DIST, path)
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('The site is not built yet. Run `make start`, or `make dev` while editing.')
    return
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
}

const server = createServer(async (req, res) => {
  try {
    if (req.url === '/api/health') return send(res, 200, { lean: leanReady(), mathlib: mathlibReady() })
    if (req.url === '/api/run' && req.method === 'POST') {
      if (!leanReady()) return send(res, 503, { error: 'Lean is not set up yet. Run `make setup` in the project folder.' })
      const { code, audit } = JSON.parse(await readBody(req)) as { code?: unknown; audit?: unknown }
      if (typeof code !== 'string') return send(res, 400, { error: 'Expected { code: string }.' })
      return send(res, 200, await runLean(code, audit === true))
    }
    if (req.url?.startsWith('/api/')) return send(res, 404, { error: 'Unknown endpoint.' })
    serveStatic(req, res)
  } catch (e) {
    send(res, 500, { error: e instanceof Error ? e.message : String(e) })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Lean backend on http://localhost:${PORT}${leanReady() ? '' : '  (Lean not built: run make setup)'}`)
})

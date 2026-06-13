const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeGamertag } = require('./lib/analyze');

const port = Number(process.env.PORT || 3000);
const clientBrowserDir = path.resolve(__dirname, '..', 'client', 'dist', 'client', 'browser');

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => {
      chunks.push(chunk);
    });

    request.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  response.end(body);
}

function getContentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

function serveStaticFile(response, filePath) {
  try {
    const content = fs.readFileSync(filePath);

    response.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Content-Length': content.length,
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

function resolveClientAsset(requestPath) {
  if (!fs.existsSync(clientBrowserDir)) {
    return undefined;
  }

  const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
  const resolvedPath = path.resolve(clientBrowserDir, relativePath);

  if (!resolvedPath.startsWith(`${clientBrowserDir}${path.sep}`) && resolvedPath !== path.join(clientBrowserDir, 'index.html')) {
    return undefined;
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    return resolvedPath;
  }

  return path.join(clientBrowserDir, 'index.html');
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      service: 'gamertag-insights',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/analyze') {
    try {
      const rawBody = await readRequestBody(request);
      const parsedBody = rawBody ? JSON.parse(rawBody) : {};
      const gamertag = String(parsedBody.gamertag || '').trim();

      if (gamertag.length < 3) {
        sendJson(response, 400, {
          error: 'Enter a gamertag with at least 3 characters.',
        });
        return;
      }

      const result = await analyzeGamertag(gamertag);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 500, {
        error: 'Analysis failed.',
        message: error instanceof Error ? error.message : String(error),
      });
    }

    return;
  }

  const assetPath = resolveClientAsset(requestUrl.pathname);

  if (assetPath) {
    serveStaticFile(response, assetPath);
    return;
  }

  response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Angular build output not found. Run `npm --prefix client run build` first.');
});

server.listen(port, () => {
  console.log(`Gamertag insights app listening on http://localhost:${port}`);
});
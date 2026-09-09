// Minimal static server for local preview. Resolves directory URLs to
// index.html the way GitHub Pages does, so local and live URLs match.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const T = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json',
           '.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  let f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403).end('403'); return; }

  // a directory (with or without a trailing slash) serves its index.html
  try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {}

  fs.readFile(f, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/plain'})
         .end('404 — no file at ' + p + '\n(looked for ' + path.relative(ROOT, f) + ')');
      return;
    }
    res.writeHead(200, {'Content-Type': T[path.extname(f)] || 'application/octet-stream',
                        'Cache-Control': 'no-store'}).end(data);
  });
}).listen(8119, () => console.log('serving ' + ROOT + ' on http://localhost:8119'));

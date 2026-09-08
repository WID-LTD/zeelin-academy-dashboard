const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8091;
const MIME = {
  '.html':'text/html',
  '.css':'text/css',
  '.js':'application/javascript',
  '.json':'application/json',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.svg':'image/svg+xml',
  '.ico':'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if(err){
      res.writeHead(404, {'Content-Type':'text/plain'});
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {'Content-Type':mime});
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`In-House Project Portal running at http://localhost:${PORT}`);
});

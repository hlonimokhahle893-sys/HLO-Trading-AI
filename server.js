const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }

  if (req.method === 'POST' && req.url === '/api/analyse') {
    try {
      let raw = '';

      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 12 * 1024 * 1024) {
          res.writeHead(413);
          return res.end(JSON.stringify({ error: 'Image too large.' }));
        }
      }

      const body = JSON.parse(raw);

      if (typeof body.image !== 'string' ||
          !body.image.startsWith('data:image/')) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Please upload a chart image.' }));
      }

      return res.end(JSON.stringify({
        analysis: `HLO EDUCATIONAL DEMO

Your chart screenshot was received successfully.

Market: ${body.symbol || 'Not specified'}
Timeframe: ${body.timeframe || 'Not specified'}

Status: Screenshot received.

This demo does not yet analyse the actual chart.
No live market data or trading signals are provided.

For educational analysis, review the chart's trend, candles,
visible indicators and uncertainty before drawing conclusions.`
      }));

    } catch (error) {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'Unable to process screenshot.' }));
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('HLO demo server running on port ' + PORT);
});

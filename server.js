// HLO PRO backend. Keep OPENAI_API_KEY on the server; never put it in index.html.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-6.2-astra';
const ROOT = __dirname;

const server = http.createServer(async (req, res) => {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store'
  };
  const send = (status, body, type='application/json; charset=utf-8') => {
    res.writeHead(status, {...headers, 'Content-Type': type});
    res.end(body);
  };

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    return send(200, fs.readFileSync(path.join(ROOT, 'index.html')), 'text/html; charset=utf-8');
  }
  if (req.method !== 'POST' || req.url !== '/api/analyse') {
    return send(404, JSON.stringify({error:'Not found'}));
  }
  if (!API_KEY) return send(503, JSON.stringify({error:'Server is missing OPENAI_API_KEY. Configure it as a private server environment variable.'}));

  try {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 12 * 1024 * 1024) return send(413, JSON.stringify({error:'Request too large. Use an image under 8 MB.'}));
    }
    const body = JSON.parse(raw);
    if (typeof body.image !== 'string' || !/^data:image\/(png|jpeg|webp);base64,/.test(body.image)) {
      return send(400, JSON.stringify({error:'Please upload a PNG, JPG or WEBP screenshot.'}));
    }
    const prompt = `You are HLO PRO, an educational visual chart explainer. Inspect only what is actually visible in this MT5 screenshot.
User-selected market: ${String(body.symbol || 'not specified').slice(0,40)}.
User-selected timeframe: ${String(body.timeframe || 'not specified').slice(0,40)}.

Return a concise, structured report with these headings:
1) What is visible (symbol/timeframe/price only if legible)
2) Broad chart structure (uptrend/downtrend/range/unclear, and why)
3) Recent candles (momentum, pullback, rebound, indecision; do not claim exact candle pattern unless clear)
4) Visible indicators (read only if actually present and legible; otherwise say not visible)
5) Important uncertainty / what the screenshot cannot establish
6) Educational summary: bullish bias, bearish bias, or wait/unclear, with evidence and what evidence would change that assessment.

Do NOT tell the user to place a trade, buy, sell, enter, or risk money. Do not give entry prices, stop-loss/take-profit levels, position sizing, leverage, or personalized trading instructions. Do not invent RSI/MACD/MA readings or prices. Be explicit that a static screenshot is not live data and that vision can misread chart graphics. If the chart is too unclear, say so.`;
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${API_KEY}`, 'Content-Type':'application/json'},
      body: JSON.stringify({
        model: MODEL,
        input: [{
          role: 'user',
          content: [
            {type:'input_text', text:prompt},
            {type:'input_image', image_url:body.image, detail:'high'}
          ]
        }]
      })
    });
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      const message = data?.error?.message || `AI service error (${apiResponse.status})`;
      return send(502, JSON.stringify({error:message}));
    }
    const text = data.output_text || (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === 'output_text')
      .map(item => item.text).join('\n');
    return send(200, JSON.stringify({analysis:text || 'The AI returned no readable text.'}));
  } catch (error) {
    return send(400, JSON.stringify({error:'Could not process request: '+error.message}));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HLO PRO server listening on port ${PORT}`);
});

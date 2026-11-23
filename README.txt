# HLO PRO — MT5 Screenshot Analyst

This starter project adds real AI vision analysis to the HLO screenshot workflow.

## What it does
- Accepts a PNG/JPG/WEBP screenshot in the browser.
- Sends it to a small Node.js backend.
- The backend calls the OpenAI Responses API with the image.
- Returns a structured explanation of visible chart structure and uncertainty.
- Does not connect to MT5/Exness, read live prices, or place orders.

## Important
This is an educational chart explainer, not a trading signal service. It deliberately does not tell users to enter trades or provide entry/exit levels. A screenshot is static and can be incomplete or misleading.

## Requirements
- A server or hosting environment that can run Node.js 18+.
- An OpenAI API key configured privately as an environment variable.
- Internet access from the server.

API usage may have a cost. Ask a parent/guardian to help review hosting, API access, and any billing before enabling it.

## Run on a computer/server
1. Install Node.js 18 or newer.
2. Put `index.html` and `server.js` in the same folder.
3. Set `OPENAI_API_KEY` as a private environment variable on the server. Never put it in `index.html`, a public repository, or send it in chat.
4. Optional: set `OPENAI_MODEL` if your API account uses a different vision-capable model. Default: `gpt-6.2-astra`.
5. Run `node server.js`.
6. Open `http://localhost:3000`.

## Android-only note
The HTML file by itself cannot securely call the AI API. The backend must run somewhere online. Opening `index.html` directly from Downloads will show the page but AI analysis will not work until the backend is hosted and configured.

## Privacy
Uploaded screenshots are sent to the configured AI service for analysis. Crop out account identifiers, balances, names, or other private details before uploading.

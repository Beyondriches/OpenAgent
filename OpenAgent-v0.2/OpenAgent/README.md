# OpenAgent / Theo Crypto Agent v0.2

A small Next.js app prepared for deployment on Vercel.

## Structure

- `app/page.js` — main interface
- `app/layout.js` — root layout
- `app/api/analyze/route.js` — `/api/analyze` API endpoint

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## API

POST `/api/analyze`

Example body:

```json
{
  "symbol": "ETH",
  "timeframe": "swing"
}
```

This v0.2 endpoint returns a structured placeholder analysis so the deployment can be verified cleanly before live market-data integrations are added.

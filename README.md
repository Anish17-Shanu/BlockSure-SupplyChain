# BlockSure Supply Chain

## Creator

This project was created, written, and maintained by **ANISH KUMAR**.
All primary documentation in this README is presented as the work of **ANISH KUMAR**.

BlockSure Supply Chain is a blockchain-oriented provenance project for high-value goods. It combines a Solidity contract design, a local ledger simulation script, a local HTTP API, and an operations dashboard so you can demonstrate end-to-end thinking without depending on a live chain on day one.

## Run locally

Generate or refresh sample chain data:

```bash
cd "d:\Project\BlockSure-SupplyChain"
node scripts/simulate-ledger.js
```

Start the product server:

```bash
node server.js
```

Then open `http://127.0.0.1:8082/dashboard/`.

## API routes

- `GET /api/health`
- `GET /api/state`
- `POST /api/assets/register`
- `POST /api/assets/transfer`
- `POST /api/assets/compliance`

## Testing

```bash
npm test
```

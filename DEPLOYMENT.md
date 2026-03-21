# Deployment

## Local

```bash
npm install
npm run simulate
npm run serve
```

Dashboard:

```text
http://127.0.0.1:8082/dashboard/
```

## Docker

```bash
docker build -t blocksure-supply-chain .
docker run -p 8082:8082 blocksure-supply-chain
```

## GitHub Actions

The CI workflow:

- installs dependencies
- regenerates the sample chain state
- runs the smoke tests

## Production notes

- replace the local JSON ledger with a database or chain indexer
- add authentication for asset operators
- connect the Solidity contract to a real EVM testnet deployment flow

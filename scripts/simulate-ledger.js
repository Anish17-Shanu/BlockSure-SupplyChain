const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const assetId = crypto.createHash("sha256").update("sku-pharma-001-batch-77").digest("hex");

const events = [
  { block: 101, type: "AssetRegistered", actor: "MediCore Labs", location: "28.6139,77.2090", note: "Registered cold-chain insulin batch", timestamp: "2026-03-21T09:00:00Z" },
  { block: 118, type: "CustodyTransferred", actor: "TransGlobe Cold Logistics", location: "25.5941,85.1376", note: "Custody moved to certified cold logistics partner", timestamp: "2026-03-21T14:15:00Z" },
  { block: 132, type: "ComplianceUpdated", actor: "IoT Compliance Gateway", location: "23.3441,85.3096", note: "Temperature remained within approved range", temperatureC: 4.1, recalled: false, timestamp: "2026-03-21T18:45:00Z" },
  { block: 149, type: "CustodyTransferred", actor: "Ranchi Care Distribution", location: "23.3441,85.3096", note: "Delivered to regional distribution point", timestamp: "2026-03-22T07:30:00Z" }
];

const state = {
  network: "local-simnet",
  contract: "ProvenanceRegistry",
  generatedAt: new Date().toISOString(),
  asset: {
    id: assetId,
    sku: "PHARMA-001",
    batchId: "BATCH-77",
    currentCustodian: "Ranchi Care Distribution",
    complianceStatus: "Healthy",
    temperatureC: 4.1,
    recalled: false
  },
  metrics: {
    totalEvents: events.length,
    compliancePassRate: "100%",
    custodyTransfers: events.filter((item) => item.type === "CustodyTransferred").length
  },
  events
};

const outPath = path.join(__dirname, "..", "data", "chain-state.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(state, null, 2));
console.log(`Generated ${outPath}`);

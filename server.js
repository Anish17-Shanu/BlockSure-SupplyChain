const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const statePath = path.join(root, "data", "chain-state.json");

function readState() {
  return JSON.parse(fs.readFileSync(statePath, "utf8"));
}

function writeState(state) {
  state.generatedAt = new Date().toISOString();
  state.metrics.totalEvents = state.events.length;
  state.metrics.custodyTransfers = state.events.filter((item) => item.type === "CustodyTransferred").length;
  state.metrics.compliancePassRate = state.events.some((item) => item.type === "ComplianceUpdated" && item.recalled)
    ? "degraded"
    : "100%";
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON payload"));
      }
    });
  });
}

function eventBlock(state) {
  const last = state.events[state.events.length - 1];
  return last ? last.block + 13 : 100;
}

function addEvent(state, type, actor, note, location, extra) {
  const event = {
    block: eventBlock(state),
    type,
    actor,
    note,
    location,
    timestamp: new Date().toISOString(),
  };
  Object.assign(event, extra || {});
  state.events.push(event);
}

function serveStatic(req, res) {
  const relative = req.url === "/" ? "/dashboard/index.html" : req.url;
  const filePath = path.join(root, relative);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return true;
  }

  const ext = path.extname(filePath);
  const type = ext === ".html" ? "text/html" : ext === ".css" ? "text/css" : ext === ".js" ? "text/javascript" : "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/api/health") {
      sendJson(res, 200, { service: "BlockSure Supply Chain", status: "ok" });
      return;
    }

    if (req.method === "GET" && req.url === "/api/state") {
      sendJson(res, 200, readState());
      return;
    }

    if (req.method === "POST" && req.url === "/api/assets/register") {
      try {
        const body = await parseBody(req);
        const state = readState();
        const assetId = crypto.createHash("sha256").update(`${body.sku}-${body.batchId}`).digest("hex");
        state.asset = {
          id: assetId,
          sku: body.sku,
          batchId: body.batchId,
          currentCustodian: body.custodian,
          complianceStatus: "Healthy",
          temperatureC: Number(body.temperatureC || 0),
          recalled: false,
        };
        addEvent(state, "AssetRegistered", body.custodian, body.note || "Asset registered", body.location || "unknown", {});
        writeState(state);
        sendJson(res, 201, state);
      } catch (error) {
        sendJson(res, 400, { error: error.message });
      }
      return;
    }

    if (req.method === "POST" && req.url === "/api/assets/transfer") {
      try {
        const body = await parseBody(req);
        const state = readState();
        state.asset.currentCustodian = body.custodian;
        addEvent(state, "CustodyTransferred", body.custodian, body.note || "Custody transferred", body.location || "unknown", {});
        writeState(state);
        sendJson(res, 200, state);
      } catch (error) {
        sendJson(res, 400, { error: error.message });
      }
      return;
    }

    if (req.method === "POST" && req.url === "/api/assets/compliance") {
      try {
        const body = await parseBody(req);
        const state = readState();
        state.asset.temperatureC = Number(body.temperatureC || 0);
        state.asset.recalled = Boolean(body.recalled);
        state.asset.complianceStatus = state.asset.recalled || state.asset.temperatureC > 8 ? "Alert" : "Healthy";
        addEvent(state, "ComplianceUpdated", body.actor || "Compliance Gateway", body.note || "Compliance updated", body.location || "unknown", {
          temperatureC: state.asset.temperatureC,
          recalled: state.asset.recalled,
        });
        writeState(state);
        sendJson(res, 200, state);
      } catch (error) {
        sendJson(res, 400, { error: error.message });
      }
      return;
    }

    serveStatic(req, res);
  });
}

if (require.main === module) {
  createServer().listen(8082, "127.0.0.1", () => {
    console.log("BlockSure Supply Chain listening on http://127.0.0.1:8082");
  });
}

module.exports = {
  createServer,
};

const metrics = document.getElementById("metrics");
const asset = document.getElementById("asset");
const timeline = document.getElementById("timeline");
const statusNode = document.getElementById("status");

async function request(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function render(state) {
  metrics.innerHTML = [
    ["Network", state.network],
    ["Contract", state.contract],
    ["Events", state.metrics.totalEvents],
    ["Custody Transfers", state.metrics.custodyTransfers],
    ["Compliance", state.metrics.compliancePassRate],
  ]
    .map(([label, value]) => `<article><p class="eyebrow">${label}</p><h2>${value}</h2></article>`)
    .join("");

  const complianceClass = state.asset.complianceStatus === "Alert" ? "pill alert" : "pill";
  asset.innerHTML = `
    <p class="eyebrow">Tracked Asset</p>
    <h2>${state.asset.sku} / ${state.asset.batchId}</h2>
    <p class="muted">Current custodian: ${state.asset.currentCustodian}</p>
    <p><span class="${complianceClass}">${state.asset.complianceStatus}</span></p>
    <p class="muted">Temperature: ${state.asset.temperatureC} C</p>
    <p class="muted">Asset ID: ${state.asset.id}</p>
  `;

  timeline.innerHTML = [...state.events]
    .reverse()
    .map((event) => `<article><p class="eyebrow">Block ${event.block} / ${event.type}</p><h3>${event.actor}</h3><p>${event.note}</p><p class="muted">${event.location} | ${event.timestamp}</p></article>`)
    .join("");
}

async function refresh() {
  render(await request("/api/state"));
}

function bindForms() {
  document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await request("/api/assets/register", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    statusNode.textContent = "Asset registered.";
    event.currentTarget.reset();
    await refresh();
  });

  document.getElementById("transfer-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await request("/api/assets/transfer", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    statusNode.textContent = "Custody transferred.";
    event.currentTarget.reset();
    await refresh();
  });

  document.getElementById("compliance-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.recalled = form.get("recalled") === "on";
    await request("/api/assets/compliance", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    statusNode.textContent = "Compliance updated.";
    event.currentTarget.reset();
    await refresh();
  });
}

refresh().then(bindForms).catch((error) => {
  document.body.innerHTML = `<main class="shell"><section class="hero"><h1>Unable to load chain state</h1><p class="lede">${error.message}</p></section></main>`;
});

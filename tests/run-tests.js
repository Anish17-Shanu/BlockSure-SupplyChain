const assert = require("node:assert/strict");
const { createServer } = require("../server");

async function run() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    console.log("BlockSure tests passed");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

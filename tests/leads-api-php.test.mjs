import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const secret = "alcyanne-qa-only-secret-not-production-123456789";
const waitPort = async () => {
  const server = createNetServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  server.close();
  await once(server, "close");
  return port;
};
let mode = { code: 201, body: { ok: true } };
let forwardedCount = 0;
const upstream = createHttpServer(async (req, res) => {
  assert.equal(req.headers["x-lead-secret"], secret);
  let bytes = "";
  for await (const chunk of req) bytes += chunk;
  assert.ok(JSON.parse(bytes).lead_id);
  forwardedCount++;
  res.writeHead(mode.code, { "Content-Type": "application/json" });
  res.end(typeof mode.body === "string" ? mode.body : JSON.stringify(mode.body));
});
const upstreamPort = await waitPort();
upstream.listen(upstreamPort, "127.0.0.1");
await once(upstream, "listening");

const phpPort = await waitPort();
const origin = `http://127.0.0.1:${phpPort}`;
// The production PHP validates the page origin as scheme + host (without port).
// Separate the browser's local test URL from the synthetic allowed origin.
const allowedOrigin = "http://127.0.0.1";
const php = spawn("php", ["-S", `127.0.0.1:${phpPort}`, "-t", root], {
  cwd: root,
  env: {
    ...process.env,
    ALCYANNE_ALLOWED_ORIGIN: allowedOrigin,
    ALCYANNE_LEADS_WEBHOOK_URL: `http://127.0.0.1:${upstreamPort}/`,
    ALCYANNE_LEADS_WEBHOOK_SECRET: secret,
  },
  stdio: "ignore",
});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (php.exitCode !== null) throw new Error(`PHP server exited (${php.exitCode})`);
    try {
      const res = await fetch(origin + "/api/leads.php?status=1");
      if (res.ok && res.headers.get("x-s4x-lead-contract") === "20261111-429-v1" && (await res.json()).configured === true) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("PHP server did not start");
} catch (error) {
  php.kill();
  upstream.close();
  throw error;
}
test.after(async () => {
  php.kill();
  if (php.exitCode === null) await Promise.race([once(php, "exit"), new Promise(resolve => setTimeout(resolve, 2000))]);
  upstream.close();
  await once(upstream, "close");
});

let serial = 1;
async function submit(cta = "hero") {
  const current = serial++;
  const res = await fetch(origin + "/api/leads.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Origin": allowedOrigin,
      "CF-Connecting-IP": `198.51.100.${current}`,
    },
    body: JSON.stringify({
      lead_id: randomUUID(),
      nome: "Ana Teste",
      whatsapp: "11987654321",
      consentimento: true,
      cta_location: cta,
      page_url: origin + "/",
      website: "",
    }),
  });
  return { status: res.status, body: await res.json() };
}

test("valid lead receives 201 only after upstream ok:true", async () => {
  mode = { code: 201, body: { ok: true } };
  const r = await submit();
  assert.equal(r.status, 201);
  assert.equal(r.body.ok, true);
  assert.match(r.body.lead_id, /^[0-9a-f-]{36}$/);
});

test("verified upstream 429 rate_limited remains HTTP 429, never masquerades as 503", async () => {
  mode = { code: 429, body: { ok: false, code: "rate_limited", message: "internal detail" } };
  const r = await submit();
  assert.equal(r.status, 429);
  assert.deepEqual(r.body, {
    ok: false, code: "rate_limited",
    message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  });
});

test("upstream 429 with untrusted or missing classification fails closed as 503", async () => {
  for (const body of [{ ok: true }, { ok: false, code: "different" }, "{invalid-json"]) {
    mode = { code: 429, body };
    const r = await submit();
    assert.equal(r.status, 503);
    assert.equal(r.body.ok, false);
    assert.equal(r.body.code, undefined);
  }
});

test("upstream storage failure and non-success JSON stay 503", async () => {
  for (const condition of [
    { code: 503, body: { ok: false, code: "storage_unavailable" } },
    { code: 201, body: { ok: false } },
    { code: 201, body: "{broken" },
  ]) {
    mode = condition;
    const r = await submit();
    assert.equal(r.status, 503);
    assert.equal(r.body.ok, false);
  }
});

test("PHP accepts all six CTA locations, preserving original attribution", async () => {
  mode = { code: 201, body: { ok: true } };
  for (const cta of ["header", "hero", "como-funciona", "psicologa-fortaleza", "cta-final", "flutuante"]) {
    const r = await submit(cta);
    assert.equal(r.status, 201, cta);
  }
});

test("unknown CTA is rejected locally before reaching the webhook", async () => {
  const oldCount = forwardedCount;
  mode = { code: 201, body: { ok: true } };
  const r = await submit("not-a-real-cta");
  assert.equal(r.status, 422);
  assert.equal(forwardedCount, oldCount);
});

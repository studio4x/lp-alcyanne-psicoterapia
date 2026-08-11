import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

test("an immediate CTA click opens the form while integration status is checking", async () => {
  const source = await readFile(new URL("hostinger.js", root), "utf8");
  let clickHandler;
  const cta = {
    dataset: { ctaLocation: "hero" },
    addEventListener(type, handler) { if (type === "click") clickHandler = handler; },
  };
  const input = { value: "", checked: false, focus() {}, removeAttribute() {}, setAttribute() {}, addEventListener() {} };
  const button = { hidden: true, disabled: false, textContent: "", addEventListener() {}, click() {} };
  const panel = { querySelectorAll() { return []; } };
  const modal = {
    hidden: true,
    querySelector(selector) { return selector === ".leadModalPanel" ? panel : null; },
    querySelectorAll() { return []; },
  };
  const form = {
    elements: { website: { value: "" } },
    querySelector(selector) {
      if (selector === ".leadSubmit" || selector === ".leadRetry" || selector === ".leadFallback") return button;
      return null;
    },
    addEventListener() {},
  };
  const status = { textContent: "" };
  const byId = {
    "lead-modal": modal,
    "lead-form": form,
    "lead-name": input,
    "lead-phone": input,
    "lead-consent": input,
    "lead-form-status": status,
    "lead-name-error": status,
    "lead-phone-error": status,
    "lead-consent-error": status,
  };
  const document = {
    body: { classList: { add() {}, remove() {} } },
    activeElement: null,
    referrer: "",
    getElementById(id) { return byId[id] ?? status; },
    querySelectorAll(selector) { return selector === "[data-whatsapp-cta]" ? [cta] : []; },
    addEventListener() {},
  };
  const window = {
    dataLayer: [],
    location: { search: "", href: "https://example.test/" },
    setTimeout(callback) { callback(); },
  };
  const context = {
    window,
    document,
    fetch: () => new Promise(() => {}),
    sessionStorage: { getItem() { return null; }, setItem() {} },
    URLSearchParams,
    crypto: { randomUUID() { return "test"; } },
    console,
  };
  vm.runInNewContext(source, context);
  assert.equal(typeof clickHandler, "function");
  clickHandler({ preventDefault() {} });
  assert.equal(modal.hidden, false);
  assert.equal(window.dataLayer.at(-1).event, "lead_form_open");
});

test("static pages contain one GTM, consent before GTM, metadata and unique section IDs", async () => {
  const home = await readFile(new URL("index.html", root), "utf8");
  const privacy = await readFile(new URL("politica-de-privacidade/index.html", root), "utf8");
  for (const html of [home, privacy]) {
    assert.equal((html.match(/googletagmanager\.com\/gtm\.js/g) || []).length, 1);
    assert.ok(html.indexOf("consent', 'default'") < html.indexOf("googletagmanager.com/gtm.js"));
  }
  const ids = [...home.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["inicio", "psicoterapia", "como-funciona", "sobre", "modalidades", "duvidas", "contato"]) assert.ok(ids.includes(id));
  assert.equal((home.match(/data-whatsapp-cta/g) || []).length, 5);
  assert.match(home, /rel="canonical" href="https:\/\/psicoterapia\.alcyannegouveiapsi\.com\.br\/"/);
  assert.match(home, /property="og:type" content="website"/);
  assert.match(home, /name="twitter:card" content="summary_large_image"/);
  assert.match(privacy, /rel="canonical" href="https:\/\/psicoterapia\.alcyannegouveiapsi\.com\.br\/politica-de-privacidade\/"/);
});

test("conversion dataLayer events remain free of lead name and phone", async () => {
  const source = await readFile(new URL("hostinger.js", root), "utf8");
  const pushEventBody = source.match(/function pushEvent[\s\S]*?\n  }/)?.[0] ?? "";
  assert.match(pushEventBody, /event, cta_location: location, service: "psicoterapia"/);
  assert.doesNotMatch(pushEventBody, /nome|whatsapp:|telefone/);
  assert.ok(source.indexOf('pushEvent("lead_form_submit"') > source.indexOf("result.ok !== true"));
});

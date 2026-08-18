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
    assert.match(html, /class="privacyFloating"[^>]*data-cookie-floating[^>]*data-manage-cookies/);
    assert.match(html, /cookie-consent\.js\?v=20260818-floating-privacy-1/);
  }
  const ids = [...home.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["inicio", "psicoterapia", "como-funciona", "sobre", "modalidades", "duvidas", "contato"]) assert.ok(ids.includes(id));
  assert.equal((home.match(/data-whatsapp-cta/g) || []).length, 5);
  assert.match(home, /<script src="\/hostinger\.js\?v=20260818-conversion-reliability-1" defer><\/script>/);
  assert.match(home, /rel="canonical" href="https:\/\/psicoterapia\.alcyannegouveiapsi\.com\.br\/"/);
  assert.match(home, /property="og:type" content="website"/);
  assert.match(home, /name="twitter:card" content="summary_large_image"/);
  assert.match(privacy, /rel="canonical" href="https:\/\/psicoterapia\.alcyannegouveiapsi\.com\.br\/politica-de-privacidade\/"/);
});

test("conversion dataLayer events remain free of lead name and phone", async () => {
  const source = await readFile(new URL("hostinger.js", root), "utf8");
  const pushEventBody = source.match(/function pushEvent[\s\S]*?\n  }/)?.[0] ?? "";
  assert.match(pushEventBody, /event, cta_location: location, service: "psicoterapia", \.\.\.details/);
  assert.doesNotMatch(pushEventBody, /nome|whatsapp:|telefone/);
  assert.ok(source.indexOf('pushEventAndWait("lead_form_submit"') > source.indexOf("result.ok !== true"));
  assert.match(source, /eventCallback: complete/);
  assert.match(source, /eventTimeout: 1500/);
  assert.match(source, /event_id: leadId/);
  assert.match(source, /transaction_id: leadId/);
});

test("successful lead waits for the GTM event callback before opening WhatsApp", async () => {
  const source = await readFile(new URL("hostinger.js", root), "utf8");
  let submitHandler;
  const events = [];
  const dataLayer = {
    push(item) {
      events.push(item);
      if (item.event === "lead_form_submit") queueMicrotask(item.eventCallback);
      return events.length;
    },
  };
  const cta = { dataset: { ctaLocation: "hero" }, addEventListener() {}, focus() {} };
  const nameInput = { value: "Ana", checked: false, focus() {}, removeAttribute() {}, setAttribute() {}, addEventListener() {} };
  const phoneInput = { value: "(85) 99999-9999", checked: false, focus() {}, removeAttribute() {}, setAttribute() {}, addEventListener() {} };
  const consentInput = { value: "", checked: true, focus() {}, removeAttribute() {}, setAttribute() {}, addEventListener() {} };
  const submitButton = { hidden: false, disabled: false, textContent: "", addEventListener() {}, click() {} };
  const actionButton = { hidden: true, disabled: false, textContent: "", addEventListener() {}, click() {} };
  const status = { textContent: "" };
  const panel = { querySelectorAll() { return []; } };
  const modal = {
    hidden: false,
    querySelector(selector) { return selector === ".leadModalPanel" ? panel : null; },
    querySelectorAll() { return []; },
  };
  const form = {
    elements: { website: { value: "" } },
    querySelector(selector) {
      if (selector === ".leadSubmit") return submitButton;
      if (selector === ".leadRetry" || selector === ".leadFallback") return actionButton;
      return null;
    },
    addEventListener(type, handler) { if (type === "submit") submitHandler = handler; },
    reset() {},
  };
  const byId = {
    "lead-modal": modal,
    "lead-form": form,
    "lead-name": nameInput,
    "lead-phone": phoneInput,
    "lead-consent": consentInput,
    "lead-form-status": status,
    "lead-name-error": status,
    "lead-phone-error": status,
    "lead-consent-error": status,
  };
  const document = {
    body: { classList: { add() {}, remove() {} } },
    activeElement: null,
    referrer: "https://www.google.com/",
    getElementById(id) { return byId[id] ?? status; },
    querySelectorAll(selector) { return selector === "[data-whatsapp-cta]" ? [cta] : []; },
    addEventListener() {},
  };
  const popup = { closed: false, location: { href: "about:blank" }, opener: null };
  const window = {
    dataLayer,
    location: { search: "?utm_source=google&gclid=test-click", href: "https://example.test/" },
    open() { return popup; },
    setTimeout,
    clearTimeout,
  };
  const fetch = (url) => String(url).includes("?status=1")
    ? new Promise(() => {})
    : Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
  const context = {
    window,
    document,
    fetch,
    sessionStorage: {
      value: null,
      getItem() { return this.value; },
      setItem(_key, value) { this.value = value; },
    },
    URLSearchParams,
    crypto: { randomUUID() { return "lead-test-id"; } },
    console,
  };

  vm.runInNewContext(source, context);
  await submitHandler({ preventDefault() {} });

  const leadEvent = events.find((item) => item.event === "lead_form_submit");
  assert.equal(leadEvent.event_id, "lead-test-id");
  assert.equal(leadEvent.transaction_id, "lead-test-id");
  assert.equal(typeof leadEvent.eventCallback, "function");
  assert.equal(events.at(-1).event, "whatsapp_click");
  assert.match(popup.location.href, /phone=5585991525445/);
  assert.equal("nome" in leadEvent, false);
  assert.equal("whatsapp" in leadEvent, false);
});

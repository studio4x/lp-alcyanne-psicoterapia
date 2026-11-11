import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const tpl = await readFile(new URL("../gtm/s4x-consent-update.tpl", import.meta.url), "utf8");
const section = (begin, end) => tpl.split(begin)[1]?.split(end)[0]?.trim();
const info = JSON.parse(section("___INFO___", "___TEMPLATE_PARAMETERS___"));
const params = JSON.parse(section("___TEMPLATE_PARAMETERS___", "___SANDBOXED_JS_FOR_WEB_TEMPLATE___"));
const sandbox = section("___SANDBOXED_JS_FOR_WEB_TEMPLATE___", "___WEB_PERMISSIONS___");
const perms = JSON.parse(tpl.split("___WEB_PERMISSIONS___")[1]?.trim());

test("GTM consent template has a single supported parameter and four write permissions", () => {
  assert.equal(info.type, "TAG");
  assert.equal(info.id, "cvt_105253275_63");
  assert.equal(params.length, 1);
  assert.equal(params[0].name, "consentChoice");
  assert.equal(perms.length, 1);
  assert.equal(perms[0].instance.key.publicId, "access_consent");
  const names = perms[0].instance.param[0].value.listItem.map(item => item.mapValue[0].string).sort();
  assert.deepEqual(names, ["ad_personalization", "ad_storage", "ad_user_data", "analytics_storage"].sort());
  for (const item of perms[0].instance.param[0].value.listItem) {
    assert.equal(item.mapValue[2].boolean, true, "each permission must include write access");
  }
  assert.doesNotMatch(sandbox, /gtag\s*\(|fetch\s*\(|nome|whatsapp/i);
});

test("GTM consent template updates four types only on valid explicit choice", () => {
  for (const choice of ["granted", "denied", "unknown", "", null]) {
    const calls = [];
    let outcome = "";
    vm.runInNewContext(sandbox, {
      data: {
        consentChoice: choice,
        gtmOnSuccess() { outcome = "success"; },
        gtmOnFailure() { outcome = "failure"; },
      },
      require(name) {
        assert.equal(name, "updateConsentState");
        return state => calls.push(JSON.parse(JSON.stringify(state)));
      },
    });
    if (choice === "granted" || choice === "denied") {
      assert.equal(outcome, "success");
      assert.equal(calls.length, 1);
      assert.deepEqual(calls[0], {
        ad_storage: choice, analytics_storage: choice,
        ad_user_data: choice, ad_personalization: choice,
      });
    } else {
      assert.equal(outcome, "failure");
      assert.equal(calls.length, 0);
    }
  }
});

test("landing pages retain the old gtag fallback and queue priority bridge before Meta conversion", async () => {
  const staticJs = await readFile(new URL("../public/cookie-consent.js", import.meta.url), "utf8");
  const reactJs = await readFile(new URL("../app/components/CookieConsent.tsx", import.meta.url), "utf8");
  for (const source of [staticJs, reactJs]) {
    assert.match(source, /gtag\("consent", "update",/);
    const update = source.indexOf('event: "s4x_consent_update"');
    const meta = source.indexOf('event: "marketing_consent_granted"');
    assert.ok(update >= 0 && meta > update);
    assert.match(source, /s4x_consent_choice: choice/);
  }
});

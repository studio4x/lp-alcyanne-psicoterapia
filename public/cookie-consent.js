(() => {
  "use strict";

  const STORAGE_KEY = "alcyanne_cookie_consent_v1";
  const banner = document.getElementById("cookie-consent");
  const acceptButton = banner?.querySelector("[data-cookie-accept]");
  const rejectButton = banner?.querySelector("[data-cookie-reject]");
  const manageButtons = document.querySelectorAll("[data-manage-cookies]");

  function updateConsent(choice) {
    const state = choice === "granted" ? "granted" : "denied";
    window.dataLayer = window.dataLayer || [];
    const gtag = function () { window.dataLayer.push(arguments); };
    gtag("consent", "update", {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state
    });
  }

  function closeBanner() {
    if (banner) banner.hidden = true;
  }

  function openBanner() {
    if (!banner) return;
    banner.hidden = false;
    window.setTimeout(() => acceptButton?.focus(), 0);
  }

  function saveChoice(choice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch {}
    updateConsent(choice);
    closeBanner();
  }

  let savedChoice = null;
  try { savedChoice = window.localStorage.getItem(STORAGE_KEY); } catch {}
  if (savedChoice !== "granted" && savedChoice !== "denied") openBanner();

  acceptButton?.addEventListener("click", () => saveChoice("granted"));
  rejectButton?.addEventListener("click", () => saveChoice("denied"));
  manageButtons.forEach((button) => button.addEventListener("click", openBanner));
})();

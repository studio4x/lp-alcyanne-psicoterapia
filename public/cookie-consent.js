(() => {
  "use strict";

  const STORAGE_KEY = "alcyanne_cookie_consent_v1";
  const banner = document.getElementById("cookie-consent");
  const acceptButton = banner?.querySelector("[data-cookie-accept]");
  const rejectButton = banner?.querySelector("[data-cookie-reject]");
  const floatingButton = document.querySelector("[data-cookie-floating]");
  const manageButtons = document.querySelectorAll("[data-manage-cookies]");
  let returnFocus = null;

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
    if (floatingButton) {
      floatingButton.hidden = false;
      floatingButton.setAttribute("aria-expanded", "false");
    }
  }

  function openBanner() {
    if (!banner) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    banner.hidden = false;
    if (floatingButton) {
      floatingButton.hidden = true;
      floatingButton.setAttribute("aria-expanded", "true");
    }
    window.setTimeout(() => acceptButton?.focus(), 0);
  }

  function saveChoice(choice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch {}
    updateConsent(choice);
    closeBanner();
    window.setTimeout(() => {
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
      else floatingButton?.focus();
    }, 0);
  }

  let savedChoice = null;
  try { savedChoice = window.localStorage.getItem(STORAGE_KEY); } catch {}
  if (savedChoice !== "granted" && savedChoice !== "denied") openBanner();
  else closeBanner();

  acceptButton?.addEventListener("click", () => saveChoice("granted"));
  rejectButton?.addEventListener("click", () => saveChoice("denied"));
  manageButtons.forEach((button) => button.addEventListener("click", openBanner));
})();

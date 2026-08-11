(() => {
  "use strict";

  const API_URL = "/api/leads.php";
  const WHATSAPP_PHONE = "5585991525445";
  const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"];
  const modal = document.getElementById("lead-modal");
  const panel = modal?.querySelector(".leadModalPanel");
  const form = document.getElementById("lead-form");
  const nameInput = document.getElementById("lead-name");
  const phoneInput = document.getElementById("lead-phone");
  const consentInput = document.getElementById("lead-consent");
  const submitButton = form?.querySelector(".leadSubmit");
  const retryButton = form?.querySelector(".leadRetry");
  const fallbackButton = form?.querySelector(".leadFallback");
  const statusBox = document.getElementById("lead-form-status");
  const ctas = [...document.querySelectorAll("[data-whatsapp-cta]")];
  let activeCta = null;
  let ctaLocation = "";
  let integrationReady = false;
  let sending = false;

  window.dataLayer = window.dataLayer || [];

  function pushEvent(event, location) {
    window.dataLayer.push({ event, cta_location: location, service: "psicoterapia" });
  }

  function captureCampaign() {
    const params = new URLSearchParams(window.location.search);
    const stored = {};
    CAMPAIGN_KEYS.forEach((key) => {
      const current = params.get(key);
      if (current) stored[key] = current.slice(0, 300);
    });
    if (Object.keys(stored).length) sessionStorage.setItem("alcyanne_campaign", JSON.stringify(stored));
  }

  function campaignData() {
    try { return JSON.parse(sessionStorage.getItem("alcyanne_campaign") || "{}"); } catch { return {}; }
  }

  function whatsappUrl(name = "") {
    const message = name
      ? `Olá, Alcyanne! Meu nome é ${name}. Gostaria de saber mais sobre a psicoterapia e conhecer os horários disponíveis.`
      : "Olá, Alcyanne! Gostaria de saber mais sobre a psicoterapia e conhecer os horários disponíveis.";
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
  }

  function openWhatsApp(name, popup) {
    pushEvent("whatsapp_click", ctaLocation);
    const url = whatsappUrl(name);
    if (popup && !popup.closed) popup.location.href = url;
    else window.location.href = url;
  }

  function openModal(trigger) {
    activeCta = trigger;
    ctaLocation = trigger.dataset.ctaLocation || "";
    modal.hidden = false;
    document.body.classList.add("modalOpen");
    clearErrors();
    pushEvent("lead_form_open", ctaLocation);
    window.setTimeout(() => nameInput.focus(), 20);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modalOpen");
    if (activeCta) activeCta.focus();
  }

  function clearErrors() {
    ["lead-name-error", "lead-phone-error", "lead-consent-error"].forEach((id) => { document.getElementById(id).textContent = ""; });
    [nameInput, phoneInput, consentInput].forEach((el) => el?.removeAttribute("aria-invalid"));
    statusBox.textContent = "";
    retryButton.hidden = true;
    fallbackButton.hidden = true;
  }

  function maskPhone(value) {
    let digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function validate() {
    clearErrors();
    const name = nameInput.value.normalize("NFC").trim().replace(/\s+/g, " ");
    const digits = phoneInput.value.replace(/\D/g, "");
    let valid = true;
    if (name.length < 2 || name.length > 60 || !/^[\p{L}][\p{L}\s'’\-]{1,59}$/u.test(name)) {
      document.getElementById("lead-name-error").textContent = "Informe um primeiro nome válido.";
      nameInput.setAttribute("aria-invalid", "true"); valid = false;
    }
    if (![10, 11].includes(digits.length) || /^(\d)\1+$/.test(digits)) {
      document.getElementById("lead-phone-error").textContent = "Informe um WhatsApp com DDD.";
      phoneInput.setAttribute("aria-invalid", "true"); valid = false;
    }
    if (!consentInput.checked) {
      document.getElementById("lead-consent-error").textContent = "É necessário aceitar a Política de Privacidade.";
      consentInput.setAttribute("aria-invalid", "true"); valid = false;
    }
    if (!valid) form.querySelector("[aria-invalid=true]")?.focus();
    return valid ? { name, digits } : null;
  }

  async function submitLead(event) {
    event.preventDefault();
    if (sending) return;
    const valid = validate();
    if (!valid) return;
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    sending = true;
    submitButton.disabled = true;
    submitButton.textContent = "Salvando...";
    const leadId = crypto.randomUUID();
    const payload = {
      lead_id: leadId,
      nome: valid.name,
      whatsapp: valid.digits,
      consentimento: true,
      website: form.elements.website.value,
      cta_location: ctaLocation,
      service: "psicoterapia",
      page_url: window.location.href,
      referrer: document.referrer,
      ...campaignData()
    };
    try {
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" }, body: JSON.stringify(payload), credentials: "same-origin" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.message || "Falha ao salvar");
      pushEvent("lead_form_submit", ctaLocation);
      openWhatsApp(valid.name, popup);
      closeModal();
      form.reset();
    } catch {
      if (popup && !popup.closed) popup.close();
      statusBox.textContent = "Não foi possível registrar seus dados neste momento. Tente novamente.";
      retryButton.hidden = false;
      fallbackButton.hidden = false;
    } finally {
      sending = false;
      submitButton.disabled = false;
      submitButton.textContent = "Continuar para o WhatsApp";
    }
  }

  function trapFocus(event) {
    if (modal.hidden || event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll("button:not([hidden]):not([disabled]),a[href],input:not([tabindex='-1']):not([disabled])")];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  captureCampaign();
  fetch(`${API_URL}?status=1`, { headers: { "X-Requested-With": "XMLHttpRequest" }, credentials: "same-origin" })
    .then((response) => response.json()).then((data) => { integrationReady = data.configured === true; }).catch(() => { integrationReady = false; });

  ctas.forEach((cta) => cta.addEventListener("click", (event) => {
    event.preventDefault();
    ctaLocation = cta.dataset.ctaLocation || "";
    if (integrationReady) openModal(cta); else openWhatsApp("", null);
  }));
  modal?.querySelectorAll("[data-modal-close]").forEach((button) => button.addEventListener("click", closeModal));
  phoneInput?.addEventListener("input", () => { phoneInput.value = maskPhone(phoneInput.value); });
  form?.addEventListener("submit", submitLead);
  retryButton?.addEventListener("click", () => submitButton.click());
  fallbackButton?.addEventListener("click", () => { const name = nameInput.value.trim().replace(/\s+/g, " "); openWhatsApp(name, null); closeModal(); });
  document.addEventListener("keydown", (event) => { if (!modal.hidden && event.key === "Escape") closeModal(); trapFocus(event); });
})();


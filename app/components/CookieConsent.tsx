"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "alcyanne_cookie_consent_v1";

type ConsentChoice = "granted" | "denied";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch {}
    if (saved !== "granted" && saved !== "denied") window.setTimeout(() => setOpen(true), 0);

    const reopen = () => setOpen(true);
    document.querySelectorAll<HTMLElement>("[data-manage-cookies]").forEach((button) => {
      button.addEventListener("click", reopen);
    });
    return () => document.querySelectorAll<HTMLElement>("[data-manage-cookies]").forEach((button) => {
      button.removeEventListener("click", reopen);
    });
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => acceptRef.current?.focus(), 0);
  }, [open]);

  function save(choice: ConsentChoice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch {}
    const state = choice === "granted" ? "granted" : "denied";
    window.dataLayer = window.dataLayer || [];
    const gtag = function (...args: unknown[]) { window.dataLayer.push(args); };
    gtag("consent", "update", {
      ad_storage: state,
      analytics_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
    setOpen(false);
    window.setTimeout(() => floatingRef.current?.focus(), 0);
  }

  return (
    <>
      {open && (
        <aside className="cookieConsent" id="cookie-consent" role="region" aria-labelledby="cookie-consent-title">
          <div className="cookieConsentCopy">
            <h2 id="cookie-consent-title">Preferências de cookies</h2>
            <p>Utilizamos cookies e tecnologias semelhantes para medir o desempenho da página e das campanhas. Você pode aceitar ou recusar os cookies não essenciais.</p>
            <Link href="/politica-de-privacidade/">Política de Privacidade</Link>
          </div>
          <div className="cookieConsentActions">
            <button ref={acceptRef} type="button" className="cookieAccept" onClick={() => save("granted")}>Aceitar</button>
            <button type="button" className="cookieReject" onClick={() => save("denied")}>Recusar não essenciais</button>
          </div>
        </aside>
      )}
      {!open && (
        <button
          ref={floatingRef}
          type="button"
          className="privacyFloating"
          onClick={() => setOpen(true)}
          aria-controls="cookie-consent"
          aria-expanded="false"
          aria-label="Gerenciar cookies e privacidade"
        >
          <span className="privacyFloatingIcon" aria-hidden="true" />
          <span>Cookies e privacidade</span>
        </button>
      )}
    </>
  );
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

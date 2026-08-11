import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieConsent from "./components/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://psicoterapia.alcyannegouveiapsi.com.br"),
  title: "Psicoterapia em Fortaleza | Alcyanne Gouveia",
  description: "Psicoterapia online e presencial em Fortaleza com Alcyanne Gouveia, psicóloga CRP 11/15040. Atendimento acolhedor, ético e sigiloso.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Psicoterapia em Fortaleza | Alcyanne Gouveia",
    description: "Psicoterapia online e presencial em Fortaleza com Alcyanne Gouveia, psicóloga CRP 11/15040. Atendimento acolhedor, ético e sigiloso.",
    url: "/",
    type: "website",
    images: [{ url: "/images/psicoterapia-alcyanne-social-1200x630.png", width: 1200, height: 630, alt: "Alcyanne Gouveia — Psicologia Clínica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Psicoterapia em Fortaleza | Alcyanne Gouveia",
    description: "Psicoterapia online e presencial em Fortaleza com Alcyanne Gouveia, psicóloga CRP 11/15040. Atendimento acolhedor, ético e sigiloso.",
    images: ["/images/psicoterapia-alcyanne-social-1200x630.png"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "300x300" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};(function(){var c=null;try{c=localStorage.getItem('alcyanne_cookie_consent_v1')}catch(e){}var s=c==='granted'?'granted':'denied';gtag('consent','default',{ad_storage:s,analytics_storage:s,ad_user_data:s,ad_personalization:s,wait_for_update:500})})();`,
          }}
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NHVT77S');`,
          }}
        />
        {/* End Google Tag Manager */}
        <script src="/anchor-navigation.js" defer />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NHVT77S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

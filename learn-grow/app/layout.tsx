import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import React from "react";
import  { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import {
  fontHindSiliguri,
  fontRoboto,
  fontAtma,
  fontOutfit,
  fontPoppins,
  fontSans,
  fontPlaypen,
} from "@/config/fonts";

import LayoutWrapper from "./layout-wrapper";
import CookieConsentBanner from "@/components/CookieConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@learnandgrow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": siteConfig.name,
    "description": siteConfig.description,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "sameAs": [
      siteConfig.links.facebook,
      siteConfig.links.instagram,
      siteConfig.links.linkedin,
      siteConfig.links.youtube,
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": siteConfig.email,
      "contactType": "Customer Service",
      "availableLanguage": ["English"]
    }
  };

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen bg-background text-foreground font-sans antialiased",
          fontSans.variable,
          fontPoppins.variable,
          fontRoboto.variable,
          fontPlaypen.variable,
          fontHindSiliguri.variable,
          fontAtma.variable,
          fontOutfit.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster position="top-center" reverseOrder={false} />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}

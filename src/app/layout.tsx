import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const siteUrl = "https://cloud.opexconsult.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Opex Cloud | Cloud Infrastructure for Nigerian Businesses",
    template: "%s | Opex Cloud",
  },

  description:
    "Discover Opex Cloud, the cloud infrastructure service being prepared by Opex Consulting for Nigerian businesses. Get updates on planned managed infrastructure, local support, Naira billing, migration assistance, and data residency.",

  applicationName: "Opex Cloud",

  keywords: [
    "Opex Cloud",
    "Opex Consulting",
    "cloud infrastructure Nigeria",
    "cloud services Nigeria",
    "managed cloud infrastructure",
    "Naira cloud billing",
    "cloud migration Nigeria",
    "data residency Nigeria",
    "cloud hosting for businesses",
    "Nigerian businesses",
  ],

  authors: [
    {
      name: "Opex Consulting",
      url: "https://opexconsult.com",
    },
  ],

  creator: "Opex Consulting",
  publisher: "Opex Consulting",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Opex Cloud",
    title: "Opex Cloud | Cloud Infrastructure, Made Simpler",
    description:
      "Cloud infrastructure, made simpler for Nigerian businesses. Join the Opex Cloud early-access list for launch updates, local support, and planned Naira billing.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Opex Cloud — Cloud infrastructure for Nigerian businesses",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Opex Cloud | Cloud Infrastructure, Made Simpler",
    description:
      "A simpler approach to cloud infrastructure for Nigerian businesses. Join the Opex Cloud early-access list.",
    images: ["/images/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030303",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-NG"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}

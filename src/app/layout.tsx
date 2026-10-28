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

const siteUrl = "https://opexcloud.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "OPEX Cloud | Enterprise Cloud Infrastructure in Nigeria",
    template: "%s | OPEX Cloud",
  },

  description:
    "OPEX Cloud provides enterprise cloud infrastructure for Nigeria, with virtual private cloud, compute, storage, networking, cloud migration, security, and managed infrastructure services from OPEX Consulting Limited.",

  applicationName: "OPEX Cloud",

  keywords: [
    "OPEX Cloud",
    "OPEX Consulting Limited",
    "enterprise cloud infrastructure Nigeria",
    "cloud services Nigeria",
    "virtual private cloud Nigeria",
    "VPC Nigeria",
    "cloud compute",
    "cloud storage",
    "private cloud networking",
    "managed cloud services",
    "cloud migration Nigeria",
    "cloud security",
    "backup and disaster recovery",
    "data residency Nigeria",
    "enterprise infrastructure",
  ],

  authors: [
    {
      name: "OPEX Consulting Limited",
      url: "https://opexconsult.com",
    },
  ],

  creator: "OPEX Consulting Limited",
  publisher: "OPEX Consulting Limited",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "OPEX Cloud",
    title: "OPEX Cloud | Enterprise Cloud Infrastructure. Built for Nigeria.",
    description:
      "Enterprise cloud infrastructure, migration, security, and managed services for organisations operating in Nigeria.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "OPEX Cloud — Enterprise Cloud Infrastructure. Built for Nigeria.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OPEX Cloud | Enterprise Cloud Infrastructure",
    description:
      "Enterprise cloud infrastructure, migration, and managed services for organisations in Nigeria.",
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
  themeColor: "#eaf1f9",
  colorScheme: "light",
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

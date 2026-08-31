import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site/site-chrome";
import { SiteNavbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/scroll-progress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

function resolvePublicBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!envUrl || envUrl.includes("onrender.com") || envUrl.includes("localhost") || !envUrl.includes("c2dtech.com")) {
    return "https://www.c2dtech.com";
  }
  return envUrl.replace(/\/$/, "");
}

const SITE_URL = resolvePublicBase();
const SITE_TITLE = "C2D Tech (Concept to Deploy) — Websites, Mobile Apps & AI Automation";
const SITE_DESCRIPTION =
  "C2D Tech (Concept to Deploy) — a developer friends squad in Trichy building premium websites, mobile apps, AI automation, cloud & DevOps solutions. From concept to deploy in 6 streamlined steps.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | C2D Tech",
  },
  description: SITE_DESCRIPTION,
  verification: {
    google: "ZdXy2bjnY1fj49Mw2SLbJhY2O6YH8J7ZjUrPumD1Dus",
  },
  keywords: [
    "C2D Tech",
    "Concept to Deploy",
    "web development Trichy",
    "software company Trichy",
    "AI automation",
    "mobile apps",
    "cloud and DevOps",
    "website design company",
  ],
  applicationName: "C2D Tech",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/apple-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "C2D Tech",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "C2D Tech (Concept to Deploy)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "C2D Tech",
  alternateName: "Concept to Deploy",
  url: "https://www.c2dtech.com",
  logo: "https://www.c2dtech.com/brand-logo.png",
  image: "https://www.c2dtech.com/brand-logo.png",
  sameAs: [
    "https://www.instagram.com/c2dtech",
    "https://www.linkedin.com/company/c2dtech",
    "https://www.youtube.com/@c2dtech",
    "https://github.com/c2dtech",
    "https://twitter.com/c2dtech",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/brand-logo.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteChrome navbar={<><ScrollProgress /><SiteNavbar /></>} footer={<SiteFooter />}>
              {children}
            </SiteChrome>
          </div>
        </Providers>
      </body>
    </html>
  );
}

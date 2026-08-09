import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site/site-chrome";
import { SiteNavbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/scroll-progress";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.c2dtech.com";
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
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
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

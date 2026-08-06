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

export const metadata: Metadata = {
  title: {
    default: "C2D Tech — Concept to Deploy | Developer Friends Squad in Trichy",
    template: "%s | C2D Tech",
  },
  description:
    "C2D Tech (Concept to Deploy) — a developer friends squad in Trichy building premium websites, mobile apps, AI automation, cloud & DevOps solutions.",
  keywords: ["C2D Tech", "Concept to Deploy", "web development Trichy", "software company Trichy", "AI automation"],
  openGraph: {
    type: "website",
    siteName: "C2D Tech",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
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

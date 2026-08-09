import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Cookie Policy", robots: { index: true, follow: true }, alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      crumb="Cookie Policy"
      sections={[
        {
          heading: "1. What are cookies",
          body: "Cookies are small text files stored on your device that help websites function and provide information to site owners.",
        },
        {
          heading: "2. Cookies we use",
          body: "Essential cookies keep the site working (for example, authentication for the admin area). Analytics cookies help us understand how visitors use the site so we can improve it. We do not use advertising cookies.",
        },
        {
          heading: "3. Managing cookies",
          body: "You can block or delete cookies through your browser settings. Blocking essential cookies may prevent parts of the site from working correctly.",
        },
        {
          heading: "4. Contact",
          body: "Questions about this cookie policy? Email hello@c2dtech.example.com.",
        },
      ]}
    />
  );
}

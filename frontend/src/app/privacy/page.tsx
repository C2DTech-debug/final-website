import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: true, follow: true } };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      crumb="Privacy Policy"
      sections={[
        {
          heading: "1. Who we are",
          body: "C2D Tech (Concept to Deploy) is a software development company based in Trichy, India. This policy explains how we collect, use and protect personal information submitted through this website.",
        },
        {
          heading: "2. Information we collect",
          body: "We collect the details you provide via our contact form, project estimator, newsletter subscription and job applications — including your name, email address, phone number and the content of your messages. We also collect limited, anonymised analytics data (pages visited, device type, browser) to improve the website.",
        },
        {
          heading: "3. How we use your information",
          body: "We use your information to respond to enquiries, prepare estimates, provide services you request, send you relevant updates if you opt in, and improve our website. We never sell your personal data to third parties.",
        },
        {
          heading: "4. Data retention",
          body: "Lead and enquiry data is retained for as long as it is relevant to your relationship with us. You may request deletion of your personal data at any time by contacting us.",
        },
        {
          heading: "5. Cookies",
          body: "This site uses essential cookies for functionality and optional analytics. You can control cookies through your browser settings. See our Cookie Policy for details.",
        },
        {
          heading: "6. Your rights",
          body: "Under applicable law you have the right to access, correct or delete your personal data. To exercise these rights, email us at hello@c2dtech.example.com.",
        },
        {
          heading: "7. Contact",
          body: "For any privacy questions, please contact C2D Tech at hello@c2dtech.example.com or via our contact page.",
        },
      ]}
    />
  );
}

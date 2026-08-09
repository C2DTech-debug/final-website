import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms of Service", robots: { index: true, follow: true }, alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      crumb="Terms of Service"
      sections={[
        {
          heading: "1. Agreement",
          body: "By using this website or engaging C2D Tech for services, you agree to these terms. This website is operated by C2D Tech (Concept to Deploy), Trichy, India.",
        },
        {
          heading: "2. Services",
          body: "We provide software development, design, cloud and marketing services as described on this website. Final scope, pricing and timelines are defined in a written agreement (Statement of Work) signed by both parties.",
        },
        {
          heading: "3. Intellectual property",
          body: "Upon full payment, deliverables are licensed to you as described in your agreement. C2D Tech retains the right to display completed work in its portfolio unless agreed otherwise.",
        },
        {
          heading: "4. Quotes & estimates",
          body: "Estimates provided through this website are indicative only. Final quotes may vary based on detailed requirements and discovery.",
        },
        {
          heading: "5. Limitation of liability",
          body: "To the maximum extent permitted by law, C2D Tech shall not be liable for indirect, incidental or consequential damages arising from use of this website or our services.",
        },
        {
          heading: "6. Governing law",
          body: "These terms are governed by the laws of India and the courts of Tiruchirappalli, Tamil Nadu shall have exclusive jurisdiction.",
        },
      ]}
    />
  );
}

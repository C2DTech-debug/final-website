import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | C2D Tech",
  description: "C2D Tech Software Solutions Refund Policy and service cancellation terms.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4274D9] hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D0E7E6]/40 text-[#4274D9] dark:bg-[#4274D9]/20 dark:text-[#95CCDD]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Refund Policy</h1>
              <p className="text-xs text-slate-500">Last updated: August 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Service Agreements & Milestones</h2>
              <p>
                At C2D Tech Software Solutions, all bespoke software engineering, mobile application, and cloud infrastructure projects are delivered in defined milestone phases as specified in the signed Project Agreement. Payments are tied to milestone acceptance criteria.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Cancellation & Refunds</h2>
              <p>
                Clients may cancel project contracts prior to the commencement of development for a full refund of the initial deposit minus administrative scoping costs. Once milestone development has started, refunds are evaluated on a pro-rata basis corresponding to the work completed and verified.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Warranty & Defect Resolution</h2>
              <p>
                We provide a comprehensive 30-day post-deployment warranty during which any bugs or defects in the delivered scope are rectified at zero additional cost.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Contacting Us</h2>
              <p>
                For refund or cancellation inquiries, please reach out to our billing team at{" "}
                <a href="mailto:billing@c2dtech.com" className="font-semibold text-[#4274D9] hover:underline">
                  billing@c2dtech.com
                </a>{" "}
                or contact your dedicated project manager.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

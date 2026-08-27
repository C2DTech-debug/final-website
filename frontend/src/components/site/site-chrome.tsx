"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

// The site navbar/footer belong to public pages only. Admin routes (including
// /admin/login) render their own chrome, so suppress the public header/footer
// there to avoid the two overlapping.
export function SiteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isExcluded = pathname.startsWith("/admin") || pathname.startsWith("/agreement");

  return (
    <>
      {isExcluded ? null : navbar}
      <main className="flex-1">{children}</main>
      {isExcluded ? null : footer}
    </>
  );
}

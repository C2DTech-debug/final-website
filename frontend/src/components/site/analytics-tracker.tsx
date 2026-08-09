"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackVisit } from "@/hooks/useSite";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackVisit(pathname, document.referrer).catch(() => undefined);
  }, [pathname]);

  return null;
}

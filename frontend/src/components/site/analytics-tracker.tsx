"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackVisit } from "@/hooks/useSite";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    void trackVisit(pathname, document.referrer);
  }, [pathname]);

  return null;
}

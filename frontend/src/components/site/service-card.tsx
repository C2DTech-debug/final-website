"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Service } from "@/types";
import { formatINR } from "@/lib/utils";
import { ServiceIcon } from "@/components/site/service-icon";
import { StaggerItem } from "@/components/site/reveal";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col justify-between rounded-[28px] border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#4274D9] hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Top Content */}
      <div>
        {/* Animated Squircle Icon */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D0E7E6] text-[#293681] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4274D9] group-hover:text-white dark:bg-[#4274D9]/20 dark:text-[#95CCDD] dark:group-hover:bg-[#4274D9] dark:group-hover:text-white">
          <ServiceIcon icon={service.icon} className="h-7 w-7" />
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-[#4274D9] dark:text-white sm:text-2xl">
          {service.name}
        </h3>

        {/* Short Description */}
        <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {service.shortDescription || service.description}
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            {service.pricing?.enabled && (service.pricing.startingAt ?? 0) > 0 ? (
              <div className="text-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400">Starting from </span>
                <span className="font-display text-base font-extrabold text-[#293681] dark:text-[#95CCDD]">
                  {formatINR(service.pricing.startingAt ?? 0)}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Custom Scope</span>
            )}

            {service.pricing?.deliveryDays ? (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-[#4274D9]" /> {service.pricing.deliveryDays}+ days delivery
              </div>
            ) : null}
          </div>

          {/* Circular Hover-Slide Arrow Button */}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D0E7E6] text-[#293681] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4274D9] group-hover:text-white group-hover:translate-x-1 dark:bg-[#4274D9]/20 dark:text-[#95CCDD] dark:group-hover:bg-[#4274D9] dark:group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Service } from "@/types";
import { formatINR } from "@/lib/utils";
import { ServiceIcon } from "@/components/site/service-icon";
import { StaggerItem } from "@/components/site/reveal";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <StaggerItem>
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 text-primary transition-colors group-hover:from-violet-600 group-hover:to-cyan-500 group-hover:text-white">
          <ServiceIcon icon={service.icon} className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-semibold">{service.name}</h3>
        {service.tagline && <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{service.tagline}</p>}
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{service.shortDescription || service.description}</p>

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <div className="text-sm">
            {service.pricing?.enabled && (service.pricing.startingAt ?? 0) > 0 ? (
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{formatINR(service.pricing.startingAt ?? 0)}</span> / project
              </span>
            ) : (
              <span className="text-muted-foreground">Custom quote</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Explore <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        {service.pricing?.deliveryDays ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {service.pricing.deliveryDays}+ days delivery
          </div>
        ) : null}
      </Link>
    </StaggerItem>
  );
}

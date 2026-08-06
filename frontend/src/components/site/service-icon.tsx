import {
  Globe,
  Smartphone,
  Code2,
  Bot,
  Cloud,
  Megaphone,
  Rocket,
  Shield,
  Database,
  Sparkles,
  Cpu,
  Palette,
  Server,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Code2,
  Bot,
  Cloud,
  Megaphone,
  Rocket,
  Shield,
  Database,
  Sparkles,
  Cpu,
  Palette,
  Server,
};

export function ServiceIcon({ icon, className }: { icon?: string; className?: string }) {
  const Icon = ICON_MAP[icon || ""] || Globe;
  if (icon && icon.length <= 4 && !/^[a-zA-Z]/.test(icon)) {
    return <span className={className}>{icon}</span>;
  }
  return <Icon className={className} aria-hidden />;
}

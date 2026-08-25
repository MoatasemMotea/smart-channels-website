import {
  Building2,
  Cable,
  Cctv,
  CreditCard,
  DatabaseBackup,
  Fingerprint,
  KeyRound,
  Keyboard,
  Monitor,
  Network,
  Printer,
  Router,
  ScanEye,
  Server,
  ServerCog,
  Settings2,
  ShieldCheck,
  Video,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Icon registry.
 *
 * Icons are referenced from data files by name, so the data layer stays free of
 * React imports and a content editor never has to touch a component. Importing
 * each glyph explicitly (rather than a dynamic `lucide-react/*` lookup) keeps
 * tree-shaking effective — only the twenty icons actually used are bundled,
 * not the full set.
 */
const registry = {
  "building-2": Building2,
  cable: Cable,
  cctv: Cctv,
  "credit-card": CreditCard,
  "database-backup": DatabaseBackup,
  fingerprint: Fingerprint,
  "key-round": KeyRound,
  keyboard: Keyboard,
  monitor: Monitor,
  network: Network,
  printer: Printer,
  router: Router,
  "scan-eye": ScanEye,
  server: Server,
  "server-cog": ServerCog,
  "settings-2": Settings2,
  "shield-check": ShieldCheck,
  video: Video,
  wifi: Wifi,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof registry;

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Component = registry[name as IconName];
  if (!Component) return null;
  return <Component aria-hidden="true" className={className} />;
}

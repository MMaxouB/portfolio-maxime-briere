import { FolderKanban, GraduationCap, Route, ShieldCheck, UserRound } from "lucide-react";
import type { DeepPage } from "@/lib/navigation";

const ICONS = {
  projects: FolderKanban,
  skills: GraduationCap,
  timeline: Route,
  cyber: ShieldCheck,
  about: UserRound,
} as const;

export function PageIcon({ name, size = 17 }: { name: DeepPage["icon"]; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} aria-hidden="true" />;
}

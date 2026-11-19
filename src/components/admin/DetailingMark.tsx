import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import logo from "@/assets/kvs-logo.png.asset.json";

/** Business logo (circular badge, works on light and dark surfaces). */
export function DetailingMark({
  compact = false,
  className = "",
}: {
  dark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <img
      src={logo.url}
      alt={BRAND.demoBusiness.name}
      className={cn("aspect-square w-auto shrink-0 object-contain", compact ? "h-8" : "h-11", className)}
    />
  );
}

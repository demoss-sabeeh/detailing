import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page, total, onChange, size = 12 }: { page: number; total: number; onChange: (p: number) => void; size?: number }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages);
  return <div className="flex items-center justify-between gap-2 border-t py-3 text-xs text-slate">
    <span>{total ? (current - 1) * size + 1 : 0}–{Math.min(current * size, total)} of {total}</span>
    <div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous page" disabled={current === 1} onClick={() => onChange(current - 1)}><ChevronLeft /></Button><span>{current} / {pages}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={current >= pages} onClick={() => onChange(current + 1)}><ChevronRight /></Button></div>
  </div>;
}
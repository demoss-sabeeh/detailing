import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Car, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleDialog } from "@/components/admin/RecordDialogs";
import { Pagination } from "@/components/admin/Pagination";
import { adminHead } from "@/lib/workspace";
import { PageTitle, RowsSkeleton, EmptyState, inputSm } from "@/components/admin/ui";
import { RowDelete } from "@/components/admin/delete";
import { deleteVehicle } from "@/lib/actions";
import { useVehicles } from "@/lib/admin-data";
import { fmtDate, fullName, vehicleName } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/vehicles/")({ head: () => adminHead("Vehicles"), component: Vehicles });

function Vehicles() {
  const v = useVehicles();
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false); const [page,setPage] = useState(1);
  const rows = useMemo(() => (v.data ?? []).filter((x) => !q || `${vehicleName(x)} ${x.color} ${fullName(x.customer)}`.toLowerCase().includes(q.toLowerCase())), [v.data, q]);
  return (
    <div className="space-y-5">
      <PageTitle title="Vehicles" subtitle="Every vehicle, its owner and its service history." actions={<Button onClick={() => setCreate(true)}><Plus /> Add vehicle</Button>} />
      <div className="relative max-w-md"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate" /><input aria-label="Search vehicles" className={`${inputSm} pl-8`} placeholder="Make, model, owner…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {v.isLoading ? <RowsSkeleton /> : rows.length === 0 ? <EmptyState title="No vehicles found" /> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.slice((Math.min(page,Math.max(1,Math.ceil(rows.length/12)))-1)*12,Math.min(page,Math.max(1,Math.ceil(rows.length/12)))*12).map((x) => {
            const done = x.appointments.filter((a) => a.status === "completed").sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at));
            return (
              <Link key={x.id} to="/admin/vehicles/$id" params={{ id: x.id }} className="rounded-md border bg-surface p-4 transition-colors hover:border-primary">
                <div className="flex items-start justify-between"><Car className="h-5 w-5 text-primary" /><span className="-mr-2 -mt-2 flex items-center text-[11px] text-slate">{x.color}<RowDelete kind="Vehicle" name={vehicleName(x)} detail="Its leads, quotes and appointments stay on the customer record." onConfirm={() => deleteVehicle(x.id)} /></span></div>
                <p className="mt-3 font-bold text-navy">{vehicleName(x)}</p>
                <p className="text-xs text-slate">Owner · {fullName(x.customer)}</p>
                <p className="mt-3 border-t pt-2 text-xs text-slate">{done.length} completed services<br />Last service: <span className="font-semibold text-navy">{done[0] ? `${done[0].service?.name} · ${fmtDate(done[0].starts_at)}` : "None yet"}</span></p>
              </Link>
            );
          })}
        </div>
      )}
      <Pagination page={page} total={rows.length} onChange={setPage} />{create && <VehicleDialog onClose={() => setCreate(false)} />}
    </div>
  );
}

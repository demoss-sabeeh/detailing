import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { PageTitle, StatusBadge, RowsSkeleton, EmptyState, ErrorState, selectCls, inputSm } from "@/components/admin/ui";
import { RowDelete } from "@/components/admin/delete";
import { deleteLead } from "@/lib/actions";
import { useLeads, useServices } from "@/lib/admin-data";
import { fullName, label, LEAD_SOURCES, LEAD_STATUSES, money, timeAgo, vehicleName } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/Pagination";
import { adminHead } from "@/lib/workspace";

type S = { status?: string; q?: string };
export const Route = createFileRoute("/_authenticated/admin/leads/")({
  validateSearch: (s: Record<string, unknown>): S => ({ status: typeof s.status === "string" ? s.status : undefined, q: typeof s.q === "string" ? s.q : undefined }),
  component: LeadsPage,
  head: () => adminHead("Leads & Inquiries"),
});

function LeadsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/leads/" });
  const leads = useLeads();
  const services = useServices();
  const [q, setQ] = useState(search.q ?? "");
  const [service, setService] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState<"created" | "value">("created");
  const [page,setPage] = useState(1);
  const status = search.status ?? "";

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return (leads.data ?? [])
      .filter((l) => !status || l.status === status)
      .filter((l) => !service || l.service_id === service)
      .filter((l) => !source || l.source === source)
      .filter((l) => !t || `${fullName(l.customer)} ${l.customer?.email} ${vehicleName(l.vehicle)} ${l.service?.name}`.toLowerCase().includes(t))
      .sort((a, b) => (sort === "value" ? b.estimated_value - a.estimated_value : +new Date(b.created_at) - +new Date(a.created_at)));
  }, [leads.data, q, status, service, source, sort]);

  return (
    <div className="space-y-5">
      <PageTitle title="Leads & Inquiries" subtitle={`${rows.length} of ${leads.data?.length ?? 0} inquiries`} actions={<Button asChild variant="outline"><Link to="/admin/quotes">Quotes</Link></Button>} />
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate" aria-hidden />
          <input aria-label="Search leads" className={`${inputSm} pl-8`} placeholder="Search customer, vehicle, service…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select aria-label="Status" className={selectCls} value={status} onChange={(e) => navigate({ search: { status: e.target.value || undefined } })}>
          <option value="">All statuses</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select aria-label="Service" className={selectCls} value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">All services</option>{services.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select aria-label="Source" className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>{LEAD_SOURCES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <Button variant="outline" onClick={() => setSort(sort === "created" ? "value" : "created")}><ArrowUpDown /> {sort === "created" ? "Newest" : "Highest value"}</Button>
      </div>

      <div className="overflow-hidden rounded-md border bg-surface">
        {leads.isLoading ? <div className="p-4"><RowsSkeleton /></div> : leads.isError ? <ErrorState error={leads.error} retry={() => leads.refetch()} /> : rows.length === 0 ? <EmptyState title="No leads match" body="Try clearing a filter." /> : (
          <>
            <table className="hidden w-full text-sm md:table">
              <thead className="border-b bg-secondary/50 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate">
                <tr>{["Customer", "Vehicle", "Service", "Source", "Status", "Created", "Est. value"].map((h) => <th key={h} className="px-4 py-2.5 font-bold">{h}</th>)}<th className="w-12"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody className="divide-y">
                {rows.slice((Math.min(page,Math.max(1,Math.ceil(rows.length/12)))-1)*12,Math.min(page,Math.max(1,Math.ceil(rows.length/12)))*12).map((l) => (
                  <tr key={l.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => navigate({ to: "/admin/leads/$id", params: { id: l.id } })}>
                    <td className="px-4 py-2.5"><Link to="/admin/leads/$id" params={{ id: l.id }} className="font-bold text-navy hover:text-primary">{fullName(l.customer)}</Link></td>
                    <td className="px-4 py-2.5 text-slate">{vehicleName(l.vehicle)}</td>
                    <td className="px-4 py-2.5 text-navy">{l.service?.name}</td>
                    <td className="px-4 py-2.5 text-slate">{label(l.source)}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={l.status} /></td>
                    <td className="tabular px-4 py-2.5 text-slate">{timeAgo(l.created_at)}</td>
                    <td className="tabular px-4 py-2.5 text-right font-semibold text-navy">{money(l.estimated_value)}</td>
                    <td className="pr-2"><RowDelete kind="Lead" name={`${fullName(l.customer)} — ${l.service?.name ?? "lead"}`} detail="Quotes, appointments and messages stay on the customer record." onConfirm={() => deleteLead(l.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="divide-y md:hidden">
              {rows.slice((Math.min(page,Math.max(1,Math.ceil(rows.length/12)))-1)*12,Math.min(page,Math.max(1,Math.ceil(rows.length/12)))*12).map((l) => (
                <li key={l.id} className="flex items-start">
                  <Link to="/admin/leads/$id" params={{ id: l.id }} className="block min-w-0 flex-1 py-3 pl-4">
                    <div className="flex items-center justify-between gap-2"><p className="font-bold text-navy">{fullName(l.customer)}</p><StatusBadge status={l.status} /></div>
                    <p className="mt-0.5 text-xs text-slate">{vehicleName(l.vehicle)} · {l.service?.name}</p>
                    <p className="tabular mt-1 flex justify-between text-xs"><span className="text-slate">{label(l.source)} · {timeAgo(l.created_at)}</span><span className="font-semibold text-navy">{money(l.estimated_value)}</span></p>
                  </Link>
                  <RowDelete className="px-1 pt-2" kind="Lead" name={`${fullName(l.customer)} — ${l.service?.name ?? "lead"}`} detail="Quotes, appointments and messages stay on the customer record." onConfirm={() => deleteLead(l.id)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <Pagination page={page} total={rows.length} onChange={setPage} />
    </div>
  );
}

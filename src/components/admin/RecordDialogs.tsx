import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { inputSm, selectCls } from "./ui";
import { supabase } from "@/integrations/supabase/client";
import { useCustomers, useInvalidate, useVehicles, type Customer, type Vehicle } from "@/lib/admin-data";
import { fullName } from "@/lib/format";

export function CustomerDialog({ customer, onClose, onSaved }: { customer?: Customer; onClose: () => void; onSaved?: (id: string) => void }) {
  const invalidate = useInvalidate();
  const customers = useCustomers();
  const [f, setF] = useState({ first_name: customer?.first_name ?? "", last_name: customer?.last_name ?? "", email: customer?.email ?? "", phone: customer?.phone ?? "", city: customer?.city ?? "", notes: customer?.notes ?? "" });
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const email = f.email.trim().toLowerCase();
    const duplicate = customers.data?.find((c) => c.id !== customer?.id && c.email.toLowerCase() === email);
    if (duplicate) { toast.error("A customer with that email already exists. Select their profile instead."); return; }
    setBusy(true);
    const row = { ...f, first_name: f.first_name.trim(), last_name: f.last_name.trim(), email, phone: f.phone.trim() };
    const { data, error } = customer ? await supabase.from("customers").update(row).eq("id", customer.id).select("id").single() : await supabase.from("customers").insert(row).select("id").single();
    setBusy(false);
    if (error || !data) { toast.error(error?.message ?? "Could not save customer"); return; }
    await invalidate(); toast.success("Customer saved"); onSaved?.(data.id); onClose();
  }
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle><DialogDescription>Customer contact details</DialogDescription></DialogHeader>
    <form onSubmit={save} className="space-y-4"><div className="grid grid-cols-2 gap-3">{(["first_name", "last_name"] as const).map((key) => <label key={key} className="text-xs font-medium text-slate">{key === "first_name" ? "First name" : "Last name"}<input required maxLength={60} className={`${inputSm} mt-1`} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} /></label>)}</div>
      {(["email", "phone", "city"] as const).map((key) => <label key={key} className="block text-xs font-medium capitalize text-slate">{key}<input required={key !== "city"} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} minLength={key === "phone" ? 7 : undefined} className={`${inputSm} mt-1`} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} /></label>)}
      <label className="block text-xs font-medium text-slate">Notes<textarea className={`${inputSm} mt-1 h-auto py-2`} rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
      <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy} type="submit">{busy ? "Saving…" : "Save customer"}</Button></DialogFooter>
    </form></DialogContent></Dialog>;
}

export function VehicleDialog({ vehicle, customerId, onClose, onSaved }: { vehicle?: Vehicle; customerId?: string; onClose: () => void; onSaved?: (id: string) => void }) {
  const customers = useCustomers(); const vehicles = useVehicles(); const invalidate = useInvalidate();
  const [f, setF] = useState({ customer_id: vehicle?.customer_id ?? customerId ?? "", make: vehicle?.make ?? "", model: vehicle?.model ?? "", year: vehicle?.year ?? new Date().getFullYear(), color: vehicle?.color ?? "", notes: vehicle?.notes ?? "" });
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const row = { ...f, make: f.make.trim(), model: f.model.trim() };
    if (vehicles.data?.some((v) => v.id !== vehicle?.id && v.customer_id === f.customer_id && v.year === f.year && v.make.toLowerCase() === row.make.toLowerCase() && v.model.toLowerCase() === row.model.toLowerCase() && v.color.toLowerCase() === f.color.toLowerCase())) { toast.error("This vehicle is already registered to this customer."); return; }
    setBusy(true);
    const { data, error } = vehicle ? await supabase.from("vehicles").update(row).eq("id", vehicle.id).select("id").single() : await supabase.from("vehicles").insert(row).select("id").single();
    setBusy(false);
    if (error || !data) { toast.error(error?.message ?? "Could not save vehicle"); return; }
    await invalidate(); toast.success("Vehicle saved"); onSaved?.(data.id); onClose();
  }
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{vehicle ? "Edit vehicle" : "Add vehicle"}</DialogTitle><DialogDescription>Vehicle and registered owner</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={save}>
    <label className="block text-xs font-medium text-slate">Customer<select required disabled={!!vehicle || !!customerId} className={`${selectCls} mt-1 w-full`} value={f.customer_id} onChange={(e) => setF({ ...f, customer_id: e.target.value })}><option value="">Select customer</option>{customers.data?.map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}</select></label>
    <div className="grid grid-cols-2 gap-3">{(["make", "model", "year", "color"] as const).map((key) => <label key={key} className="text-xs font-medium capitalize text-slate">{key}<input required={key !== "color"} type={key === "year" ? "number" : "text"} min={key === "year" ? 1950 : undefined} max={key === "year" ? new Date().getFullYear() + 2 : undefined} className={`${inputSm} mt-1`} value={f[key]} onChange={(e) => setF({ ...f, [key]: key === "year" ? Number(e.target.value) : e.target.value })} /></label>)}</div>
    <label className="block text-xs font-medium text-slate">Notes<textarea rows={3} className={`${inputSm} mt-1 h-auto py-2`} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
    <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={busy || !f.customer_id} type="submit">{busy ? "Saving…" : "Save vehicle"}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Check, CalendarClock, MessageSquare, BellPlus } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, selectCls, inputSm } from "./ui";
import { useInvalidate, useLeads, useAppointments, useFollowUps, type Appointment } from "@/lib/admin-data";
import { DeleteButton } from "./delete";
import { setAppointmentStatus, editAppointment, deleteAppointment } from "@/lib/actions";
import { APPT_STATUSES, dayKey, fmtDate, fmtTime, fullName, label, money, vehicleName } from "@/lib/format";
import { bookingAmount, overlapsBooking, serviceMode } from "@/lib/workspace";
import { validateBookingSlot } from "@/lib/booking-validation";
import { TIME_SLOTS } from "@/lib/knowledge";
import { FollowUpDialog, MessageDialog } from "./dialogs";

export function AppointmentSheet({ appt, onClose }: { appt: Appointment | null; onClose: () => void }) {
  const invalidate = useInvalidate();
  const leads = useLeads(); const appointments = useAppointments(); const followUps = useFollowUps();
  const [editing, setEditing] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [dialog, setDialog] = useState<"msg" | "fu" | null>(null);
  const [draft, setDraft] = useState({ date: "", time: "", duration: 2, location: "", notes: "" });
  function beginEdit() { if (!appt) return; setEditing(appt.id); setDraft({ date: dayKey(appt.starts_at), time: fmtTime(appt.starts_at), duration: Number(appt.duration_hours), location: appt.location, notes: appt.notes }); }
  async function save() {
    if (!appt) return;
    setBusy(true);
    try { const starts_at = validateBookingSlot(draft.date, draft.time, draft.duration); await editAppointment(appt.id, { starts_at, duration_hours: draft.duration, location: draft.location, notes: draft.notes }); await invalidate(); setEditing(null); toast.success("Booking updated"); } catch(e) { toast.error(e instanceof Error ? e.message : "Update failed"); } finally { setBusy(false); }
  }
  async function change(s: string) {
    if (!appt) return;
    setBusy(true);
    try {
      await setAppointmentStatus(appt, s);
      await invalidate();
      toast.success(`Appointment ${label(s).toLowerCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally { setBusy(false);
    }
  }
  return (
    <Sheet open={!!appt} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="admin-workspace w-full overflow-y-auto sm:max-w-lg">
        <SheetTitle className="text-navy">Booking details</SheetTitle>
        {appt && (
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-[11px] text-slate">#{appt.id.slice(0,8).toUpperCase()} · {serviceMode(appt)}</p>
              <p className="mt-2 text-xl font-bold text-navy">{appt.service?.name}</p>
              <p className="text-sm text-slate">{fmtDate(appt.starts_at, { weekday: "long", month: "long", day: "numeric" })} · {fmtTime(appt.starts_at)} · ~{appt.duration_hours} hrs</p>
              <div className="mt-2"><StatusBadge status={appt.status} /></div>
              <p className="tabular mt-3 text-2xl font-bold">{money(bookingAmount(appt, leads.data))}<span className="ml-2 text-xs font-normal text-slate">booking value</span></p>
            </div>
            <div className="flex flex-wrap gap-2"><Button disabled={busy || appt.status === "confirmed"} size="sm" onClick={() => change("confirmed")}><Check /> Confirm</Button><Button disabled={busy || appt.status === "completed"} size="sm" variant="outline" onClick={() => change("completed")}>Mark completed</Button><Button size="sm" variant="outline" onClick={beginEdit}><CalendarClock /> Reschedule / edit</Button></div>
            <dl className="divide-y rounded-md border text-sm">
              <div className="flex justify-between px-3 py-2"><dt className="text-slate">Customer</dt><dd><Link to="/admin/customers/$id" params={{ id: appt.customer_id }} className="font-semibold text-primary">{fullName(appt.customer)}</Link></dd></div>
              <div className="flex justify-between px-3 py-2"><dt className="text-slate">Vehicle</dt><dd>{appt.vehicle_id ? <Link to="/admin/vehicles/$id" params={{ id: appt.vehicle_id }} className="font-semibold text-primary">{vehicleName(appt.vehicle)}</Link> : "—"}</dd></div>
              <div className="flex justify-between gap-4 px-3 py-2"><dt className="text-slate">Location</dt><dd className="text-right text-navy">{appt.location}</dd></div>
              <div className="flex justify-between px-3 py-2"><dt className="text-slate">Phone</dt><dd className="text-navy">{appt.customer?.phone}</dd></div>
              <div className="flex justify-between gap-3 px-3 py-2"><dt className="text-slate">Email</dt><dd className="break-all text-right">{appt.customer?.email}</dd></div>
              <div className="flex justify-between px-3 py-2"><dt className="text-slate">Color</dt><dd>{appt.vehicle?.color || "—"}</dd></div>
            </dl>
            {appt.notes && <div className="border-b pb-4"><p className="mb-2 text-sm font-semibold">Services & instructions</p><p className="whitespace-pre-wrap break-words text-sm text-slate">{appt.notes}</p></div>}
            {editing === appt.id && <div className="space-y-3 border-y py-4"><h3 className="text-sm font-semibold">Edit booking</h3><div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate">Date<input aria-label="Reschedule date" type="date" className={`${inputSm} mt-1`} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></label><label className="text-xs text-slate">Time<select aria-label="Reschedule time" className={`${selectCls} mt-1 w-full`} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })}><option value="">Select time</option>{TIME_SLOTS.map((t) => { let disabled = true; try { const start = validateBookingSlot(draft.date,t,draft.duration); disabled = overlapsBooking(appointments.data ?? [],start,draft.duration,appt.id); } catch {} return <option disabled={disabled} key={t}>{t}</option>; })}</select></label></div><label className="block text-xs text-slate">Duration (hours)<input type="number" min={0.5} step={0.5} className={`${inputSm} mt-1`} value={draft.duration} onChange={(e) => setDraft({ ...draft,duration:Number(e.target.value) })} /></label><label className="block text-xs text-slate">Location<input className={`${inputSm} mt-1`} value={draft.location} onChange={(e) => setDraft({ ...draft,location:e.target.value })} /></label><label className="block text-xs text-slate">Notes<textarea rows={4} className={`${inputSm} mt-1 h-auto py-2`} value={draft.notes} onChange={(e) => setDraft({ ...draft,notes:e.target.value })} /></label><div className="flex gap-2"><Button disabled={busy} onClick={save}><Pencil /> Save changes</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div></div>}
            <div>
              <label htmlFor="appt-status" className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate">Status</label>
              <select disabled={busy} id="appt-status" className={`${selectCls} w-full`} value={appt.status} onChange={(e) => change(e.target.value)}>
                {APPT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </div>
            <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setDialog("msg")}><MessageSquare /> Contact customer</Button><Button variant="outline" size="sm" onClick={() => setDialog("fu")}><BellPlus /> Follow-up</Button></div>
            <div><h3 className="text-sm font-semibold">Reminders</h3>{followUps.data?.filter((f) => f.customer_id === appt.customer_id && (!appt.lead_id || f.lead_id === appt.lead_id)).slice(0,4).map((f) => <p key={f.id} className="mt-2 text-xs text-slate">{f.reason} · {fmtDate(f.next_contact_at)} · {label(f.status)}</p>)}</div>
            <div className="border-t pt-3 text-xs text-slate">Payment status is not recorded in this workspace.</div>
            {appt.lead_id && <Link to="/admin/leads/$id" params={{ id: appt.lead_id }} className="text-sm font-semibold text-primary">Open lead →</Link>}
            <div className="border-t pt-4"><DeleteButton kind="Appointment" name={`${appt.service?.name ?? "Appointment"} · ${fullName(appt.customer)} · ${fmtDate(appt.starts_at)} ${fmtTime(appt.starts_at)}`} onConfirm={() => deleteAppointment(appt.id)} onDeleted={onClose} label="Delete appointment" /></div>
            <MessageDialog open={dialog === "msg"} onOpenChange={(o) => setDialog(o ? "msg" : null)} ctx={{ customer_id: appt.customer_id, lead_id: appt.lead_id, customerName: fullName(appt.customer) }} /><FollowUpDialog open={dialog === "fu"} onOpenChange={(o) => setDialog(o ? "fu" : null)} ctx={{ customer_id: appt.customer_id, lead_id: appt.lead_id, vehicle_id: appt.vehicle_id, customerName: fullName(appt.customer) }} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

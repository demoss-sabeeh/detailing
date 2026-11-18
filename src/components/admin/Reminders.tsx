import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RowDelete } from "./delete";
import { useFollowUps, useInvalidate } from "@/lib/admin-data";
import { deleteFollowUp } from "@/lib/actions";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/format";
export function Reminders({ customerId, leadId }: { customerId: string; leadId?: string }) {
  const query = useFollowUps(); const invalidate = useInvalidate();
  const rows = (query.data ?? []).filter((f) => f.customer_id === customerId && (!leadId || f.lead_id === leadId) && ["pending","scheduled"].includes(f.status));
  async function complete(id: string) { const {error} = await supabase.from("follow_ups").update({status:"completed",last_contact_at:new Date().toISOString()}).eq("id",id); if(error) { toast.error(error.message);return; } await invalidate();toast.success("Reminder completed"); }
  return <div className="divide-y">{rows.map((f) => <div key={f.id} className="flex items-center gap-2 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{f.reason}</p><p className="mt-1 text-xs text-slate">{fmtDate(f.next_contact_at)}</p></div><Button variant="ghost" size="icon" aria-label={`Complete ${f.reason}`} onClick={() => complete(f.id)}><Check /></Button><RowDelete kind="Follow-up" name={f.reason} onConfirm={() => deleteFollowUp(f.id)} /></div>)}{!rows.length && <p className="py-3 text-sm text-slate">No pending reminders</p>}</div>;
}
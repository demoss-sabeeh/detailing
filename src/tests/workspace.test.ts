import { describe, it, expect } from "vitest";
import { overlapsBooking, receivedRevenue } from "@/lib/workspace";
import { bookingCart } from "@/lib/knowledge";

describe("owner workspace rules", () => {
  it("never counts unpaid bookings as received revenue", () => {
    expect(receivedRevenue([{ amount: 1200, status: "pending" }, { amount: 300, status: "paid" }, { amount: 90, status: "refunded" }])).toBe(300);
  });
  it("rescheduling excludes itself but blocks overlaps with another active booking", () => {
    const rows = [{ id: "one", starts_at: "2026-11-20T14:00:00Z", duration_hours: 2, status: "confirmed" }];
    expect(overlapsBooking(rows, "2026-11-20T15:00:00Z", 2)).toBe(true);
    expect(overlapsBooking(rows, "2026-11-20T15:00:00Z", 2, "one")).toBe(false);
    expect(overlapsBooking(rows, "2026-11-20T16:00:00Z", 2)).toBe(false);
  });
  it("uses the current service catalog for combined prices and durations", () => {
    const catalog = [{slug:"test",name:"Test",short:"",description:"",ideal:"",includes:[],priceFrom:123,priceTo:123,durationHours:1}];
    expect(bookingCart(["test"],["engine-bay"],catalog).price).toBe(202);
    expect(bookingCart(["test"],["engine-bay"],catalog).durationHours).toBe(1.5);
  });
});
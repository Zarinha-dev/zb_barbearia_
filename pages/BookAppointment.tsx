// pages/BookAppointment.tsx
import React, { useMemo, useState } from "react";
import {
  Booking,
  getBlocks,
  getBookings,
  getCurrentUser,
  getServices,
  makeId,
  saveBookings,
  formatMoneyBRL,
} from "@/lib/storage";

function toISO(dateStr: string, timeStr: string) {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function sameSlotISO(a: string, b: string) {
  return new Date(a).toISOString() === new Date(b).toISOString();
}

export default function BookAppointment({ setPage }: { setPage: (p: string) => void }) {
  const user = getCurrentUser();
  const services = getServices();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [serviceId, setServiceId] = useState(services[0]?.id || "1");
  const [msg, setMsg] = useState("");

  const times = useMemo(() => {
    const list: string[] = [];
    for (let h = 9; h <= 18; h++) {
      list.push(`${String(h).padStart(2, "0")}:00`);
      list.push(`${String(h).padStart(2, "0")}:30`);
    }
    // 19:00 último slot
    list.push("19:00");
    return list;
  }, []);

  const availableTimes = useMemo(() => {
    const bookings = getBookings().filter(b => b.status === "active");
    const blocks = getBlocks();

    return times.filter(t => {
      const slotISO = toISO(date, t);
      const slotDate = new Date(slotISO);

      // past
      if (slotDate.getTime() < Date.now() - 60_000) return false;

      // booking conflict
      if (bookings.some(b => sameSlotISO(b.startsAt, slotISO))) return false;

      // block conflict
      const blocked = blocks.some(bl => {
        const s = new Date(bl.startAt).getTime();
        const e = new Date(bl.endAt).getTime();
        const x = slotDate.getTime();
        return x >= s && x <= e;
      });
      if (blocked) return false;

      return true;
    });
  }, [date, times]);

  function book(time: string) {
    setMsg("");
    if (!user) {
      setMsg("Você precisa fazer login para agendar.");
      setPage("login");
      return;
    }

    const service = services.find(s => s.id === serviceId);
    if (!service) return setMsg("Serviço inválido.");

    const startsAt = toISO(date, time);

    const booking: Booking = {
      id: makeId("bk"),
      userEmail: user.email,
      userName: user.name,
      serviceId: service.id,
      serviceName: service.name,
      priceCents: service.priceCents,
      startsAt,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const bookings = getBookings();
    if (bookings.some(b => b.status === "active" && sameSlotISO(b.startsAt, startsAt))) {
      return setMsg("Esse horário já foi reservado.");
    }

    bookings.push(booking);
    saveBookings(bookings);
    setMsg("✅ Agendado com sucesso!");
    setPage("my");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Agendar</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <label className="text-sm text-zinc-300">Serviço</label>
          <select
            className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatMoneyBRL(s.priceCents)}
              </option>
            ))}
          </select>

          <label className="text-sm text-zinc-300 mt-4 block">Data</label>
          <input
            type="date"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {msg && <div className="mt-3 text-sm text-zinc-200">{msg}</div>}
        </div>

        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Horários disponíveis</h2>
            <span className="text-zinc-400 text-sm">{date}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {availableTimes.length === 0 && (
              <div className="text-zinc-300">Nenhum horário disponível nessa data.</div>
            )}

            {availableTimes.map(t => (
              <button
                key={t}
                onClick={() => book(t)}
                className="px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-950"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

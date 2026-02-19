// pages/AdminDashboard.tsx
import React, { useMemo, useState } from "react";
import {
  Block,
  Booking,
  formatMoneyBRL,
  getBlocks,
  getBookings,
  getCurrentUser,
  makeId,
  saveBlocks,
  saveBookings,
} from "@/lib/storage";

function isoFromDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function AdminDashboard() {
  const user = getCurrentUser();
  const [tab, setTab] = useState<"bookings" | "blocks" | "revenue">("bookings");
  const [msg, setMsg] = useState("");

  const bookings = useMemo(() => {
    return getBookings().sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, []);

  const blocks = useMemo(() => {
    return getBlocks().sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, []);

  const revenueCents = useMemo(() => {
    return getBookings()
      .filter(b => b.status === "active")
      .reduce((sum, b) => sum + b.priceCents, 0);
  }, []);

  function cancelBooking(id: string) {
    setMsg("");
    const list = getBookings();
    const b = list.find(x => x.id === id);
    if (!b) return;
    b.status = "canceled";
    b.canceledAt = new Date().toISOString();
    saveBookings(list);
    setMsg("✅ Agendamento cancelado (admin).");
  }

  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("19:00");
  const [reason, setReason] = useState("");

  function addBlock() {
    setMsg("");
    const startAt = isoFromDateTime(blockDate, startTime);
    const endAt = isoFromDateTime(blockDate, endTime);

    if (new Date(endAt).getTime() < new Date(startAt).getTime()) {
      setMsg("Fim não pode ser antes do início.");
      return;
    }

    const newBlock: Block = {
      id: makeId("bl"),
      startAt,
      endAt,
      reason: reason.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const list = getBlocks();
    list.push(newBlock);
    saveBlocks(list);
    setMsg("✅ Bloqueio criado.");
  }

  function removeBlock(id: string) {
    setMsg("");
    const list = getBlocks().filter(b => b.id !== id);
    saveBlocks(list);
    setMsg("✅ Bloqueio removido.");
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-zinc-300">Acesso negado. Faça login como admin.</p>
        <p className="text-zinc-300 mt-2">
          Admin padrão: <b>admin@zb.com</b> / <b>admin123</b>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Painel Admin</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-2 rounded-lg border border-zinc-800 ${tab === "bookings" ? "bg-zinc-900" : ""}`}
          onClick={() => setTab("bookings")}
        >
          Agendamentos
        </button>
        <button
          className={`px-3 py-2 rounded-lg border border-zinc-800 ${tab === "blocks" ? "bg-zinc-900" : ""}`}
          onClick={() => setTab("blocks")}
        >
          Bloqueios
        </button>
        <button
          className={`px-3 py-2 rounded-lg border border-zinc-800 ${tab === "revenue" ? "bg-zinc-900" : ""}`}
          onClick={() => setTab("revenue")}
        >
          Receita
        </button>
      </div>

      {msg && <div className="mb-3 text-sm text-zinc-200">{msg}</div>}

      {tab === "bookings" && (
        <div className="space-y-3">
          {bookings.length === 0 && <div className="text-zinc-300">Sem agendamentos.</div>}

          {bookings.map((b: Booking) => (
            <div key={b.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.serviceName}</div>
                <div className="text-zinc-300 text-sm">
                  {new Date(b.startsAt).toLocaleString("pt-BR")} • {formatMoneyBRL(b.priceCents)}
                </div>
                <div className="text-zinc-400 text-sm">
                  Cliente: {b.userName} ({b.userEmail})
                </div>
                <div className={`text-sm mt-1 ${b.status === "active" ? "text-green-400" : "text-red-400"}`}>
                  {b.status === "active" ? "Ativo" : "Cancelado"}
                </div>
              </div>

              {b.status === "active" && (
                <button
                  className="px-3 py-2 rounded-lg border border-zinc-800"
                  onClick={() => cancelBooking(b.id)}
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "blocks" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-semibold mb-3">Criar bloqueio</h2>

            <label className="text-sm text-zinc-300">Data</label>
            <input
              type="date"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="text-sm text-zinc-300">Início</label>
                <input
                  type="time"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300">Fim</label>
                <input
                  type="time"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <label className="text-sm text-zinc-300 mt-3 block">Motivo (opcional)</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Feriado / Manutenção"
            />

            <button
              onClick={addBlock}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-zinc-100 text-zinc-900 font-semibold"
            >
              Bloquear
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-semibold mb-3">Bloqueios atuais</h2>

            <div className="space-y-2">
              {blocks.length === 0 && <div className="text-zinc-300">Sem bloqueios.</div>}

              {blocks.map(bl => (
                <div key={bl.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between">
                  <div className="text-sm">
                    <div className="text-zinc-200">
                      {new Date(bl.startAt).toLocaleString("pt-BR")} → {new Date(bl.endAt).toLocaleString("pt-BR")}
                    </div>
                    {bl.reason && <div className="text-zinc-400">Motivo: {bl.reason}</div>}
                  </div>
                  <button className="px-3 py-2 rounded-lg border border-zinc-800" onClick={() => removeBlock(bl.id)}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "revenue" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="font-semibold mb-2">Receita (demo)</h2>
          <p className="text-zinc-300">
            Soma de agendamentos <b>ativos</b> (front-only).
          </p>
          <div className="text-3xl font-semibold mt-4">{formatMoneyBRL(revenueCents)}</div>
        </div>
      )}
    </div>
  );
}

// pages/MyBookings.tsx
import React, { useMemo, useState } from "react";
import { getBookings, getCurrentUser, saveBookings, formatMoneyBRL } from "@/lib/storage";

export default function MyBookings({ setPage }: { setPage: (p: string) => void }) {
  const user = getCurrentUser();
  const [msg, setMsg] = useState("");

  const my = useMemo(() => {
    if (!user) return [];
    return getBookings()
      .filter(b => b.userEmail === user.email)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [user]);

  function cancel(id: string) {
    setMsg("");
    const list = getBookings();
    const b = list.find(x => x.id === id);
    if (!b) return;
    if (!user || b.userEmail !== user.email) return;

    b.status = "canceled";
    b.canceledAt = new Date().toISOString();
    saveBookings(list);
    setMsg("✅ Agendamento cancelado.");
    setPage("my");
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">Meus agendamentos</h1>
        <p className="text-zinc-300 mb-4">Você precisa estar logado.</p>
        <button
          className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-900 font-semibold"
          onClick={() => setPage("login")}
        >
          Ir para login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Meus agendamentos</h1>
        <button
          className="px-3 py-2 rounded-lg border border-zinc-800"
          onClick={() => setPage("book")}
        >
          Novo agendamento
        </button>
      </div>

      {msg && <div className="mb-3 text-sm text-zinc-200">{msg}</div>}

      <div className="space-y-3">
        {my.length === 0 && <div className="text-zinc-300">Nenhum agendamento ainda.</div>}

        {my.map(b => (
          <div key={b.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{b.serviceName}</div>
              <div className="text-zinc-300 text-sm">
                {new Date(b.startsAt).toLocaleString("pt-BR")} • {formatMoneyBRL(b.priceCents)}
              </div>
              <div className={`text-sm mt-1 ${b.status === "active" ? "text-green-400" : "text-red-400"}`}>
                {b.status === "active" ? "Ativo" : "Cancelado"}
              </div>
            </div>

            {b.status === "active" && (
              <button
                className="px-3 py-2 rounded-lg border border-zinc-800"
                onClick={() => cancel(b.id)}
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

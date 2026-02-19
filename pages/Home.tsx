// pages/Home.tsx
import React from "react";
import { getServices, formatMoneyBRL } from "@/lib/storage";

export default function Home({ setPage }: { setPage: (p: string) => void }) {
  const services = getServices();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">Agendamento Online</h1>
      <p className="text-zinc-300 mb-8">Escolha um serviço e marque seu horário.</p>

      <div className="grid md:grid-cols-3 gap-4">
        {services.map(s => (
          <div key={s.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="text-xl font-semibold">{s.name}</h3>
            <p className="text-zinc-300 mt-1">{formatMoneyBRL(s.priceCents)}</p>
            <button
              onClick={() => setPage("book")}
              className="mt-4 px-3 py-2 rounded-lg bg-zinc-100 text-zinc-900 font-semibold w-full"
            >
              Agendar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

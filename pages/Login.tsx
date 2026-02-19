// pages/Login.tsx
import React, { useState } from "react";
import { getUsers, setCurrentUser } from "@/lib/storage";

export default function Login({ setPage }: { setPage: (p: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const user = getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return setMsg("Email não encontrado.");
    if (user.password !== password) return setMsg("Senha incorreta.");

    setCurrentUser(user);
    setPage("home");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Login</h1>
      <p className="text-zinc-300 mb-6">
        Admin padrão: <b>zara@zb.com</b> / <b>zara2016</b>
      </p>

      <form onSubmit={onLogin} className="space-y-3">
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {msg && <div className="text-red-400 text-sm">{msg}</div>}

        <button className="w-full px-3 py-2 rounded-lg bg-zinc-100 text-zinc-900 font-semibold">
          Entrar
        </button>

        <button
          type="button"
          onClick={() => setPage("register")}
          className="w-full px-3 py-2 rounded-lg border border-zinc-800"
        >
          Criar conta
        </button>
      </form>
    </div>
  );
}

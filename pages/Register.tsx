// pages/Register.tsx
import React, { useState } from "react";
import { getUsers, saveUsers, setCurrentUser } from "@/lib/storage";

export default function Register({ setPage }: { setPage: (p: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return setMsg("Digite seu nome.");
    if (!cleanEmail.includes("@")) return setMsg("Email inválido.");
    if (password.length < 4) return setMsg("Senha muito curta (mínimo 4).");

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return setMsg("Esse email já está cadastrado.");
    }

    const role = cleanEmail === "zara@zb.com" ? "admin" : "user";
    const user = {
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      createdAt: new Date().toISOString(),
    } as const;

    users.push(user);
    saveUsers(users);
    setCurrentUser(user);
    setPage("home");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Cadastro</h1>

      <form onSubmit={onRegister} className="space-y-3">
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          Criar conta
        </button>

        <button
          type="button"
          onClick={() => setPage("login")}
          className="w-full px-3 py-2 rounded-lg border border-zinc-800"
        >
          Já tenho conta
        </button>
      </form>
    </div>
  );
}

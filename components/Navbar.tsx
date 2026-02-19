// components/Navbar.tsx
import React from "react";
import { getCurrentUser, setCurrentUser } from "@/lib/storage";

type Props = {
  page: string;
  setPage: (p: string) => void;
};

export default function Navbar({ page, setPage }: Props) {
  const user = getCurrentUser();

  return (
    <div className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="font-semibold">
          ZB Barbearia
        </button>

        <div className="flex items-center gap-2 text-sm">
          <button
            className={`px-3 py-1 rounded-lg border border-zinc-800 ${page === "book" ? "bg-zinc-900" : ""}`}
            onClick={() => setPage("book")}
          >
            Agendar
          </button>

          <button
            className={`px-3 py-1 rounded-lg border border-zinc-800 ${page === "my" ? "bg-zinc-900" : ""}`}
            onClick={() => setPage("my")}
          >
            Meus agendamentos
          </button>

          {user?.role === "admin" && (
            <button
              className={`px-3 py-1 rounded-lg border border-zinc-800 ${page === "admin" ? "bg-zinc-900" : ""}`}
              onClick={() => setPage("admin")}
            >
              Admin
            </button>
          )}

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {!user ? (
            <>
              <button
                className={`px-3 py-1 rounded-lg border border-zinc-800 ${page === "login" ? "bg-zinc-900" : ""}`}
                onClick={() => setPage("login")}
              >
                Login
              </button>
              <button
                className={`px-3 py-1 rounded-lg border border-zinc-800 ${page === "register" ? "bg-zinc-900" : ""}`}
                onClick={() => setPage("register")}
              >
                Cadastro
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-zinc-300">
                {user.name} {user.role === "admin" ? "(admin)" : ""}
              </span>
              <button
                className="px-3 py-1 rounded-lg border border-zinc-800"
                onClick={() => {
                  setCurrentUser(null);
                  setPage("home");
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

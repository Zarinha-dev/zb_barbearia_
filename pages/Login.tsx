
import React, { useState } from 'react';
import { useAuth } from '../App';
import { db } from '../lib/database';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const role = email.toLowerCase() === "admin@zb.com" ? "admin" : "user";
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = db.getUsers().find(u => u.email === email);
    
    // Simple password check (mimicking bcrypt)
    if (user && user.passwordHash === password) {
      login(user);
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Acesse sua Conta</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-900/20"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-500">Ou</span></div>
          </div>
          
          <a 
            href="#/book"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-all text-center border border-zinc-700"
          >
            Continuar como Visitante
          </a>
        </div>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Não tem uma conta? <a href="#/register" className="text-amber-500 hover:underline">Cadastre-se agora</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

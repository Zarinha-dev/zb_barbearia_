
import React, { useState } from 'react';
import { db } from '../lib/database';
import { UserRole, User } from '../types';
import { useAuth } from '../App';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = db.getUsers();
    if (users.some(u => u.email === email)) {
      setError('Este e-mail já está em uso.');
      return;
    }

    // Role logic
    let role = UserRole.USER;
    if (adminKey && adminKey === 'seuzara2016') { // This is our ADMIN_SETUP_KEY
      role = UserRole.ADMIN;
    } else if (adminKey && adminKey !== 'seuzara2016') {
      setError('Chave de Administrador inválida.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      passwordHash: password, // In real world use bcrypt
      role,
      createdAt: new Date().toISOString()
    };

    db.setUsers([...users, newUser]);
    login(newUser);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Crie sua Conta</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nome Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
              placeholder="Ex: João Silva"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 tracking-wider">Acesso Administrativo (Opcional)</label>
            <input 
              type="password" 
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-all"
              placeholder="Chave de setup"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-900/20"
          >
            Cadastrar
          </button>
        </form>

        <div className="mt-6">
          <a 
            href="#/book"
            className="block w-full text-zinc-500 hover:text-amber-500 text-sm font-medium transition-all text-center"
          >
            Prefiro agendar como visitante sem cadastro
          </a>
        </div>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Já tem conta? <a href="#/login" className="text-amber-500 hover:underline">Entre aqui</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

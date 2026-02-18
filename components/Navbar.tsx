
import React from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { authState, logout } = useAuth();
  const { user } = authState;

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <a href="#/" className="flex items-center">
              <span className="text-amber-500 font-bold text-2xl mr-2">✂</span>
              <span className="text-xl font-bold tracking-tight text-white uppercase font-serif">ZB Barbearia</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#/" className="text-zinc-300 hover:text-amber-500 transition-colors">Início</a>
            <a href="#/book" className="text-zinc-300 hover:text-amber-500 transition-colors">Agendar</a>
            
            {user ? (
              <>
                <a href="#/appointments" className="text-zinc-300 hover:text-amber-500 transition-colors">Meus Horários</a>
                {user.role === UserRole.ADMIN && (
                  <a href="#/admin" className="px-3 py-1 bg-amber-600/20 text-amber-500 border border-amber-600/30 rounded-full text-sm font-semibold hover:bg-amber-600/30 transition-colors">
                    Admin Panel
                  </a>
                )}
                <button 
                  onClick={logout}
                  className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-all"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <a href="#/login" className="text-zinc-300 hover:text-amber-500 transition-colors">Entrar</a>
                <a href="#/register" className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/20">
                  Cadastrar
                </a>
              </div>
            )}
          </div>
          
          <div className="md:hidden">
             <button className="text-zinc-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

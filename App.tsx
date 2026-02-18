
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole, AuthState } from './types';
import { db } from './lib/database';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAppointments from './pages/MyAppointments';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';

interface AuthContextType {
  authState: AuthState;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth_session');
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const login = (user: User) => {
    const newState = { user, token: 'fake-jwt-token' };
    setAuthState(newState);
    localStorage.setItem('auth_session', JSON.stringify(newState));
    window.location.hash = '#/';
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem('auth_session');
    window.location.hash = '#/login';
  };

  const renderPage = () => {
    switch (currentPath) {
      case '#/': return <Home />;
      case '#/login': return <Login />;
      case '#/register': return <Register />;
      case '#/appointments': 
        return authState.user ? <MyAppointments /> : <Login />;
      case '#/book': 
        return <BookAppointment />; // Allow guest booking
      case '#/admin': 
        return authState.user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Home />;
      default: return <Home />;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <footer className="bg-zinc-900 border-t border-zinc-800 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold font-serif mb-2 text-white">ZB BARBEARIA</h2>
              <p className="text-zinc-500 text-sm">Estilo e tradição desde sempre.</p>
            </div>
            <div className="flex gap-6">
               <a href="https://www.instagram.com/zbbarbearia/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Instagram
               </a>
               <a href="tel:+351933174649" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Contato: 933 174 649
               </a>
            </div>
            <p className="text-zinc-500 text-sm">© 2024 ZB Barbearia. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  );
};

export default App;

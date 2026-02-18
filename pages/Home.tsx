
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 grayscale"
            alt="ZB Barbearia Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            ZB <span className="text-amber-500">BARBEARIA</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Excelência em cada corte. Onde a tradição encontra o estilo moderno. Agende sua visita e transforme seu visual.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#/book" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl shadow-amber-900/40">
              Agendar Agora
            </a>
            <div className="flex gap-4">
               <a href="https://www.instagram.com/zbbarbearia/" target="_blank" rel="noopener noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl transition-all border border-zinc-700 flex items-center justify-center" title="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
               </a>
               <a href="tel:+351933174649" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl font-bold transition-all border border-zinc-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  933 174 649
               </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nossos Serviços</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Corte Social', price: 'R$ 45,00', desc: 'Cortes clássicos e modernos com acabamento impecável.', icon: '💇‍♂️' },
              { name: 'Barba Terapia', price: 'R$ 35,00', desc: 'Cuidado completo para sua barba com toalha quente.', icon: '🧔' },
              { name: 'Combo ZB', price: 'R$ 70,00', desc: 'A experiência completa ZB Barbearia para o seu estilo.', icon: '🏆' },
            ].map((s, idx) => (
              <div key={idx} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all group">
                <div className="text-4xl mb-6">{s.icon}</div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-500 transition-colors">{s.name}</h3>
                <p className="text-zinc-400 mb-6">{s.desc}</p>
                <div className="text-amber-500 font-bold text-xl">{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

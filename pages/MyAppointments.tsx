
import React, { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../App';
import { formatDateTime, formatCurrency } from '../utils';

const MyAppointments: React.FC = () => {
  const { authState } = useAuth();
  const [appointments, setAppointments] = useState<Booking[]>([]);

  useEffect(() => {
    if (authState.user) {
      const userBookings = db.getBookings()
        .filter(b => b.userId === authState.user?.id)
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
      setAppointments(userBookings);
    }
  }, [authState.user]);

  const handleCancel = (id: string) => {
    const confirm = window.confirm('Deseja realmente cancelar este agendamento?');
    if (!confirm) return;

    const allBookings = db.getBookings();
    const updated = allBookings.map(b => {
      if (b.id === id) {
        return { ...b, status: BookingStatus.CANCELED, canceledAt: new Date().toISOString() };
      }
      return b;
    });

    db.setBookings(updated);
    setAppointments(updated.filter(b => b.userId === authState.user?.id)
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Meus Horários</h1>
        <a href="#/book" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
          Agendar Novo
        </a>
      </div>

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map(app => {
            const isPast = new Date(app.startsAt) < new Date();
            const isActive = app.status === BookingStatus.ACTIVE;

            return (
              <div key={app.id} className={`bg-zinc-900 p-6 rounded-2xl border ${
                app.status === BookingStatus.CANCELED ? 'border-zinc-800 opacity-60' : 'border-zinc-800'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{app.serviceName}</h3>
                    <p className="text-amber-500 font-medium">{formatDateTime(app.startsAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === BookingStatus.ACTIVE ? 'bg-amber-500/20 text-amber-500' :
                    app.status === BookingStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-500' :
                    'bg-zinc-700 text-zinc-400'
                  }`}>
                    {app.status === BookingStatus.ACTIVE ? 'Ativo' :
                     app.status === BookingStatus.COMPLETED ? 'Concluído' : 'Cancelado'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                  <span className="text-zinc-400">{formatCurrency(app.priceCents)}</span>
                  {isActive && !isPast && (
                    <button 
                      onClick={() => handleCancel(app.id)}
                      className="text-red-500 text-sm font-bold hover:underline"
                    >
                      Cancelar Agendamento
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900 p-12 text-center rounded-3xl border border-zinc-800 border-dashed">
          <p className="text-zinc-500 text-lg mb-6">Você ainda não possui agendamentos.</p>
          <a href="#/book" className="text-amber-500 font-bold border-b border-amber-500 pb-1">Vamos mudar isso?</a>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;

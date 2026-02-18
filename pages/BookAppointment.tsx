
import React, { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Service, Booking, BookingStatus } from '../types';
import { useAuth } from '../App';
import { getSlotsForDay, formatDateTime, formatCurrency } from '../utils';

const BookAppointment: React.FC = () => {
  const { authState } = useAuth();
  const [services] = useState<Service[]>(db.getServices());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Guest fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedDate) return;

    const allSlots = getSlotsForDay(new Date(selectedDate));
    const bookings = db.getBookings().filter(b => b.status !== BookingStatus.CANCELED);
    const blocks = db.getBlocks();

    const filtered = allSlots.filter(slotIso => {
      const slotDate = new Date(slotIso);
      
      // 1. Check if past
      if (slotDate < new Date()) return false;

      // 2. Check if already booked
      const isBooked = bookings.some(b => b.startsAt === slotIso);
      if (isBooked) return false;

      // 3. Check if blocked by admin
      const isBlocked = blocks.some(block => {
        const start = new Date(block.startAt);
        const end = new Date(block.endAt);
        return slotDate >= start && slotDate < end;
      });
      if (isBlocked) return false;

      return true;
    });

    setAvailableSlots(filtered);
    setSelectedSlot(null);
  }, [selectedDate]);

  const handleBooking = () => {
    if (!selectedService || !selectedSlot) return;
    setError('');

    // If not logged in, name and phone are mandatory
    if (!authState.user && (!guestName || !guestPhone)) {
      setError('Por favor, informe seu nome e telefone para confirmar.');
      return;
    }

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: authState.user?.id,
      guestName: authState.user ? undefined : guestName,
      guestPhone: authState.user ? undefined : guestPhone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      startsAt: selectedSlot,
      status: BookingStatus.ACTIVE,
      priceCents: selectedService.priceCents,
      createdAt: new Date().toISOString()
    };

    const currentBookings = db.getBookings();
    db.setBookings([...currentBookings, newBooking]);
    setSuccess(true);
    
    setTimeout(() => {
      window.location.hash = authState.user ? '#/appointments' : '#/';
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-12 bg-zinc-900 border border-emerald-500/30 rounded-3xl">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-white mb-4">Agendamento Realizado!</h2>
          <p className="text-zinc-400">Obrigado pela preferência. Te esperamos em breve!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Novo Agendamento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Step 1 & 2: Service & Date */}
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-semibold flex items-center text-amber-500 mb-6">
              <span className="bg-amber-500 text-zinc-950 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
              Escolha o Serviço
            </h2>
            <div className="space-y-3">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedService?.id === s.id 
                      ? 'border-amber-500 bg-amber-500/10 text-white' 
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{s.name}</span>
                    <span className="text-amber-500">{formatCurrency(s.priceCents)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold flex items-center text-amber-500 mb-6">
              <span className="bg-amber-500 text-zinc-950 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
              Escolha a Data
            </h2>
            <input 
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Step 3: Slots & Confirm */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold flex items-center text-amber-500">
            <span className="bg-amber-500 text-zinc-950 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
            Escolha o Horário
          </h2>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 text-sm rounded-lg border transition-all ${
                    selectedSlot === slot 
                      ? 'border-amber-500 bg-amber-500 text-zinc-950 font-bold' 
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-amber-500/50'
                  }`}
                >
                  {new Date(slot).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 italic">
              Nenhum horário disponível para esta data.
            </div>
          )}

          {/* Guest Form if not logged in */}
          {!authState.user && selectedSlot && (
            <div className="pt-6 border-t border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <h2 className="text-lg font-semibold text-white">Identifique-se</h2>
              <div className="grid grid-cols-1 gap-4">
                <input 
                  type="text" 
                  placeholder="Seu Nome"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                />
                <input 
                  type="tel" 
                  placeholder="WhatsApp / Telefone"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="pt-8 border-t border-zinc-800">
             <div className="bg-zinc-900/50 p-6 rounded-2xl mb-6">
                <p className="text-sm text-zinc-500 mb-1">Resumo:</p>
                {selectedService && selectedSlot ? (
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white">{selectedService.name}</p>
                    <p className="text-amber-500">{formatDateTime(selectedSlot)}</p>
                    <p className="text-zinc-400 font-medium">{formatCurrency(selectedService.priceCents)}</p>
                  </div>
                ) : (
                  <p className="text-zinc-600 italic">Selecione serviço e horário.</p>
                )}
             </div>
             <button
               disabled={!selectedService || !selectedSlot}
               onClick={handleBooking}
               className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                 selectedService && selectedSlot 
                   ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20' 
                   : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
               }`}
             >
               Confirmar Agendamento
             </button>
             {!authState.user && (
               <p className="mt-4 text-center text-xs text-zinc-500">
                 Ou <a href="#/login" className="text-amber-500 hover:underline">entre na sua conta</a> para gerenciar seus horários.
               </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

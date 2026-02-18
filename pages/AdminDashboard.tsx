
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/database';
import { Booking, BookingStatus, Block, Service } from '../types';
import { formatDateTime, formatCurrency } from '../utils';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'blocks' | 'revenue'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>(db.getBookings());
  const [blocks, setBlocks] = useState<Block[]>(db.getBlocks());
  
  // States for block creation
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesDate = filterDate ? b.startsAt.startsWith(filterDate) : true;
      const matchesStatus = filterStatus === 'all' ? true : b.status === filterStatus;
      return matchesDate && matchesStatus;
    }).sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  }, [bookings, filterDate, filterStatus]);

  const revenueStats = useMemo(() => {
    const validBookings = bookings.filter(b => b.status === BookingStatus.ACTIVE || b.status === BookingStatus.COMPLETED);
    const now = new Date();
    
    const todayStr = now.toISOString().split('T')[0];
    const daily = validBookings
      .filter(b => b.startsAt.startsWith(todayStr))
      .reduce((sum, b) => sum + b.priceCents, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const weekly = validBookings
      .filter(b => new Date(b.startsAt) >= sevenDaysAgo)
      .reduce((sum, b) => sum + b.priceCents, 0);

    const monthStr = now.toISOString().substring(0, 7);
    const monthly = validBookings
      .filter(b => b.startsAt.startsWith(monthStr))
      .reduce((sum, b) => sum + b.priceCents, 0);

    const total = validBookings.reduce((sum, b) => sum + b.priceCents, 0);

    return { daily, weekly, monthly, total };
  }, [bookings]);

  const handleCancelBooking = (id: string) => {
    if (!window.confirm('Confirmar cancelamento administrativo?')) return;
    const all = db.getBookings();
    const updated = all.map(b => b.id === id ? { ...b, status: BookingStatus.CANCELED, canceledAt: new Date().toISOString() } : b);
    db.setBookings(updated);
    setBookings(updated);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStart || !blockEnd || !blockReason) return;

    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      startAt: new Date(blockStart).toISOString(),
      endAt: new Date(blockEnd).toISOString(),
      reason: blockReason,
      createdAt: new Date().toISOString()
    };

    const updated = [...blocks, newBlock];
    db.setBlocks(updated);
    setBlocks(updated);
    setBlockStart('');
    setBlockEnd('');
    setBlockReason('');
  };

  const handleRemoveBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    db.setBlocks(updated);
    setBlocks(updated);
  };

  const getClientDisplay = (b: Booking) => {
    if (b.userId) {
      const user = db.getUsers().find(u => u.id === b.userId);
      return user?.name || 'Usuário Removido';
    }
    return (
      <span className="flex flex-col">
        <span className="font-bold text-amber-500 italic">Visitante: {b.guestName}</span>
        <span className="text-xs text-zinc-500">{b.guestPhone}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <h1 className="text-4xl font-bold">Painel Administrativo</h1>
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {(['bookings', 'blocks', 'revenue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-amber-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'bookings' ? 'Agendamentos' : tab === 'blocks' ? 'Bloqueios' : 'Receita'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs text-zinc-500 uppercase font-bold mb-1">Filtrar por Data</label>
               <input 
                type="date" 
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white"
               />
             </div>
             <div className="flex-1 min-w-[200px]">
               <label className="block text-xs text-zinc-500 uppercase font-bold mb-1">Status</label>
               <select 
                 value={filterStatus}
                 onChange={e => setFilterStatus(e.target.value)}
                 className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white"
               >
                 <option value="all">Todos</option>
                 <option value={BookingStatus.ACTIVE}>Ativos</option>
                 <option value={BookingStatus.COMPLETED}>Concluídos</option>
                 <option value={BookingStatus.CANCELED}>Cancelados</option>
               </select>
             </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left bg-zinc-900 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-4">Cliente / Serviço</th>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4">
                      <div className="text-zinc-200">{getClientDisplay(b)}</div>
                      <div className="text-sm text-zinc-500">{b.serviceName}</div>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono text-sm">{formatDateTime(b.startsAt)}</td>
                    <td className="p-4 text-zinc-300">{formatCurrency(b.priceCents)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        b.status === BookingStatus.ACTIVE ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        b.status === BookingStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {b.status === BookingStatus.ACTIVE && (
                        <button onClick={() => handleCancelBooking(b.id)} className="text-red-500 text-xs font-bold hover:bg-red-500/10 px-2 py-1 rounded transition-colors">
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 h-fit sticky top-24">
            <h3 className="text-xl font-bold mb-6 text-white">Bloquear Horário</h3>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 font-bold mb-1">Início</label>
                <input type="datetime-local" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-bold mb-1">Fim</label>
                <input type="datetime-local" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 font-bold mb-1">Motivo</label>
                <input type="text" placeholder="Manutenção, feriado, etc" value={blockReason} onChange={e => setBlockReason(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white" required />
              </div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all">
                Adicionar Bloqueio
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold mb-6 text-white">Bloqueios Ativos</h3>
            {blocks.length > 0 ? blocks.map(block => (
              <div key={block.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-zinc-200">{block.reason}</p>
                  <p className="text-sm text-zinc-500">
                    {formatDateTime(block.startAt)} — {formatDateTime(block.endAt)}
                  </p>
                </div>
                <button onClick={() => handleRemoveBlock(block.id)} className="text-zinc-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )) : (
              <p className="text-zinc-600 italic">Nenhum bloqueio cadastrado.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Hoje', val: revenueStats.daily },
              { label: '7 Dias', val: revenueStats.weekly },
              { label: 'Este Mês', val: revenueStats.monthly },
              { label: 'Total Acumulado', val: revenueStats.total },
            ].map(stat => (
              <div key={stat.label} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-amber-500">{formatCurrency(stat.val)}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-zinc-900/40 p-10 rounded-3xl border border-zinc-800 text-center">
             <h3 className="text-2xl font-bold mb-4 text-white">Critério de Receita</h3>
             <p className="text-zinc-400 max-w-2xl mx-auto">
               A receita bruta é calculada somando os valores de todos os agendamentos com status <strong>"Ativo"</strong> ou <strong>"Concluído"</strong>. Agendamentos cancelados não são contabilizados.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

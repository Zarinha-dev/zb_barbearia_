
export const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
};

export const formatDateTime = (iso: string) => {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getSlotsForDay = (date: Date) => {
  const slots: string[] = [];
  const start = 9; // 09:00
  const end = 19; // 19:00

  for (let hour = start; hour < end; hour++) {
    // 00 slot
    const d1 = new Date(date);
    d1.setHours(hour, 0, 0, 0);
    slots.push(d1.toISOString());

    // 30 slot
    const d2 = new Date(date);
    d2.setHours(hour, 30, 0, 0);
    slots.push(d2.toISOString());
  }

  return slots;
};

export const isWithinInterval = (check: Date, start: Date, end: Date) => {
  return check >= start && check <= end;
};

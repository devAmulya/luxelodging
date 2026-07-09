import { useState } from 'react';

const BookedCalendar = ({ bookedDates }) => {
  const bookedSet = new Set(bookedDates.map(d => new Date(d).toDateString()));
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="border border-border rounded-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonthOffset(monthOffset - 1)}
          disabled={monthOffset === 0}
          className="text-muted disabled:opacity-30 font-mono px-2"
        >
          ‹
        </button>
        <span className="font-sans text-sm font-medium text-ink">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setMonthOffset(monthOffset + 1)}
          className="text-muted font-mono px-2"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-xs font-mono text-muted">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={i}></span>;
          const dateObj = new Date(year, month, day);
          const isBooked = bookedSet.has(dateObj.toDateString());
          const isPast = dateObj < new Date(today.toDateString());
          return (
            <span
              key={i}
              className={`text-xs font-mono py-1.5 rounded ${
                isPast ? 'text-muted/40' :
                isBooked ? 'bg-error/10 text-error line-through' : 'text-ink'
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs font-sans text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-error/10 inline-block"></span> Booked
        </span>
      </div>
    </div>
  );
};

export default BookedCalendar;
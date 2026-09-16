import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (date: string) => void;
  label?: string;
}

export const DatePicker = ({ value, onChange, label }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view year & month from current value or today
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-indexed

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
  };

  const setPreset = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
    setViewYear(y);
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  // Format display text
  const formatDisplay = (isoDate: string) => {
    if (!isoDate) return 'Set due date';
    const [y, m, d] = isoDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg border transition-all ${
          value
            ? 'bg-zinc-50 dark:bg-[#18181b] border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
            : 'bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
        } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDisplay(value)}
        </span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="hover:text-red-500 p-0.5 rounded cursor-pointer"
            title="Clear due date"
          >
            ✕
          </span>
        )}
      </button>

      {/* Themed Dropdown Calendar Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 p-3 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-modal-pop"
        >
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPreset(0)}
              className="px-2 py-1 text-[10px] font-mono font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPreset(1)}
              className="px-2 py-1 text-[10px] font-mono font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setPreset(7)}
              className="px-2 py-1 text-[10px] font-mono font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              +1 Week
            </button>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((d) => (
              <span key={d} className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 font-semibold">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty prefix cells for month start */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const curDayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === curDayStr;
              const isToday = todayStr === curDayStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 text-xs font-mono rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-500 text-white font-bold shadow-sm'
                      : isToday
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

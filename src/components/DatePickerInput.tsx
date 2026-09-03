import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const MONTH_NAMES_ID = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

const MONTH_NAMES_TITLE = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_ID = [
  'MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'
];

export function formatDateToIndonesian(date: Date): string {
  const dayName = DAY_NAMES_ID[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTH_NAMES_ID[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

export function parseIndonesianDate(str: string): Date {
  if (!str) return new Date();
  
  const uppercaseStr = str.toUpperCase().trim();
  const parts = uppercaseStr.split(/\s+/);
  
  let dayNum: number | null = null;
  let monthIndex: number | null = null;
  let yearNum: number | null = null;

  for (const part of parts) {
    if (/^\d{4}$/.test(part)) {
      yearNum = parseInt(part, 10);
    } else if (/^\d{1,2}$/.test(part)) {
      dayNum = parseInt(part, 10);
    } else {
      const idx = MONTH_NAMES_ID.findIndex(m => m.startsWith(part) || part.startsWith(m));
      if (idx !== -1) {
        monthIndex = idx;
      }
    }
  }

  const now = new Date();
  const finalYear = yearNum ?? now.getFullYear();
  const finalMonth = monthIndex ?? now.getMonth();
  const finalDay = dayNum ?? now.getDate();

  const d = new Date(finalYear, finalMonth, finalDay);
  return isNaN(d.getTime()) ? now : d;
}

interface DatePickerInputProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function DatePickerInput({
  value,
  onChange,
  label = 'TANGGAL',
  required = false,
  className = '',
  placeholder = 'PILIH TANGGAL'
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsed selected date
  const selectedDate = parseIndonesianDate(value);
  
  // Viewing month state for calendar navigation
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());

  // Keep view in sync when value changes from outside
  useEffect(() => {
    const d = parseIndonesianDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Month Navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Build calendar matrix (42 cells: 6 rows of 7 days)
  const calendarCells = React.useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dayNum: number;
      isCurrentMonth: boolean;
      dateObj: Date;
    }> = [];

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      cells.push({
        dayNum,
        isCurrentMonth: false,
        dateObj: new Date(prevMonthYear, prevMonth, dayNum)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: true,
        dateObj: new Date(viewYear, viewMonth, i)
      });
    }

    // Next month filler days (to make total cells multiple of 7, up to 35 or 42)
    const totalSoFar = cells.length;
    const remaining = (totalSoFar % 7 === 0) ? 0 : 7 - (totalSoFar % 7);
    for (let i = 1; i <= remaining; i++) {
      const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateObj: new Date(nextMonthYear, nextMonth, i)
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handleSelectDate = (dateObj: Date) => {
    const formatted = formatDateToIndonesian(dateObj);
    onChange(formatted);
    setIsOpen(false);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input box styled exactly like Image 1 */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 cursor-pointer hover:bg-white dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-2xs"
      >
        <input
          type="text"
          readOnly
          value={value || placeholder}
          placeholder={placeholder}
          className="w-full bg-transparent font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm uppercase tracking-wide cursor-pointer focus:outline-none"
        />
        <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
      </div>

      {/* Calendar Popover styled exactly like Image 2 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)] p-4 w-72 text-xs"
          >
            {/* Header: Month Year + Arrows */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                {MONTH_NAMES_TITLE[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day Initials Row (S M T W T F S) */}
            <div className="grid grid-cols-7 text-center font-medium text-slate-400 dark:text-slate-500 text-[11px] mb-2">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {calendarCells.map((cell, idx) => {
                const isSelected = isSameDay(cell.dateObj, selectedDate);
                const isToday = isSameDay(cell.dateObj, new Date());

                return (
                  <div key={idx} className="flex items-center justify-center py-0.5">
                    <button
                      type="button"
                      onClick={() => handleSelectDate(cell.dateObj)}
                      className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : cell.isCurrentMonth
                            ? isToday
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {cell.dayNum}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Footer */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectDate(new Date())}
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount, MenuId } from '../types';
import { getAvailableMonthsList, getMonthStatusInfo } from '../utils/monthUtils';
import { useTheme } from '../context/ThemeContext';
import { 
  FileSpreadsheet, 
  ChevronDown, 
  SlidersHorizontal,
  Menu as MenuIcon,
  X,
  Calendar,
  LogOut,
  CheckCircle2,
  Check,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenGSheetModal: () => void;
  onTriggerManualSync?: () => void;
  isSyncingSheet?: boolean;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  syncStatus?: 'connected' | 'disconnected' | 'syncing' | 'error';
  onNavigateMenu?: (menu: MenuId) => void;
  activeMenuTitle?: string;
}



export function Navbar({
  currentUser,
  onLogout,
  onOpenGSheetModal,
  onTriggerManualSync,
  isSyncingSheet = false,
  selectedMonth,
  onSelectMonth,
  onToggleSidebar,
  isSidebarOpen,
  syncStatus = 'connected',
  onNavigateMenu,
  activeMenuTitle = 'MONITORING GANTI METER'
}: NavbarProps) {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const availableMonths = useMemo(() => getAvailableMonthsList(), []);

  // Resolve current active month display
  const currentMonthItem = useMemo(() => {
    const found = availableMonths.find(m => m.id.toUpperCase() === selectedMonth.toUpperCase());
    if (found) return found;

    const info = getMonthStatusInfo(selectedMonth, '2026');
    return {
      id: selectedMonth,
      label: selectedMonth.toUpperCase(),
      year: '2026',
      status: info.status,
      statusColor: info.statusColor,
      description: info.description
    };
  }, [selectedMonth, availableMonths]);

  return (
    <header className="sticky top-2.5 sm:top-3.5 z-40 mx-3 sm:mx-5 lg:mx-6 mt-2.5 sm:mt-3.5 mb-1 px-3 sm:px-5 lg:px-6 h-14 sm:h-16 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/80 dark:border-slate-800/90 shadow-[0_12px_36px_-10px_rgba(0,50,110,0.14)] dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between transition-colors duration-200">
      {/* Background Subtle Gradient & Light Silhouette */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/[0.04] via-blue-500/[0.02] to-amber-500/[0.03] dark:from-sky-500/[0.02] dark:via-blue-500/[0.01] dark:to-amber-500/[0.01] pointer-events-none" />

      {/* Left: Mobile Toggle & Floating Breadcrumb / Page Title */}
      <div className="relative flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleSidebar}
          className="p-2 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl lg:hidden cursor-pointer transition-colors shadow-2xs"
          title="Toggle Menu"
        >
          {isSidebarOpen ? <X className="w-4.5 h-4.5" /> : <MenuIcon className="w-4.5 h-4.5" />}
        </motion.button>

        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="hidden sm:inline-flex w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.6)] shrink-0"></span>
            <div className="overflow-hidden min-w-0">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeMenuTitle}
                  initial={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight uppercase text-xs sm:text-sm truncate drop-shadow-2xs"
                >
                  {activeMenuTitle}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>

          <span className="text-slate-300 dark:text-slate-700 font-light select-none">/</span>

          {/* Custom Smooth Month Selector Capsule & Dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <motion.button 
              id="btn-select-month-dropdown"
              type="button"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              whileHover={{ scale: 1.03, y: -0.5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-extrabold tracking-tight cursor-pointer transition-all shadow-xs
                ${showMonthDropdown 
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 shadow-md ring-2 ring-blue-400/20' 
                  : 'bg-gradient-to-r from-slate-50 to-sky-50/80 dark:from-slate-800 dark:to-slate-800/80 hover:from-white hover:to-sky-100/90 dark:hover:from-slate-750 dark:hover:to-slate-700 border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-600'}
              `}
              title="Pilih Periode Bulan"
            >
              <div className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Calendar className="w-3 h-3" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {currentMonthItem.label} {currentMonthItem.year}
              </span>
              <motion.div
                animate={{ rotate: showMonthDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400 dark:text-slate-500 -mr-0.5"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>

            {/* Animated Smooth Month Dropdown */}
            <AnimatePresence>
              {showMonthDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute left-0 mt-2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_16px_40px_-10px_rgba(0,50,110,0.22)] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-slate-700/90 p-1.5 z-50 overflow-hidden"
                >
                  {/* Dropdown Header */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      Pilih Periode Data
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-mono">
                      Tahun 2026
                    </span>
                  </div>

                  {/* Month Options List */}
                  <div className="py-1 space-y-1">
                    {availableMonths.map((item) => {
                      const isSelected = selectedMonth.toUpperCase() === item.id.toUpperCase();
                      return (
                        <motion.button
                          key={item.id}
                          id={`option-month-${item.id}`}
                          type="button"
                          onClick={() => {
                            onSelectMonth(item.id);
                            setShowMonthDropdown(false);
                          }}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all
                            ${isSelected 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 hover:text-blue-700 dark:hover:text-blue-300'}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              <Calendar className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                                {item.label} {item.year}
                              </p>
                              <p className={`text-[10px] font-medium truncate ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'}`}>
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              isSelected 
                                ? 'bg-white/25 text-white border-white/30' 
                                : item.statusColor
                            }`}>
                              {item.status}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right: Theme Switcher, Live Sync & User Status Pills */}
      <div className="relative flex items-center space-x-2 sm:space-x-3 lg:space-x-3.5 shrink-0">
        {/* THEME TOGGLE BUTTON (Default vs Gelap) */}
        <motion.button
          id="btn-toggle-theme"
          type="button"
          onClick={toggleTheme}
          whileHover={{ scale: 1.04, y: -0.5 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`
            flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer select-none
            ${isDark 
              ? 'bg-slate-800/95 hover:bg-slate-750 border-amber-500/40 text-amber-300 hover:border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
              : 'bg-gradient-to-r from-amber-50/90 to-yellow-50/90 hover:from-amber-100 hover:to-yellow-100 border-amber-200/90 text-amber-900'}
          `}
          title={isDark ? 'Tema Aktif: Mode Gelap. Klik untuk ganti ke Mode Default (Terang)' : 'Tema Aktif: Mode Default (Terang). Klik untuk ganti ke Mode Gelap'}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ${isDark ? 'bg-amber-400/15 text-amber-300 rotate-12' : 'bg-amber-100 text-amber-600 rotate-0'}`}>
            {isDark ? <Moon className="w-3.5 h-3.5 fill-amber-300" /> : <Sun className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />}
          </div>
          <span className="hidden sm:inline text-[11px] font-extrabold tracking-tight">
            {isDark ? 'Mode Gelap' : 'Default'}
          </span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase hidden md:inline-block ${isDark ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-amber-200/60 text-amber-800'}`}>
            {isDark ? 'DARK' : 'LIGHT'}
          </span>
        </motion.button>

        {/* Google Sheet Direct Auto-Sync Button (Floating Pill) */}
        <motion.button
          id="btn-open-gsheet-modal"
          type="button"
          onClick={() => {
            if (onTriggerManualSync) {
              onTriggerManualSync();
            } else {
              onOpenGSheetModal();
            }
          }}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/40 border border-emerald-200/90 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer group"
          title="Klik untuk Sinkronisasi Langsung Data Google Sheet"
        >
          <FileSpreadsheet className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0 ${isSyncingSheet ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
            {isSyncingSheet ? 'Memuat Data...' : 'Sheet:'}
          </span>
          <span className="bg-emerald-600 dark:bg-emerald-500 text-white text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-200 inline-block ${isSyncingSheet ? 'animate-spin' : 'animate-ping'}`}></span>
            {isSyncingSheet ? 'SYNC' : 'AUTO-LIVE'}
          </span>
        </motion.button>

        {/* User Info & Online Status Floating Island */}
        <div className="relative" ref={userDropdownRef}>
          <motion.button
            id="btn-user-profile"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 text-left p-1 sm:pr-2 rounded-xl hover:bg-slate-100/90 dark:hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                {currentUser?.nama || 'Fiki Ilham (JTC TE)'}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                <span>Online (JTC)</span>
              </p>
            </div>
            
            <div className="relative">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#005ea2] via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 flex items-center justify-center font-black text-xs shrink-0 ring-2 ring-blue-100 dark:ring-blue-900/50 border border-white dark:border-slate-700">
                {getInitials(currentUser?.nama || 'Fiki Ilham')}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
          </motion.button>

          {/* Dropdown Menu with Glassmorphism & Animations */}
          <AnimatePresence>
            {showUserDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute right-0 mt-2.5 w-68 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/90 py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs truncate">{currentUser?.nama || 'FIKI ILHAM'}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-400 font-mono truncate">{currentUser?.email || 'jtc.baguala@pln.co.id'}</div>
                  <div className="mt-1.5 text-[9px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full inline-block">
                    {currentUser?.jabatan || 'JTC Transaksi Energi'}
                  </div>
                </div>

                {/* Theme Selector Section inside Dropdown */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-amber-500" />
                    Pilih Tema Dashboard
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTheme('default')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        !isDark 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isDark 
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Gelap</span>
                    </button>
                  </div>
                </div>

                <div className="py-1.5 px-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      if (onNavigateMenu) onNavigateMenu('management_user');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-slate-800/80 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span>Management User & Akses</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateMenu) onNavigateMenu('monitoring');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Monitoring Ganti Meter</span>
                  </button>
                </div>

                <div className="pt-1.5 px-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="btn-logout"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

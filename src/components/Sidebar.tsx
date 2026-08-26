import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart2,
  LayoutGrid, 
  PlusCircle, 
  TrendingUp, 
  FileText, 
  Users, 
  LogOut,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react';
import { MeterRecord, MenuId, UserRole } from '../types';

interface SidebarProps {
  activeMenu: MenuId;
  onSelectMenu: (menu: MenuId) => void;
  records: MeterRecord[];
  userRole?: UserRole;
  userName?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  activeMenu,
  onSelectMenu,
  records,
  userRole,
  userName = 'FIKI ILHAM (JTC TE)',
  isMobileOpen,
  onCloseMobile,
  onLogout
}: SidebarProps) {
  const totalCount = records.length;
  const selesaiCount = records.filter(r => r.status === 'SELESAI').length;
  const sisaCount = totalCount - selesaiCount;
  const percentSelesai = totalCount > 0 ? Math.round((selesaiCount / totalCount) * 100) : 0;

  const navMenuItems: Array<{
    id: MenuId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeStyle?: 'amber' | 'blue' | 'count';
  }> = [
    {
      id: 'monitoring',
      label: 'Monitoring Ganti Meter',
      icon: <BarChart2 className="w-5 h-5" />,
      badge: `${selesaiCount}/${totalCount}`,
      badgeStyle: 'count'
    },
    {
      id: 'rekap',
      label: 'Rekap Ganti Meter',
      icon: <LayoutGrid className="w-5 h-5" />,
      badge: `${totalCount}`,
      badgeStyle: 'count'
    },
    {
      id: 'input',
      label: 'Input Data Meter',
      icon: <PlusCircle className="w-5 h-5" />,
      badge: '+ Baru',
      badgeStyle: 'amber'
    },
    {
      id: 'informasi',
      label: 'Informasi & Analisa',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'Analisa',
      badgeStyle: 'blue'
    },
    {
      id: 'dokumen',
      label: 'Cetak Dokumen',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Print',
      badgeStyle: 'blue'
    },
    {
      id: 'management_user',
      label: 'Management User',
      icon: <Users className="w-5 h-5" />,
      badge: 'Admin',
      badgeStyle: 'blue'
    }
  ];

  const handleMenuClick = (id: MenuId) => {
    onSelectMenu(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Floating Sidebar Wrapper */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 lg:top-3.5 lg:bottom-3.5 left-0 z-50
        w-72 lg:w-72 lg:h-[calc(100vh-1.75rem)] lg:my-3.5 lg:ml-3.5
        bg-gradient-to-b from-[#0062a8] via-[#004e8a] to-[#003666]
        text-white flex flex-col justify-between
        rounded-none lg:rounded-3xl
        shadow-[0_20px_60px_-15px_rgba(0,55,120,0.5)]
        border-r lg:border border-white/20
        select-none overflow-hidden backdrop-blur-md
        transition-all duration-300 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Background Visual Silhouettes & Ambient Glow Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top Radial Ambient Glow */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-sky-300/20 rounded-full blur-3xl" />
          
          {/* Bottom Ambient Glow */}
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
          
          {/* Subtle Electric Circuit / Power Silhouette Graphic */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-6 mix-blend-overlay stroke-white fill-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 700"
          >
            <path d="M-20,100 Q80,180 150,120 T320,160" strokeWidth="2" />
            <path d="M-30,280 Q100,340 180,260 T340,320" strokeWidth="1.5" />
            <path d="M-10,460 Q90,520 200,430 T330,500" strokeWidth="2" />
            <circle cx="150" cy="120" r="4" fill="white" />
            <circle cx="180" cy="260" r="3" fill="white" />
            <circle cx="200" cy="430" r="4" fill="white" />
            <path d="M150,120 L150,180 L220,180" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M180,260 L180,310 L120,310" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Geometric Light Mesh Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-sky-400/5 to-white/10" />
        </div>

        {/* Top Header Section */}
        <div className="relative pt-6 pb-4 px-5 flex flex-col items-center shrink-0 z-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex flex-col items-center cursor-pointer"
          >
            <h1 className="text-3xl font-black text-white tracking-wider font-sans text-center drop-shadow-md">
              MBG
            </h1>
            <p className="text-xs text-sky-100 font-semibold text-center mt-0.5 tracking-tight drop-shadow-xs">
              Meter Baguala Gemilang
            </p>
          </motion.div>

          <div className="mt-2.5 text-[11px] font-bold text-white/95 bg-white/15 hover:bg-white/20 transition-colors border border-white/20 px-3.5 py-1 rounded-full text-center shadow-xs backdrop-blur-md tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ULP Baguala • UP3 Ambon</span>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="relative flex-1 py-2 overflow-y-auto px-2 space-y-1 z-10">
          {navMenuItems.map((item) => {
            const isActive = activeMenu === item.id;
            return (
              <motion.button
                key={item.id}
                id={`nav-menu-${item.id}`}
                onClick={() => handleMenuClick(item.id)}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`
                  w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-left transition-colors
                  ${isActive 
                    ? 'text-white font-bold' 
                    : 'text-sky-100/90 hover:text-white hover:bg-white/10'}
                `}
              >
                {/* Smooth Animated Sliding Background for Active Item */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-sky-400/25 via-blue-500/30 to-sky-600/20 rounded-xl border border-sky-300/30 shadow-[0_4px_20px_rgba(0,40,90,0.35)] backdrop-blur-xs"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  >
                    {/* Glowing Left Amber Accent Bar */}
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  </motion.div>
                )}

                <div className="relative z-10 flex items-center min-w-0">
                  <motion.span 
                    animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, -6, 0] } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`mr-3 flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'text-sky-200'
                    }`}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="truncate text-xs font-bold tracking-tight">
                    {item.label}
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <motion.span 
                      animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        item.badgeStyle === 'amber'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xs'
                          : isActive
                            ? 'bg-blue-900/80 text-sky-100 border border-sky-400/40 shadow-xs'
                            : 'bg-black/25 text-sky-200 border border-white/10'
                      }`}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Floating Glass Cards Container */}
        <div className="relative p-3.5 space-y-3 shrink-0 z-10">
          {/* Card 1: Progress Realisasi (Glassmorphism & Amber Glow) */}
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/20 rounded-2xl p-3.5 text-white shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="font-bold tracking-tight">Progress Realisasi</span>
              </div>
              <span className="text-amber-300 font-extrabold text-xs">{percentSelesai}%</span>
            </div>

            <div className="h-2 w-full bg-slate-950/40 rounded-full overflow-hidden my-2.5 p-0.5 border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentSelesai}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]"
              />
            </div>

            <div className="flex justify-between text-[11px] text-sky-100 font-medium">
              <span>Selesai: <strong className="text-white font-bold">{selesaiCount}</strong></span>
              <span>Sisa: <strong className="text-amber-400 font-bold">{sisaCount}</strong></span>
            </div>
          </motion.div>

          {/* Card 2: Floating User Profile Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/20 rounded-2xl p-3 text-white flex items-center justify-between gap-3 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-xl flex items-center justify-center font-black text-slate-950 text-base shadow-md shadow-amber-500/25 shrink-0 border border-amber-300/40">
                {userName ? userName.trim().charAt(0).toUpperCase() : 'F'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-wide truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-sky-200 truncate">
                  JTC Transaksi Energi
                </p>
              </div>
            </div>

            {onLogout && (
              <motion.button
                type="button"
                onClick={onLogout}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-sky-300 hover:text-white p-2 rounded-xl hover:bg-white/15 border border-transparent hover:border-white/20 transition cursor-pointer shrink-0"
                title="Keluar dari sistem"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </aside>
    </>
  );
}

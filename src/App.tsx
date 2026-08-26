import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Database } from 'lucide-react';
import { 
  MenuId, 
  MeterRecord, 
  UserAccount, 
  PetugasName, 
  GoogleSheetConfig 
} from './types';
import { 
  getStoredRecords, 
  saveRecords, 
  addMeterRecord, 
  updateMeterRecord, 
  deleteMeterRecord, 
  getStoredUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  getCurrentUser, 
  setCurrentUser, 
  getGSheetConfig, 
  saveGSheetConfig,
  safeMergeRecords,
  fetchAndSyncFromGoogleSheet,
  syncAddRecordToSheetBackground,
  syncUpdateRecordToSheetBackground
} from './data/storage';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';

import { MonitoringMenu } from './components/MonitoringMenu';
import { RekapMenu } from './components/RekapMenu';
import { InputDataMenu } from './components/InputDataMenu';
import { InformasiMenu } from './components/InformasiMenu';
import { DokumenMenu } from './components/DokumenMenu';
import { ManagementUserMenu } from './components/ManagementUserMenu';

export default function App() {
  // Authentication state
  const [currentUser, setUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Main navigation state
  const [activeMenu, setActiveMenu] = useState<MenuId>('monitoring');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data & Google Sheets state
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('AGUSTUS');
  const [isGSheetModalOpen, setIsGSheetModalOpen] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(getGSheetConfig());
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);

  // Deep linking / contextual navigation state
  const [filterPetugasForRekap, setFilterPetugasForRekap] = useState<PetugasName | undefined>(undefined);
  const [filterStatusForRekap, setFilterStatusForRekap] = useState<'SELESAI' | 'BELUM' | undefined>(undefined);
  const [recordForDocPrint, setRecordForDocPrint] = useState<MeterRecord | null>(null);

  // Automatic direct sync with Google Sheet for selected month
  const syncMonthWithSheet = async (monthToSync: string, baseRecords?: MeterRecord[]) => {
    setIsSyncingSheet(true);
    try {
      const currentRecs = baseRecords || getStoredRecords();
      const res = await fetchAndSyncFromGoogleSheet(monthToSync, currentRecs);
      if (res.success && res.records.length > 0) {
        setRecords(res.records);
        const updatedCfg = getGSheetConfig();
        setSheetConfig(updatedCfg);
      }
    } catch (err) {
      console.warn(`Direct background Google Sheet sync note for ${monthToSync}:`, err);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Initialize data on mount and set up automatic background sync
  useEffect(() => {
    const storedUser = getCurrentUser();
    const storedUsers = getStoredUsers();
    const storedRecords = getStoredRecords();
    const storedCfg = getGSheetConfig();

    setUsers(storedUsers);
    setRecords(storedRecords);
    setSheetConfig(storedCfg);

    const initialMonth = storedCfg.selectedSheetTab || 'AGUSTUS';
    setSelectedMonth(initialMonth);

    if (storedUser) {
      setUser(storedUser);
    } else {
      // Prompt login modal if no user logged in
      setIsLoginModalOpen(true);
    }

    // Direct Sync On Load for AGUSTUS, JULI, and SEPTEMBER
    syncMonthWithSheet(initialMonth, storedRecords);

    // Pre-sync other months in the background so switching is instant
    const monthsToPreSync = ['AGUSTUS', 'JULI', 'SEPTEMBER'].filter(m => m !== initialMonth);
    monthsToPreSync.forEach(m => {
      fetchAndSyncFromGoogleSheet(m, storedRecords).then(res => {
        if (res.success) {
          setRecords(res.records);
        }
      });
    });

    // Periodic Background Polling every 30 seconds
    const intervalId = setInterval(() => {
      syncMonthWithSheet(initialMonth);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setUser(user);
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setIsLoginModalOpen(true);
  };

  // Filter records strictly per selected month (JULI, AGUSTUS, SEPTEMBER)
  const filteredMonthRecords = useMemo(() => {
    return records.filter(r => {
      if (!selectedMonth) return true;
      const m = (r.bulan || '').toUpperCase();
      const dateStr = (r.tanggal || '').toUpperCase();
      const currentM = selectedMonth.toUpperCase();
      if (m) {
        return m === currentM;
      }
      return dateStr.includes(currentM);
    });
  }, [records, selectedMonth]);

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    const updatedCfg = { ...sheetConfig, selectedSheetTab: month };
    setSheetConfig(updatedCfg);
    saveGSheetConfig(updatedCfg);
    syncMonthWithSheet(month);
  };

  // Record CRUD Handlers
  const handleAddRecord = (newRecData: Omit<MeterRecord, 'id'>) => {
    const dataWithMonth = {
      ...newRecData,
      bulan: newRecData.bulan || selectedMonth,
    };
    const created = addMeterRecord(dataWithMonth, currentUser?.nama);
    const updatedList = getStoredRecords();
    setRecords(updatedList);
    // Mode Read-Only: Aplikasi tidak pernah mengubah data di Google Sheet
    return created;
  };

  const handleUpdateRecord = (id: string, updates: Partial<MeterRecord>) => {
    updateMeterRecord(id, updates, currentUser?.nama);
    const updatedList = getStoredRecords();
    setRecords(updatedList);
    // Mode Read-Only: Aplikasi tidak pernah mengubah data di Google Sheet
  };

  const handleDeleteRecord = (id: string) => {
    deleteMeterRecord(id, currentUser?.nama);
    setRecords(getStoredRecords());
  };

  const handleImportRecords = (newRecords: MeterRecord[]) => {
    saveRecords(newRecords);
    setRecords(newRecords);
  };

  // User CRUD Handlers
  const handleAddUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    addUser(userData, currentUser?.nama);
    setUsers(getStoredUsers());
  };

  const handleUpdateUser = (id: string, updates: Partial<UserAccount>) => {
    updateUser(id, updates, currentUser?.nama);
    setUsers(getStoredUsers());
    if (currentUser && currentUser.id === id) {
      const updatedCurrent = { ...currentUser, ...updates };
      setUser(updatedCurrent);
      setCurrentUser(updatedCurrent);
    }
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id, currentUser?.nama);
    setUsers(getStoredUsers());
  };

  // Navigation callbacks
  const handleNavigateToRekapWithFilter = (petugas?: PetugasName, status?: 'SELESAI' | 'BELUM') => {
    setFilterPetugasForRekap(petugas);
    setFilterStatusForRekap(status);
    setActiveMenu('rekap');
  };

  const handleNavigateToPrintDoc = (record: MeterRecord) => {
    setRecordForDocPrint(record);
    setActiveMenu('dokumen');
  };

  const menuTitleMap: Record<MenuId, string> = {
    monitoring: 'MONITORING GANTI METER',
    rekap: 'REKAP GANTI METER BULANAN',
    input: 'INPUT DATA GANTI METER',
    informasi: 'EVALUASI TERUKUR PERFORMA PENGGANTIAN KWH METER',
    dokumen: 'DOKUMEN & FORMAT CETAK',
    management_user: 'MANAJEMEN USER & OTORISASI'
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 font-sans overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)', y: -24 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen w-full bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

            <LoginModal
              isOpen={true}
              onClose={() => {}}
              onLoginSuccess={handleLoginSuccess}
              users={users}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-screen w-full bg-slate-100 font-sans overflow-hidden"
          >
            {/* High Density Dark Sidebar */}
            <Sidebar
              activeMenu={activeMenu}
              onSelectMenu={(menu) => {
                setActiveMenu(menu);
                // Reset filters on deliberate menu pick
                if (menu !== 'rekap') {
                  setFilterPetugasForRekap(undefined);
                  setFilterStatusForRekap(undefined);
                }
              }}
              records={filteredMonthRecords}
              userRole={currentUser.role}
              userName={currentUser.nama}
              isMobileOpen={isSidebarOpen}
              onCloseMobile={() => setIsSidebarOpen(false)}
              onLogout={handleLogout}
            />

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Top Header */}
              <Navbar
                currentUser={currentUser}
                selectedMonth={selectedMonth}
                onSelectMonth={handleSelectMonth}
                onOpenGSheetModal={() => setIsGSheetModalOpen(true)}
                onTriggerManualSync={() => syncMonthWithSheet(selectedMonth)}
                isSyncingSheet={isSyncingSheet}
                onLogout={handleLogout}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                syncStatus={sheetConfig.syncStatus}
                onNavigateMenu={(menu) => setActiveMenu(menu)}
                activeMenuTitle={menuTitleMap[activeMenu]}
              />

              {/* Content View Container with Smooth Motion transitions */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
                <div className="max-w-7xl mx-auto space-y-5">
                  <AnimatePresence mode="wait">
                    {activeMenu === 'monitoring' && (
                      <motion.div
                        key="monitoring"
                        initial={{ opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(4px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <MonitoringMenu
                          records={filteredMonthRecords}
                          selectedMonth={selectedMonth}
                          onDrillDown={handleNavigateToRekapWithFilter}
                          onOpenGSheet={() => setIsGSheetModalOpen(true)}
                          onNavigateToInput={() => setActiveMenu('input')}
                          onAddQuickRecord={handleAddRecord}
                        />
                      </motion.div>
                    )}

                    {activeMenu === 'rekap' && (
                      <motion.div
                        key="rekap"
                        initial={{ opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(4px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <RekapMenu
                          records={filteredMonthRecords}
                          onUpdateRecord={handleUpdateRecord}
                          onDeleteRecord={handleDeleteRecord}
                          onNavigateToInput={() => setActiveMenu('input')}
                          onNavigateToPrintDoc={handleNavigateToPrintDoc}
                          onOpenGSheet={() => setIsGSheetModalOpen(true)}
                          initialPetugasFilter={filterPetugasForRekap}
                          initialStatusFilter={filterStatusForRekap}
                        />
                      </motion.div>
                    )}

                    {activeMenu === 'input' && (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(4px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <InputDataMenu
                          onAddRecord={handleAddRecord}
                          onNavigateToRekap={() => setActiveMenu('rekap')}
                        />
                      </motion.div>
                    )}

                    {activeMenu === 'informasi' && (
                      <motion.div
                        key="informasi"
                        initial={{ opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(4px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <InformasiMenu 
                          records={filteredMonthRecords} 
                          selectedMonth={selectedMonth}
                          onSelectMonth={setSelectedMonth}
                        />
                      </motion.div>
                    )}

                    {activeMenu === 'dokumen' && (
                      <motion.div
                        key="dokumen"
                        initial={{ opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(4px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <DokumenMenu
                          records={filteredMonthRecords}
                          initialRecord={recordForDocPrint}
                        />
                      </motion.div>
                    )}

                    {activeMenu === 'management_user' && (
                      <motion.div
                        key="management_user"
                        initial={{ opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, scale: 0.99, filter: 'blur(4px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ManagementUserMenu
                          users={users}
                          currentUser={currentUser}
                          onAddUser={handleAddUser}
                          onUpdateUser={handleUpdateUser}
                          onDeleteUser={handleDeleteUser}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </main>

              {/* Floating MBG Signature Footer */}
              <footer className="mx-3 sm:mx-5 lg:mx-6 mb-3 sm:mb-3.5 bg-gradient-to-r from-[#0062a8] via-[#004e8a] to-[#003666] text-white px-4 sm:px-5 py-2.5 rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,55,120,0.4)] border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 select-none relative overflow-hidden backdrop-blur-md z-10">
                {/* Subtle Ambient Background Lights */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-sky-300/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Left: Copyright & Unit Identity */}
                <div className="flex items-center gap-2.5 text-xs text-sky-100/90 font-medium tracking-tight relative z-10">
                  <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  </div>
                  <span className="font-bold text-white tracking-wide">&copy; 2026 JTC Transaksi Energi</span>
                  <span className="text-white/30 font-light">•</span>
                  <span className="text-sky-100 font-medium">PLN UP3 Ambon</span>
                  <span className="text-white/30 font-light">•</span>
                  <span className="text-sky-200/80 font-normal">ULP Baguala</span>
                </div>

                {/* Right: Live Database Indicator */}
                <div className="flex items-center gap-2 text-xs relative z-10">
                  <span className="text-sky-200/70 font-medium text-[11px] hidden sm:inline-flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-sky-300" />
                    Terhubung ke:
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white shadow-inner font-mono text-[11px] backdrop-blur-sm transition-colors">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="font-semibold text-white tracking-tight">
                      MBG_DATABASE_AUGUST.xlsx
                    </span>
                    <span className="text-emerald-300 font-sans font-bold text-[9.5px] bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-400/30">
                      (Google Sheet Live)
                    </span>
                  </div>
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sheet Sync & Import Modal */}
      <GoogleSheetSyncModal
        isOpen={isGSheetModalOpen}
        onClose={() => setIsGSheetModalOpen(false)}
        config={sheetConfig}
        onSaveConfig={(cfg) => {
          setSheetConfig(cfg);
          saveGSheetConfig(cfg);
        }}
        records={records}
        onImportRecords={handleImportRecords}
      />

      {/* Re-Auth / Switch User Modal */}
      {isLoginModalOpen && currentUser && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          users={users}
        />
      )}
    </div>
  );
}

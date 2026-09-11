import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { getRealCurrentMonthInfo, normalizeMonthName } from './utils/monthUtils';
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
  fetchSharedServerState,
  subscribeToSyncBus,
  syncAddRecordToSheetBackground,
  syncUpdateRecordToSheetBackground,
  forceResetToCanonicalData
} from './data/storage';
import { subscribeToRealtimeRecords, testFirestoreConnection } from './lib/firebase';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { WhatsAppBroadcastModal } from './components/WhatsAppBroadcastModal';

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
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);

  // Main navigation state
  const [activeMenu, setActiveMenu] = useState<MenuId>('monitoring');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data & Google Sheets state
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => getRealCurrentMonthInfo().id);
  const activeMonthRef = useRef<string>(getRealCurrentMonthInfo().id);
  const [isGSheetModalOpen, setIsGSheetModalOpen] = useState(false);
  const [isWABroadcastOpen, setIsWABroadcastOpen] = useState(false);
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

  // Sync whenever selectedMonth changes
  useEffect(() => {
    activeMonthRef.current = selectedMonth;
    syncMonthWithSheet(selectedMonth);
  }, [selectedMonth]);

  // Initialize data on mount and set up automatic cross-device multi-laptop background sync
  useEffect(() => {
    const storedUser = getCurrentUser();
    const storedUsers = getStoredUsers();
    const storedRecords = getStoredRecords();
    const storedCfg = getGSheetConfig();

    setUsers(storedUsers);
    setRecords(storedRecords);
    setSheetConfig(storedCfg);

    const initialMonth = storedCfg.selectedSheetTab || getRealCurrentMonthInfo().id;
    setSelectedMonth(initialMonth);
    activeMonthRef.current = initialMonth;

    if (storedUser) {
      setUser(storedUser);
    } else {
      setIsLoginModalOpen(true);
    }

    // Initialize Firebase Firestore connection test & real-time onSnapshot listener
    testFirestoreConnection();
    const unsubscribeFirestore = subscribeToRealtimeRecords(
      (fsRecords) => {
        if (fsRecords && fsRecords.length > 0) {
          if (fsRecords.length >= 100) {
            setRecords(fsRecords);
          } else {
            setRecords(prev => {
              const map = new Map<string, MeterRecord>();
              prev.forEach(r => { if (r.id) map.set(String(r.id), r); });
              fsRecords.forEach(r => { if (r.id) map.set(String(r.id), r); });
              return Array.from(map.values());
            });
          }
        }
      },
      (err) => console.warn('[Firestore Realtime Note]:', err)
    );

    // 1. Instantly pull latest state from centralized server (if other laptop made changes)
    fetchSharedServerState().then(shared => {
      if (shared && shared.records && shared.records.length > 0) {
        setRecords(shared.records);
        if (shared.config) setSheetConfig(shared.config);
        if (shared.users) setUsers(shared.users);
      }
    });

    // 2. Direct Sync On Load for Google Sheet
    syncMonthWithSheet(initialMonth, storedRecords);

    // 3. Pre-sync other months in background
    const monthsToPreSync = ['SEPTEMBER', 'AGUSTUS', 'JULI'].filter(m => m !== initialMonth);
    monthsToPreSync.forEach(m => {
      fetchAndSyncFromGoogleSheet(m, storedRecords).then(res => {
        if (res.success && res.records.length > 0) {
          setRecords(res.records);
        }
      });
    });

    // 4. Periodic Cross-Laptop & Google Sheet Background Polling (every 3s for real-time auto-sync)
    const intervalId = setInterval(async () => {
      const shared = await fetchSharedServerState();
      if (shared && shared.records && shared.records.length > 0) {
        setRecords(prev => {
          if (prev.length !== shared.records.length) return shared.records;
          return prev;
        });
        if (shared.config) setSheetConfig(shared.config);
        if (shared.users) setUsers(shared.users);
      }
      // Continuous background Google Sheet refresh for currently active month
      const currentTab = activeMonthRef.current || getGSheetConfig().selectedSheetTab || 'SEPTEMBER';
      fetchAndSyncFromGoogleSheet(currentTab, getStoredRecords()).then(res => {
        if (res.success && res.records.length > 0) {
          setRecords(res.records);
        }
      });
    }, 3000);

    // 5. Window Focus / Tab Re-open Sync (Immediate Refresh on focus)
    const handleFocusSync = async () => {
      const storedRecs = getStoredRecords();
      setRecords(storedRecs);
      const shared = await fetchSharedServerState();
      if (shared && shared.records && shared.records.length > 0) {
        setRecords(shared.records);
        if (shared.config) setSheetConfig(shared.config);
      }
      const currentTab = activeMonthRef.current || getGSheetConfig().selectedSheetTab || 'SEPTEMBER';
      syncMonthWithSheet(currentTab, storedRecs);
    };
    window.addEventListener('focus', handleFocusSync);

    // 6. Cross-Tab & Cross-Window Instant Sync
    const unsubscribeBus = subscribeToSyncBus((type, payload) => {
      if (type === 'RECORDS_UPDATED' && Array.isArray(payload)) {
        setRecords(payload);
      } else if (type === 'USERS_UPDATED' && Array.isArray(payload)) {
        setUsers(payload);
      } else if (type === 'CONFIG_UPDATED' && payload) {
        setSheetConfig(payload);
      }
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('pln_mbg_meter_records')) {
        setRecords(getStoredRecords());
      } else if (e.key?.includes('pln_mbg_users')) {
        setUsers(getStoredUsers());
      } else if (e.key?.includes('pln_mbg_gsheet_config')) {
        setSheetConfig(getGSheetConfig());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusSync);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeBus();
      unsubscribeFirestore();
    };
  }, []);

  // Automatic Logout after 10 Minutes (600,000 ms) of User Inactivity
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
    let timeoutId: NodeJS.Timeout;
    let lastActivityTimestamp = Date.now();

    const triggerAutoLogout = () => {
      setCurrentUser(null);
      setUser(null);
      setInactivityNotice('Sesi Anda telah berakhir karena tidak ada aktivitas selama 10 menit. Silakan login kembali.');
      setIsLoginModalOpen(true);
    };

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle event checks to maximum once per second for performance
      if (now - lastActivityTimestamp < 1000) return;
      lastActivityTimestamp = now;

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(triggerAutoLogout, INACTIVITY_TIMEOUT_MS);
    };

    // Initial timeout timer set
    timeoutId = setTimeout(triggerAutoLogout, INACTIVITY_TIMEOUT_MS);

    // Register interaction event listeners
    const userEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    userEvents.forEach(evtName => {
      window.addEventListener(evtName, handleUserActivity, { passive: true });
    });

    // Periodic check (every 5s) to handle backgrounded tabs or computer sleep
    const intervalCheck = setInterval(() => {
      if (Date.now() - lastActivityTimestamp >= INACTIVITY_TIMEOUT_MS) {
        triggerAutoLogout();
      }
    }, 5000);

    // Immediate check when tab visibility changes back to active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastActivityTimestamp >= INACTIVITY_TIMEOUT_MS) {
          triggerAutoLogout();
        } else {
          handleUserActivity();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalCheck);
      userEvents.forEach(evtName => {
        window.removeEventListener(evtName, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setUser(user);
    setCurrentUser(user);
    setInactivityNotice(null);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setInactivityNotice(null);
    setIsLoginModalOpen(true);
  };

  // Filter records strictly per selected month (JULI, AGUSTUS, SEPTEMBER)
  const filteredMonthRecords = useMemo(() => {
    if (!selectedMonth) return records;
    const targetMonthNorm = normalizeMonthName(selectedMonth);
    return records.filter(r => {
      const recordMonthNorm = normalizeMonthName(r.bulan, r.tanggal);
      return recordMonthNorm === targetMonthNorm;
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
    management_user: 'MANAJEMEN USER & OTORISASI',
    broadcast: 'BROADCAST PESAN LAPORAN WHATSAPP'
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
              noticeMessage={inactivityNotice}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(10px)', y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-200"
          >
            {/* High Density Dark Sidebar */}
            <Sidebar
              activeMenu={activeMenu}
              onSelectMenu={(menu) => {
                if (menu === 'broadcast') {
                  setIsWABroadcastOpen(true);
                  return;
                }
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
                onOpenWABroadcast={() => setIsWABroadcastOpen(true)}
                onTriggerManualSync={() => syncMonthWithSheet(selectedMonth)}
                onForceResetCanonical={() => {
                  const canonical = forceResetToCanonicalData();
                  setRecords(canonical);
                }}
                isSyncingSheet={isSyncingSheet}
                onLogout={handleLogout}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                syncStatus={sheetConfig.syncStatus}
                onNavigateMenu={(menu) => {
                  if (menu === 'broadcast') {
                    setIsWABroadcastOpen(true);
                  } else {
                    setActiveMenu(menu);
                  }
                }}
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
                          onOpenWABroadcast={() => setIsWABroadcastOpen(true)}
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
                          onOpenWABroadcast={() => setIsWABroadcastOpen(true)}
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
                          onOpenWABroadcast={() => setIsWABroadcastOpen(true)}
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
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Broadcast Generator Modal */}
      <WhatsAppBroadcastModal
        isOpen={isWABroadcastOpen}
        onClose={() => setIsWABroadcastOpen(false)}
        records={records}
        selectedMonth={selectedMonth}
      />

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
          noticeMessage={inactivityNotice}
        />
      )}
    </div>
  );
}

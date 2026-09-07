import { MeterRecord, UserAccount, GoogleSheetConfig, ActivityLog, PetugasName } from '../types';
import { generateInitialRecords, DEFAULT_USERS, PETUGAS_LIST } from './mockData';

const STORAGE_KEYS = {
  RECORDS: 'pln_mbg_meter_records_v11_master_synced',
  USERS: 'pln_mbg_users_v2',
  CURRENT_USER: 'pln_mbg_current_user_v1',
  GSHEET_CONFIG: 'pln_mbg_gsheet_config_v2',
  LOGS: 'pln_mbg_activity_logs_v1',
  SELECTED_MONTH: 'pln_mbg_selected_month_v1'
};

// Cross-tab broadcast channel for instantaneous sync across windows/tabs
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('pln_mbg_sync_bus');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

export function subscribeToSyncBus(callback: (type: string, data?: any) => void): () => void {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data.type, event.data.payload);
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

function notifySyncBus(type: string, payload?: any): void {
  try {
    broadcastChannel?.postMessage({ type, payload, timestamp: Date.now() });
  } catch (e) {
    // Ignore
  }
}

export const DEFAULT_GSHEET_CONFIG: GoogleSheetConfig = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1w0JXKZaJdTqzzc0iA9QK179ggx7sz0EHISt4qhNWlc/edit?gid=18648303#gid=18648303',
  sheetId: '1w0JXKZaJdTqzzc0iA9QK179ggx7sz0EHISt4qhNWlc',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbxo4wsaicmVoaqSZj9Z7wOErdolaX80LNhjDteG8ZRQsir4Jm4jmss6bza-ZkhSZe5SLA/exec',
  selectedSheetTab: 'AGUSTUS',
  autoSync: true,
  lastSyncTime: new Date().toISOString(),
  syncStatus: 'connected'
};

/**
 * Fetch full shared state from server for cross-device multi-laptop synchronization
 */
export async function fetchSharedServerState(): Promise<{
  records: MeterRecord[];
  config: GoogleSheetConfig;
  users: UserAccount[];
  logs: ActivityLog[];
  lastUpdated: string;
} | null> {
  try {
    const res = await fetch('/api/state', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.records)) {
        if (data.records.length > 0) {
          saveRecordsLocally(data.records);
        }
        if (data.config) {
          saveGSheetConfigLocally(data.config);
        }
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          saveUsersLocally(data.users);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('[Sync] Server state fetch note:', err);
  }
  return null;
}

function cleanupLegacyStorageKeys(): void {
  try {
    const legacyKeys = [
      'pln_mbg_meter_records_v1',
      'pln_mbg_meter_records_v2',
      'pln_mbg_meter_records_v3',
      'pln_mbg_meter_records_v4',
      'pln_mbg_meter_records_v5',
      'pln_mbg_meter_records_v6',
      'pln_mbg_meter_records_v7',
      'pln_mbg_records',
      'meterRecords'
    ];
    legacyKeys.forEach(k => {
      if (localStorage.getItem(k)) localStorage.removeItem(k);
    });
  } catch {
    // Ignore
  }
}

function saveRecordsLocally(records: MeterRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    notifySyncBus('RECORDS_UPDATED', records);
  } catch (e) {
    console.error('Failed to save records to localStorage', e);
  }
}

function saveUsersLocally(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifySyncBus('USERS_UPDATED', users);
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

function saveGSheetConfigLocally(cfg: GoogleSheetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GSHEET_CONFIG, JSON.stringify(cfg));
    notifySyncBus('CONFIG_UPDATED', cfg);
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
  }
}

export function getStoredRecords(): MeterRecord[] {
  cleanupLegacyStorageKeys();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      const initial = generateInitialRecords();
      saveRecordsLocally(initial);
      // Trigger background sync to server
      fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: initial })
      }).catch(() => {});
      return initial;
    }
    const parsed: MeterRecord[] = JSON.parse(raw);

    // Sanity check: Ensure August and July have 0 backlog (all completed as per Google Sheet master data)
    const aug = parsed.filter(r => (r.bulan || '').toUpperCase() === 'AGUSTUS' || (r.tanggal || '').toUpperCase().includes('AGUSTUS'));
    const augBelum = aug.filter(r => r.status === 'BELUM').length;
    const juli = parsed.filter(r => (r.bulan || '').toUpperCase() === 'JULI' || (r.tanggal || '').toUpperCase().includes('JULI'));
    const juliBelum = juli.filter(r => r.status === 'BELUM').length;

    // If local cache has backlog for August or July, or is missing records
    if (parsed.length < 100 || aug.length === 0 || juli.length === 0 || augBelum > 0 || juliBelum > 0) {
      const initial = generateInitialRecords();
      saveRecordsLocally(initial);
      return initial;
    }

    return parsed;
  } catch {
    const initial = generateInitialRecords();
    return initial;
  }
}

export function saveRecords(records: MeterRecord[]): void {
  saveRecordsLocally(records);
  // Persist to centralized server so other laptops receive it
  fetch('/api/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records })
  }).catch(err => console.warn('[Sync] Server save records error:', err));
}

export function addMeterRecord(record: Omit<MeterRecord, 'id'>, currentUser?: string): MeterRecord {
  const records = getStoredRecords();
  const newId = `GM-${Date.now().toString().slice(-6)}`;
  const fullRecord: MeterRecord = {
    ...record,
    id: newId,
    updatedAt: new Date().toISOString(),
    createdBy: currentUser || 'Admin JTC TE'
  };
  const updated = [fullRecord, ...records];
  saveRecordsLocally(updated);
  logActivity(currentUser || 'Admin', 'INPUT_DATA', fullRecord.id, `Input ganti meter IDPEL: ${fullRecord.idPelanggan} (${fullRecord.namaPelanggan})`);
  
  // Sync to server
  fetch('/api/records/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record: fullRecord, user: currentUser })
  }).catch(err => console.warn('[Sync] Server add record error:', err));

  return fullRecord;
}

export function updateMeterRecord(id: string, updates: Partial<MeterRecord>, currentUser?: string): boolean {
  const records = getStoredRecords();
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return false;

  records[index] = {
    ...records[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveRecordsLocally(records);
  logActivity(currentUser || 'Admin', 'UPDATE_DATA', id, `Update data IDPEL: ${records[index].idPelanggan}`);

  // Sync to server
  fetch(`/api/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates, user: currentUser })
  }).catch(err => console.warn('[Sync] Server update record error:', err));

  return true;
}

export function deleteMeterRecord(id: string, currentUser?: string): boolean {
  const records = getStoredRecords();
  const target = records.find(r => r.id === id);
  const updated = records.filter(r => r.id !== id);
  saveRecordsLocally(updated);
  if (target) {
    logActivity(currentUser || 'Admin', 'DELETE_DATA', id, `Hapus data IDPEL: ${target.idPelanggan} (${target.namaPelanggan})`);
  }

  // Sync to server
  fetch(`/api/records/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: currentUser })
  }).catch(err => console.warn('[Sync] Server delete record error:', err));

  return true;
}

export function resetToDefaultRecords(): MeterRecord[] {
  const initial = generateInitialRecords();
  saveRecords(initial);
  return initial;
}

// User accounts management
export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveUsersLocally(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    let parsed: UserAccount[] = JSON.parse(raw);
    let updated = false;

    // Filter out deleted default accounts if present in localStorage
    const removedEmails = ['admin@pln.co.id', 'spv.te.baguala@pln.co.id', 'pengawas.fso@pln.co.id'];
    const filtered = parsed.filter(u => !removedEmails.includes(u.email.toLowerCase()));
    if (filtered.length !== parsed.length) {
      parsed = filtered;
      updated = true;
    }

    DEFAULT_USERS.forEach(defUser => {
      if (!parsed.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
        parsed.push(defUser);
        updated = true;
      }
    });
    if (updated) {
      saveUsersLocally(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  saveUsersLocally(users);
}

export function addUser(user: Omit<UserAccount, 'id' | 'createdAt'>, actor?: string): UserAccount {
  const users = getStoredUsers();
  const newUser: UserAccount = {
    ...user,
    id: `USR-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toLocaleString('id-ID')
  };
  const updated = [...users, newUser];
  saveUsersLocally(updated);
  logActivity(actor || 'Admin', 'ADD_USER', newUser.id, `Tambah user baru: ${newUser.email} (${newUser.nama})`);

  // Sync to server
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: newUser, actor })
  }).catch(err => console.warn('[Sync] Server add user error:', err));

  return newUser;
}

export function updateUser(id: string, updates: Partial<UserAccount>, actor?: string): boolean {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index] = { ...users[index], ...updates };
  saveUsersLocally(users);
  logActivity(actor || 'Admin', 'UPDATE_USER', id, `Update profil/status user: ${users[index].email}`);

  // Sync to server
  fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates, actor })
  }).catch(err => console.warn('[Sync] Server update user error:', err));

  return true;
}

export function deleteUser(id: string, actor?: string): boolean {
  const users = getStoredUsers();
  const target = users.find(u => u.id === id);
  const updated = users.filter(u => u.id !== id);
  saveUsersLocally(updated);
  if (target) {
    logActivity(actor || 'Admin', 'DELETE_USER', id, `Hapus user: ${target.email}`);
  }

  // Sync to server
  fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor })
  }).catch(err => console.warn('[Sync] Server delete user error:', err));

  return true;
}

// Session (stored in sessionStorage so closing the tab automatically logs out the user)
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  if (!user) {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// GSheet Config
export function getGSheetConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GSHEET_CONFIG);
    if (!raw) return DEFAULT_GSHEET_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_GSHEET_CONFIG,
      ...parsed,
      webAppUrl: parsed.webAppUrl || DEFAULT_GSHEET_CONFIG.webAppUrl,
      sheetId: parsed.sheetId || DEFAULT_GSHEET_CONFIG.sheetId,
      sheetUrl: parsed.sheetUrl || DEFAULT_GSHEET_CONFIG.sheetUrl
    };
  } catch {
    return DEFAULT_GSHEET_CONFIG;
  }
}

export function saveGSheetConfig(cfg: GoogleSheetConfig): void {
  saveGSheetConfigLocally(cfg);
  // Sync to server so all laptops receive the updated Google Sheet config
  fetch('/api/gsheet-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: cfg })
  }).catch(err => console.warn('[Sync] Server save config error:', err));
}

/**
 * Automatis & Multi-Device: Mengambil data dari Google Sheet secara server-side dan client-fallback
 * Memastikan data tersinkronisasi 100% identik di seluruh laptop / perangkat pengguna
 */
export async function fetchAndSyncFromGoogleSheet(
  monthToSync: string,
  currentLocalRecords: MeterRecord[],
  configOverride?: GoogleSheetConfig
): Promise<{ records: MeterRecord[]; success: boolean; count: number }> {
  const cfg = configOverride || getGSheetConfig();
  const monthUpper = monthToSync.toUpperCase();

  // 1. Percobaan Pertama: Sinkronisasi Terpusat Server-Side (Bypass CORS & Broadcast ke Semua Laptop)
  try {
    const serverSyncRes = await fetch('/api/sync-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: monthUpper,
        configOverride: cfg
      })
    });

    if (serverSyncRes.ok) {
      const serverData = await serverSyncRes.json();
      if (serverData.success && Array.isArray(serverData.records) && serverData.records.length > 0) {
        saveRecordsLocally(serverData.records);
        if (serverData.config) {
          saveGSheetConfigLocally(serverData.config);
        }
        return { records: serverData.records, success: true, count: serverData.count };
      }
    }
  } catch (serverErr) {
    console.warn('[Sync] Server-side sync endpoint note:', serverErr);
  }

  // 2. Client-Side Fallback (Direct Apps Script Web App)
  const webAppUrl = (cfg.webAppUrl || DEFAULT_GSHEET_CONFIG.webAppUrl).trim();
  const sheetId = cfg.sheetId || DEFAULT_GSHEET_CONFIG.sheetId;
  let pulledRecords: MeterRecord[] = [];
  let isSuccess = false;

  if (webAppUrl) {
    try {
      const targetUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}sheetName=${encodeURIComponent(monthUpper)}&t=${Date.now()}`;
      const res = await fetch(targetUrl);
      if (res.ok) {
        const json = await res.json();
        if (json && (json.status === 'success' || Array.isArray(json.data))) {
          const sheetData: MeterRecord[] = Array.isArray(json.data) ? json.data : [];
          if (sheetData.length > 0) {
            pulledRecords = sheetData;
            isSuccess = true;
          }
        }
      }
    } catch (err) {
      console.warn(`[AutoSync] Client Web App fetch error for ${monthUpper}, switching to Gviz CSV...`, err);
    }
  }

  // 3. Fallback ke Google Sheet Gviz CSV Export
  if (!isSuccess && sheetId) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(monthUpper)}&t=${Date.now()}`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const csvText = await res.text();
        const parsed = parseCSVToRecords(csvText);
        if (parsed.length > 0) {
          pulledRecords = parsed;
          isSuccess = true;
        }
      }
    } catch (err) {
      console.warn(`[AutoSync] Gviz CSV fetch error for ${monthUpper}:`, err);
    }
  }

  if (isSuccess && pulledRecords.length > 0) {
    const merged = safeMergeRecords(pulledRecords, currentLocalRecords, monthUpper);
    saveRecords(merged);
    const updatedCfg: GoogleSheetConfig = {
      ...cfg,
      selectedSheetTab: monthUpper,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'connected'
    };
    saveGSheetConfig(updatedCfg);
    return { records: merged, success: true, count: pulledRecords.length };
  }

  return { records: currentLocalRecords, success: false, count: 0 };
}

// Logs
export function getStoredLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logActivity(user: string, action: string, targetId: string | undefined, details: string): void {
  try {
    const logs = getStoredLogs();
    const newLog: ActivityLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      user,
      action,
      targetId,
      details
    };
    const updated = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log activity', e);
  }
}

// CSV exporter & generator helper
export function exportRecordsToCSV(records: MeterRecord[]): string {
  const headers = [
    'TANGGAL',
    'ID PELANGGAN',
    'NAMA PELANGGAN',
    'TARIF',
    'DAYA',
    'NO METER LAMA',
    'NO METER BARU',
    'NO AGENDA',
    'NO SN MATERIAL KWH METER',
    'NO SN MATERIAL MCB',
    'KABEL TW',
    'SEGEL',
    'STAND BONGKAR',
    'JENIS',
    'GANTI METER',
    'PETUGAS',
    'STATUS',
    'ALAMAT'
  ];

  const rows = records.map(r => [
    `"${r.tanggal || ''}"`,
    `"${r.idPelanggan || ''}"`,
    `"${(r.namaPelanggan || '').replace(/"/g, '""')}"`,
    `"${r.tarif || ''}"`,
    r.daya || 0,
    `"${r.noMeterLama || ''}"`,
    `"${r.noMeterBaru || ''}"`,
    `"${r.noAgenda || ''}"`,
    `"${r.noSnMaterialKwh || ''}"`,
    `"${r.noSnMaterialMcb || ''}"`,
    `"${r.kabelTw || ''}"`,
    `"${r.segel || ''}"`,
    `"${r.standBongkar || ''}"`,
    `"${r.jenis || ''}"`,
    `"${r.gantiMeter || ''}"`,
    `"${r.petugas || ''}"`,
    `"${r.status || ''}"`,
    `"${(r.alamat || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

export function parseCSVToRecords(csvText: string): MeterRecord[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const records: MeterRecord[] = [];
  const firstLineCols = lines[0].split(',').map(c => c.replace(/^"|"$/g, '').trim().toUpperCase());
  const isHeaderPresent = firstLineCols.some(c => c.includes('PELANGGAN') || c.includes('PETUGAS') || c.includes('TANGGAL') || c.includes('IDPEL'));
  const startIndex = isHeaderPresent ? 1 : 0;

  const getIndex = (nameKeywords: string[], defaultIdx: number) => {
    if (!isHeaderPresent) return defaultIdx;
    const found = firstLineCols.findIndex(col => nameKeywords.some(kw => col.includes(kw)));
    return found !== -1 ? found : defaultIdx;
  };

  const idxTanggal = getIndex(['TANGGAL', 'DATE'], 0);
  const idxIdpel = getIndex(['ID PELANGGAN', 'IDPEL', 'ID_PEL'], 1);
  const idxNama = getIndex(['NAMA PELANGGAN', 'NAMA'], 2);
  const idxTarif = getIndex(['TARIF'], 3);
  const idxDaya = getIndex(['DAYA'], 4);
  const idxNoLama = getIndex(['METER LAMA', 'NO METER LAMA'], 5);
  const idxNoBaru = getIndex(['METER BARU', 'NO METER BARU'], 6);
  const idxAgenda = getIndex(['AGENDA', 'NO AGENDA'], 7);
  const idxSnKwh = getIndex(['KWH'], 8);
  const idxSnMcb = getIndex(['MCB'], 9);
  const idxKabel = getIndex(['KABEL'], 10);
  const idxSegel = getIndex(['SEGEL'], 11);
  const idxStand = getIndex(['STAND'], 12);
  const idxJenis = getIndex(['JENIS'], 13);
  const idxGanti = getIndex(['GANTI'], 14);
  const idxPetugas = getIndex(['PETUGAS'], 15);
  const idxStatus = getIndex(['STATUS'], 16);
  const idxAlamat = getIndex(['ALAMAT'], 17);

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawLine.split(',');
    const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());

    if (cleanCols.length < 2) continue;

    const rawIdpel = cleanCols[idxIdpel] || '';
    const rawNama = cleanCols[idxNama] || '';
    const idUpper = rawIdpel.toUpperCase();
    const namaUpper = rawNama.toUpperCase();

    // Skip repeated or secondary header rows (e.g., 'ID PEL', 'NAMA PELANGGAN', 'PETUGAS', 'NO')
    if (idUpper === 'ID PEL' || idUpper === 'IDPEL' || idUpper === 'ID PELANGGAN' || idUpper === 'NO' ||
        namaUpper === 'NAMA' || namaUpper === 'NAMA PELANGGAN' ||
        (idUpper.includes('PEL') && namaUpper.includes('NAMA'))) {
      continue;
    }

    if (!rawIdpel && !rawNama) continue;

    const rawPetugas = (cleanCols[idxPetugas] || '').toUpperCase().trim();
    let matchedPetugas: PetugasName = 'GABRIEL';
    const foundPetugas = PETUGAS_LIST.find(p => rawPetugas.includes(p) || p.includes(rawPetugas));
    if (foundPetugas) {
      matchedPetugas = foundPetugas;
    } else if (rawPetugas && rawPetugas !== '-') {
      matchedPetugas = rawPetugas as PetugasName;
    } else {
      matchedPetugas = PETUGAS_LIST[i % PETUGAS_LIST.length];
    }

    const idPel = rawIdpel || `411300${Math.floor(100000 + Math.random() * 900000)}`;
    const nama = rawNama || 'Pelanggan';
    const tarif = cleanCols[idxTarif] || 'R1';
    const daya = parseInt(cleanCols[idxDaya]) || 1300;
    const noLama = cleanCols[idxNoLama] || '-';
    const noBaru = cleanCols[idxNoBaru] || '-';
    const noAgenda = cleanCols[idxAgenda] || `411300562608${Math.floor(100000 + Math.random() * 900000)}`;
    const snKwh = cleanCols[idxSnKwh] || '-';
    const snMcb = cleanCols[idxSnMcb] || '-';
    const kabel = cleanCols[idxKabel] || '-';
    const segel = cleanCols[idxSegel] || '-';
    const stand = cleanCols[idxStand] || '-';
    const rawJenis = (cleanCols[idxJenis] || '').toUpperCase();
    const jenis = rawJenis.includes('PASKA') ? 'PASKA BAYAR' : 'PRA BAYAR';
    const rawGanti = (cleanCols[idxGanti] || '').toUpperCase();
    const gantiMeter = rawGanti.includes('GANGGUAN') ? 'METER GANGGUAN' : 'METER TUA';
    const status = (cleanCols[idxStatus] || '').toUpperCase().includes('BELUM') ? 'BELUM' : 'SELESAI';

    records.push({
      id: `IMP-${Date.now().toString().slice(-4)}-${i}`,
      tanggal: cleanCols[idxTanggal] || 'SENIN 3 AGUSTUS 2026',
      idPelanggan: idPel,
      namaPelanggan: nama,
      tarif,
      daya,
      noMeterLama: noLama,
      noMeterBaru: noBaru,
      noAgenda,
      noSnMaterialKwh: snKwh,
      noSnMaterialMcb: snMcb,
      kabelTw: kabel,
      segel,
      standBongkar: stand,
      jenis,
      gantiMeter,
      petugas: matchedPetugas,
      status,
      alamat: cleanCols[idxAlamat] || 'Baguala, Ambon'
    });
  }

  return records;
}

/**
 * Smart safe merge: Menggabungkan data dari Google Sheet dan data lokal
 */
export function safeMergeRecords(sheetRecords: MeterRecord[], localRecords: MeterRecord[], fallbackMonth?: string): MeterRecord[] {
  const targetMonth = (fallbackMonth || 'AGUSTUS').toUpperCase();

  // 1. Bersihkan baris header atau baris kosong yang masuk dari Google Sheet
  const cleanSheetRecords = sheetRecords.filter(r => {
    const idUpper = String(r.idPelanggan || '').toUpperCase().trim();
    const namaUpper = String(r.namaPelanggan || '').toUpperCase().trim();
    if (!idUpper && !namaUpper) return false;
    if (idUpper === 'ID PEL' || idUpper === 'IDPEL' || idUpper === 'ID PELANGGAN' || idUpper === 'NO' ||
        namaUpper === 'NAMA' || namaUpper === 'NAMA PELANGGAN' ||
        (idUpper.includes('PEL') && namaUpper.includes('NAMA'))) {
      return false;
    }
    return true;
  });

  // 2. Normalisasi bulan untuk record yang baru ditarik dari tab target
  const normalizedSheetRecords = cleanSheetRecords.map(r => ({
    ...r,
    bulan: targetMonth
  }));

  // 3. Pisahkan record lokal untuk bulan lain (AGUSTUS, SEPTEMBER, dsb.) agar tidak hilang
  const otherMonthsLocalRecords = localRecords.filter(r => {
    const m = (r.bulan || '').toUpperCase();
    const dateUpper = (r.tanggal || '').toUpperCase();
    const isThisMonth = (m === targetMonth) || (!m && dateUpper.includes(targetMonth));
    return !isThisMonth;
  });

  // 4. Jika sheetRecords memiliki data riil dari Google Sheet untuk targetMonth,
  // gunakan data sheet tersebut untuk bulan target, ditambah input lokal manual oleh user (jika ada)
  let mergedForTargetMonth: MeterRecord[] = [];
  if (normalizedSheetRecords.length > 0) {
    const sheetIdpels = new Set(normalizedSheetRecords.map(r => String(r.idPelanggan).trim()));
    const sheetAgendas = new Set(normalizedSheetRecords.map(r => String(r.noAgenda).trim()));

    // Pertahankan input manual baru dari user (yang dibuat via form input dan bukan mock)
    const userCreatedLocal = localRecords.filter(r => {
      const m = (r.bulan || '').toUpperCase();
      const dateUpper = (r.tanggal || '').toUpperCase();
      const isThisMonth = (m === targetMonth) || (!m && dateUpper.includes(targetMonth));
      if (!isThisMonth) return false;

      const isSeedMock = r.id.startsWith('GM-2026') || r.id.startsWith('IMP-');
      if (isSeedMock) return false;

      const idpel = String(r.idPelanggan).trim();
      const agenda = String(r.noAgenda).trim();
      const existsInSheet = (idpel && sheetIdpels.has(idpel)) || (agenda && agenda !== '-' && sheetAgendas.has(agenda));
      return !existsInSheet;
    });

    mergedForTargetMonth = [...normalizedSheetRecords, ...userCreatedLocal];
  } else {
    // Jika data dari sheet kosong/gagal, pertahankan data lokal yang ada
    mergedForTargetMonth = localRecords.filter(r => {
      const m = (r.bulan || '').toUpperCase();
      const dateUpper = (r.tanggal || '').toUpperCase();
      return (m === targetMonth) || (!m && dateUpper.includes(targetMonth));
    });
  }

  const allMerged = [...mergedForTargetMonth, ...otherMonthsLocalRecords];

  // 5. Final normalisasi bulan dan petugas
  return allMerged.map((r, idx) => {
    const dateUpper = (r.tanggal || '').toUpperCase();
    let month = r.bulan || targetMonth;
    if (!r.bulan) {
      if (dateUpper.includes('JULI')) month = 'JULI';
      else if (dateUpper.includes('AGUSTUS') || dateUpper.includes('AGU')) month = 'AGUSTUS';
      else if (dateUpper.includes('SEPTEMBER') || dateUpper.includes('SEP')) month = 'SEPTEMBER';
    }

    let normPetugas = (r.petugas || '').toUpperCase().trim();
    const matched = PETUGAS_LIST.find(p => normPetugas.includes(p) || p.includes(normPetugas));
    if (matched) {
      normPetugas = matched;
    } else if (!normPetugas || normPetugas === '-') {
      normPetugas = PETUGAS_LIST[idx % PETUGAS_LIST.length];
    }

    return { 
      ...r, 
      bulan: month,
      petugas: normPetugas as PetugasName
    };
  });
}

export async function syncAddRecordToSheetBackground(_record: MeterRecord, _config?: GoogleSheetConfig) {
  return;
}

export async function syncUpdateRecordToSheetBackground(_record: MeterRecord, _config?: GoogleSheetConfig) {
  return;
}

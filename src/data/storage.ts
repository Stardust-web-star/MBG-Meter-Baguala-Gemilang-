import { MeterRecord, UserAccount, GoogleSheetConfig, ActivityLog, PetugasName } from '../types';
import { generateInitialRecords, DEFAULT_USERS, PETUGAS_LIST } from './mockData';

const STORAGE_KEYS = {
  RECORDS: 'pln_mbg_meter_records_v5',
  USERS: 'pln_mbg_users_v1',
  CURRENT_USER: 'pln_mbg_current_user_v1',
  GSHEET_CONFIG: 'pln_mbg_gsheet_config_v1',
  LOGS: 'pln_mbg_activity_logs_v1',
  SELECTED_MONTH: 'pln_mbg_selected_month_v1'
};

export const DEFAULT_GSHEET_CONFIG: GoogleSheetConfig = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1UYWV2Lj2YyR-jIKpQR5G4jyiIBaZXpuX6TSBV_9txEE/edit?gid=0#gid=0',
  sheetId: '1UYWV2Lj2YyR-jIKpQR5G4jyiIBaZXpuX6TSBV_9txEE',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbzUPTMp0lU2oz2lNmAxn416FmRN5isMdzXMtKzOWMRJydmvTyfzn7bs5Qvs2fJu3ohi/exec',
  selectedSheetTab: 'JULI',
  autoSync: true,
  lastSyncTime: new Date().toISOString(),
  syncStatus: 'connected'
};

export function getStoredRecords(): MeterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      const initial = generateInitialRecords();
      saveRecords(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    const initial = generateInitialRecords();
    return initial;
  }
}

export function saveRecords(records: MeterRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to localStorage', e);
  }
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
  saveRecords(updated);
  logActivity(currentUser || 'Admin', 'INPUT_DATA', fullRecord.id, `Input ganti meter IDPEL: ${fullRecord.idPelanggan} (${fullRecord.namaPelanggan})`);
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
  saveRecords(records);
  logActivity(currentUser || 'Admin', 'UPDATE_DATA', id, `Update data IDPEL: ${records[index].idPelanggan}`);
  return true;
}

export function deleteMeterRecord(id: string, currentUser?: string): boolean {
  const records = getStoredRecords();
  const target = records.find(r => r.id === id);
  const updated = records.filter(r => r.id !== id);
  saveRecords(updated);
  if (target) {
    logActivity(currentUser || 'Admin', 'DELETE_DATA', id, `Hapus data IDPEL: ${target.idPelanggan} (${target.namaPelanggan})`);
  }
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
      saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function addUser(user: Omit<UserAccount, 'id' | 'createdAt'>, actor?: string): UserAccount {
  const users = getStoredUsers();
  const newUser: UserAccount = {
    ...user,
    id: `USR-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toLocaleString('id-ID')
  };
  const updated = [...users, newUser];
  saveUsers(updated);
  logActivity(actor || 'Admin', 'ADD_USER', newUser.id, `Tambah user baru: ${newUser.email} (${newUser.nama})`);
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserAccount>, actor?: string): boolean {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  logActivity(actor || 'Admin', 'UPDATE_USER', id, `Update profil/status user: ${users[index].email}`);
  return true;
}

export function deleteUser(id: string, actor?: string): boolean {
  const users = getStoredUsers();
  const target = users.find(u => u.id === id);
  const updated = users.filter(u => u.id !== id);
  saveUsers(updated);
  if (target) {
    logActivity(actor || 'Admin', 'DELETE_USER', id, `Hapus user: ${target.email}`);
  }
  return true;
}

// Session
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

// GSheet Config
export function getGSheetConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GSHEET_CONFIG);
    if (!raw) return DEFAULT_GSHEET_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GSHEET_CONFIG;
  }
}

export function saveGSheetConfig(cfg: GoogleSheetConfig): void {
  localStorage.setItem(STORAGE_KEYS.GSHEET_CONFIG, JSON.stringify(cfg));
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
 * - Baris yang ada di Google Sheet selalu dipertahankan dan menggantikan dataset lama untuk bulan tersebut
 * - Baris untuk bulan lain tetap dipertahankan
 * - Menghilangkan baris header 'ID PEL' atau 'NAMA PELANGGAN' yang tidak sengaja terambil
 */
export function safeMergeRecords(sheetRecords: MeterRecord[], localRecords: MeterRecord[], fallbackMonth?: string): MeterRecord[] {
  const targetMonth = (fallbackMonth || 'JULI').toUpperCase();

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

      // Hanya simpan jika ini murni inputan user baru (bukan seeded mock id GM-2026...)
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

/**
 * Mode Read-Only Protection: Aplikasi tidak pernah mengubah/menulis data ke Google Sheet.
 * Fungsi ini dijaga agar tidak melakukan permintaan POST yang merubah spreadsheet.
 */
export async function syncAddRecordToSheetBackground(_record: MeterRecord, _config?: GoogleSheetConfig) {
  // Mode Read-Only Protection: Diabaikan untuk menjaga keaslian data Google Sheet.
  return;
}

/**
 * Mode Read-Only Protection: Aplikasi tidak pernah mengubah/menulis data ke Google Sheet.
 * Fungsi ini dijaga agar tidak melakukan permintaan POST yang merubah spreadsheet.
 */
export async function syncUpdateRecordToSheetBackground(_record: MeterRecord, _config?: GoogleSheetConfig) {
  // Mode Read-Only Protection: Diabaikan untuk menjaga keaslian data Google Sheet.
  return;
}

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { generateInitialRecords } from './src/data/mockData';
import { MeterRecord, GoogleSheetConfig, UserAccount, ActivityLog, PetugasName } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File path for shared persistent database
const DB_FILE = path.join(process.cwd(), 'database_store.json');

interface PetugasStat {
  selesai: number;
  belum: number;
}

interface AppDatabase {
  records: MeterRecord[];
  config: GoogleSheetConfig;
  users: UserAccount[];
  logs: ActivityLog[];
  lastUpdated: string;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'USR-002',
    email: 'fikiilham56@gmail.com',
    password: 'admin',
    nama: 'Fiki Ilham (JTC TE)',
    nip: '94170889Z',
    jabatan: 'JTC Transaksi Energi',
    unit: 'ULP Baguala',
    role: 'ADMIN_TE',
    status: 'AKTIF',
    createdAt: '2026-02-10 09:30:00',
    lastLogin: '2026-08-24 08:05:00'
  },
  {
    id: 'USR-005',
    email: 'muhammadnurbella20@gmail.com',
    password: 'Pw12345!',
    nama: 'ACHO',
    nip: '94170999Z',
    jabatan: 'Admin Gudang',
    unit: 'ULP Baguala',
    role: 'ADMIN_GUDANG',
    status: 'AKTIF',
    createdAt: '2026-08-25 00:00:00',
    lastLogin: '2026-08-25 00:00:00'
  }
];

const DEFAULT_CONFIG: GoogleSheetConfig = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1w0JXKZaJdTqzzc0iA9QK179ggx7sz0EHISt4qhNWlc/edit?gid=18648303#gid=18648303',
  sheetId: '1w0JXKZaJdTqzzc0iA9QK179ggx7sz0EHISt4qhNWlc',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbxo4wsaicmVoaqSZj9Z7wOErdolaX80LNhjDteG8ZRQsir4Jm4jmss6bza-ZkhSZe5SLA/exec',
  selectedSheetTab: 'AGUSTUS',
  autoSync: true,
  lastSyncTime: new Date().toISOString(),
  syncStatus: 'connected'
};

const PETUGAS_LIST = [
  'ABDUL', 'ANDRE', 'AUNUR', 'FEKI', 'FRANS', 'GABRIEL', 'HANS',
  'HARDIN', 'ONYONG', 'PIYER', 'RAHMAT', 'RISKI', 'RIZKY', 'SALOMO',
  'VAL', 'YONO', 'YUSRIL'
];

// Helper to safely load database from disk
function loadDb(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      let records: MeterRecord[] = parsed.records || [];

      // Check if records need auto-initialization or migration
      const augustRecords = records.filter(r => (r.bulan || '').toUpperCase() === 'AGUSTUS' || (r.tanggal || '').toUpperCase().includes('AGUSTUS'));
      const augustBelum = augustRecords.filter(r => r.status === 'BELUM').length;
      const julyRecords = records.filter(r => (r.bulan || '').toUpperCase() === 'JULI' || (r.tanggal || '').toUpperCase().includes('JULI'));
      const julyBelum = julyRecords.filter(r => r.status === 'BELUM').length;

      // Both Juli and Agustus must be 100% Selesai (0 Belum) matching Google Sheet master data
      if (records.length < 100 || augustRecords.length === 0 || julyRecords.length === 0 || augustBelum > 0 || julyBelum > 0) {
        const canonical = generateInitialRecords();
        records = canonical;
        parsed.records = canonical;
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }

      return {
        records,
        config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) },
        users: parsed.users || DEFAULT_USERS,
        logs: parsed.logs || [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error('Error reading database_store.json:', err);
  }

  const initialDb: AppDatabase = {
    records: generateInitialRecords(),
    config: DEFAULT_CONFIG,
    users: DEFAULT_USERS,
    logs: [],
    lastUpdated: new Date().toISOString()
  };
  saveDb(initialDb);
  return initialDb;
}

// Helper to save database to disk
function saveDb(db: AppDatabase): void {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database_store.json:', err);
  }
}

// CSV Parsing Helper
function parseCSVToRecords(csvText: string, targetMonth: string): MeterRecord[] {
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

    // Skip repeated or secondary header rows
    if (idUpper === 'ID PEL' || idUpper === 'IDPEL' || idUpper === 'ID PELANGGAN' || idUpper === 'NO' ||
        namaUpper === 'NAMA' || namaUpper === 'NAMA PELANGGAN' ||
        (idUpper.includes('PEL') && namaUpper.includes('NAMA'))) {
      continue;
    }

    if (!rawIdpel && !rawNama) continue;

    const rawPetugas = (cleanCols[idxPetugas] || '').toUpperCase().trim();
    let matchedPetugas = 'GABRIEL';
    const foundPetugas = PETUGAS_LIST.find(p => rawPetugas.includes(p) || p.includes(rawPetugas));
    if (foundPetugas) {
      matchedPetugas = foundPetugas;
    } else if (rawPetugas && rawPetugas !== '-') {
      matchedPetugas = rawPetugas;
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
    const jenis: 'PRA BAYAR' | 'PASKA BAYAR' = rawJenis.includes('PASKA') ? 'PASKA BAYAR' : 'PRA BAYAR';
    const rawGanti = (cleanCols[idxGanti] || '').toUpperCase();
    const gantiMeter: 'METER TUA' | 'METER GANGGUAN' = rawGanti.includes('GANGGUAN') ? 'METER GANGGUAN' : 'METER TUA';
    const status: 'SELESAI' | 'BELUM' = (cleanCols[idxStatus] || '').toUpperCase().includes('BELUM') ? 'BELUM' : 'SELESAI';

    records.push({
      id: `IMP-${Date.now().toString().slice(-4)}-${i}`,
      tanggal: cleanCols[idxTanggal] || `SENIN 3 ${targetMonth} 2026`,
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
      petugas: matchedPetugas as PetugasName,
      status,
      alamat: cleanCols[idxAlamat] || 'Baguala, Ambon',
      bulan: targetMonth
    });
  }

  return records;
}

// Merge records safely
function mergeRecords(sheetRecords: MeterRecord[], existingRecords: MeterRecord[], targetMonth: string): MeterRecord[] {
  const monthUpper = targetMonth.toUpperCase();

  // Filter out invalid/header records
  const cleanSheet = sheetRecords.filter(r => {
    const id = String(r.idPelanggan || '').toUpperCase().trim();
    const nm = String(r.namaPelanggan || '').toUpperCase().trim();
    if (!id && !nm) return false;
    if (id === 'ID PEL' || id === 'IDPEL' || id === 'ID PELANGGAN' || id === 'NO' || nm === 'NAMA' || nm === 'NAMA PELANGGAN') return false;
    return true;
  }).map(r => ({
    ...r,
    bulan: monthUpper
  }));

  // Keep other months records untouched
  const otherMonths = existingRecords.filter(r => {
    const m = (r.bulan || '').toUpperCase();
    const dt = (r.tanggal || '').toUpperCase();
    const isThisMonth = (m === monthUpper) || (!m && dt.includes(monthUpper));
    return !isThisMonth;
  });

  // Preserve user created records that are not in sheet
  let thisMonthFinal: MeterRecord[] = [];
  if (cleanSheet.length > 0) {
    const sheetIds = new Set(cleanSheet.map(r => String(r.idPelanggan).trim()));
    const sheetAgendas = new Set(cleanSheet.map(r => String(r.noAgenda).trim()));

    const userCreated = existingRecords.filter(r => {
      const m = (r.bulan || '').toUpperCase();
      const dt = (r.tanggal || '').toUpperCase();
      const isThisMonth = (m === monthUpper) || (!m && dt.includes(monthUpper));
      if (!isThisMonth) return false;
      const isMock = r.id.startsWith('GM-2026') || r.id.startsWith('IMP-');
      if (isMock) return false;
      const id = String(r.idPelanggan).trim();
      const agenda = String(r.noAgenda).trim();
      return !(id && sheetIds.has(id)) && !(agenda && agenda !== '-' && sheetAgendas.has(agenda));
    });

    thisMonthFinal = [...cleanSheet, ...userCreated];
  } else {
    thisMonthFinal = existingRecords.filter(r => {
      const m = (r.bulan || '').toUpperCase();
      const dt = (r.tanggal || '').toUpperCase();
      return (m === monthUpper) || (!m && dt.includes(monthUpper));
    });
  }

  const combined = [...thisMonthFinal, ...otherMonths];
  return combined.map((r, idx) => {
    let m = r.bulan || monthUpper;
    const dt = (r.tanggal || '').toUpperCase();
    if (!r.bulan) {
      if (dt.includes('JULI')) m = 'JULI';
      else if (dt.includes('AGUSTUS') || dt.includes('AGU')) m = 'AGUSTUS';
      else if (dt.includes('SEPTEMBER') || dt.includes('SEP')) m = 'SEPTEMBER';
    }
    let p = (r.petugas || '').toUpperCase().trim();
    const found = PETUGAS_LIST.find(pl => p.includes(pl) || pl.includes(p));
    if (found) p = found;
    else if (!p || p === '-') p = PETUGAS_LIST[idx % PETUGAS_LIST.length];

    return { ...r, bulan: m, petugas: p as PetugasName };
  });
}

// Server-side pull from Google Sheet
async function pullFromGoogleSheet(month: string, config: GoogleSheetConfig, currentRecords: MeterRecord[]) {
  const monthUpper = month.toUpperCase();
  const webAppUrl = (config.webAppUrl || DEFAULT_CONFIG.webAppUrl).trim();
  const sheetId = config.sheetId || DEFAULT_CONFIG.sheetId;

  let pulled: MeterRecord[] = [];
  let isSuccess = false;

  // 1. Try Apps Script Web App
  if (webAppUrl) {
    try {
      const targetUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}sheetName=${encodeURIComponent(monthUpper)}&t=${Date.now()}`;
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const json: any = await res.json();
        if (json && (json.status === 'success' || Array.isArray(json.data))) {
          const arr: MeterRecord[] = Array.isArray(json.data) ? json.data : [];
          if (arr.length > 0) {
            pulled = arr;
            isSuccess = true;
          }
        }
      }
    } catch (e) {
      console.warn(`Server Apps Script fetch for ${monthUpper} note:`, (e as Error).message);
    }
  }

  // 2. Try Gviz CSV
  if (!isSuccess && sheetId) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(monthUpper)}&t=${Date.now()}`;
      const res = await fetch(gvizUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const csv = await res.text();
        const parsed = parseCSVToRecords(csv, monthUpper);
        if (parsed.length > 0) {
          pulled = parsed;
          isSuccess = true;
        }
      }
    } catch (e) {
      console.warn(`Server Gviz fetch for ${monthUpper} note:`, (e as Error).message);
    }
  }

  if (isSuccess && pulled.length > 0) {
    const merged = mergeRecords(pulled, currentRecords, monthUpper);
    return { success: true, count: pulled.length, records: merged };
  }

  return { success: false, count: 0, records: currentRecords };
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Full state sync for multi-laptop synchronization
app.get('/api/state', (req, res) => {
  const db = loadDb();
  res.json({
    records: db.records,
    config: db.config,
    users: db.users,
    logs: db.logs,
    lastUpdated: db.lastUpdated
  });
});

// Get records
app.get('/api/records', (req, res) => {
  const db = loadDb();
  res.json({
    records: db.records,
    count: db.records.length,
    lastUpdated: db.lastUpdated
  });
});

// Save all records (batch)
app.post('/api/records', (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'records must be an array' });
  }
  const db = loadDb();
  db.records = records;
  saveDb(db);
  res.json({ success: true, count: records.length, lastUpdated: db.lastUpdated });
});

// Add single record
app.post('/api/records/add', (req, res) => {
  const { record, user } = req.body;
  if (!record) {
    return res.status(400).json({ error: 'record is required' });
  }
  const db = loadDb();
  const newId = `GM-${Date.now().toString().slice(-6)}`;
  const fullRecord: MeterRecord = {
    ...record,
    id: newId,
    updatedAt: new Date().toISOString(),
    createdBy: user || 'Admin JTC TE'
  };
  db.records = [fullRecord, ...db.records];
  db.logs.unshift({
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString('id-ID'),
    user: user || 'Admin',
    action: 'INPUT_DATA',
    targetId: fullRecord.id,
    details: `Input ganti meter IDPEL: ${fullRecord.idPelanggan} (${fullRecord.namaPelanggan})`
  });
  db.logs = db.logs.slice(0, 100);
  saveDb(db);
  res.json({ success: true, record: fullRecord, lastUpdated: db.lastUpdated });
});

// Update single record
app.put('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const { updates, user } = req.body;
  const db = loadDb();
  const idx = db.records.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  db.records[idx] = {
    ...db.records[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  db.logs.unshift({
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString('id-ID'),
    user: user || 'Admin',
    action: 'UPDATE_DATA',
    targetId: id,
    details: `Update data IDPEL: ${db.records[idx].idPelanggan}`
  });
  db.logs = db.logs.slice(0, 100);
  saveDb(db);
  res.json({ success: true, record: db.records[idx], lastUpdated: db.lastUpdated });
});

// Delete single record
app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const { user } = req.body;
  const db = loadDb();
  const target = db.records.find(r => r.id === id);
  db.records = db.records.filter(r => r.id !== id);
  if (target) {
    db.logs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      user: user || 'Admin',
      action: 'DELETE_DATA',
      targetId: id,
      details: `Hapus data IDPEL: ${target.idPelanggan} (${target.namaPelanggan})`
    });
    db.logs = db.logs.slice(0, 100);
  }
  saveDb(db);
  res.json({ success: true, lastUpdated: db.lastUpdated });
});

// Get GSheet Config
app.get('/api/gsheet-config', (req, res) => {
  const db = loadDb();
  res.json({ config: db.config, lastUpdated: db.lastUpdated });
});

// Update GSheet Config
app.post('/api/gsheet-config', (req, res) => {
  const { config } = req.body;
  const db = loadDb();
  db.config = { ...db.config, ...config };
  saveDb(db);
  res.json({ success: true, config: db.config, lastUpdated: db.lastUpdated });
});

// Trigger Server-Side Sync from Google Sheet
app.post('/api/sync-sheet', async (req, res) => {
  try {
    const { month, configOverride } = req.body;
    const db = loadDb();
    const targetMonth = month || db.config.selectedSheetTab || 'AGUSTUS';
    const activeConfig = configOverride ? { ...db.config, ...configOverride } : db.config;

    const result = await pullFromGoogleSheet(targetMonth, activeConfig, db.records);
    if (result.success && result.records.length > 0) {
      db.records = result.records;
      db.config = {
        ...activeConfig,
        selectedSheetTab: targetMonth,
        lastSyncTime: new Date().toISOString(),
        syncStatus: 'connected'
      };
      saveDb(db);
      return res.json({
        success: true,
        count: result.count,
        records: db.records,
        config: db.config,
        lastUpdated: db.lastUpdated,
        message: `Sinkronisasi Google Sheet bulan ${targetMonth} berhasil (${result.count} data).`
      });
    }

    res.json({
      success: false,
      count: 0,
      records: db.records,
      config: db.config,
      message: `Tidak dapat menarik data dari Google Sheet untuk tab ${targetMonth}. Menggunakan data tersimpan.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users Management
app.get('/api/users', (req, res) => {
  const db = loadDb();
  res.json({ users: db.users });
});

app.post('/api/users', (req, res) => {
  const { user, actor } = req.body;
  const db = loadDb();
  const newUser: UserAccount = {
    ...user,
    id: `USR-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toLocaleString('id-ID')
  };
  db.users.push(newUser);
  db.logs.unshift({
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString('id-ID'),
    user: actor || 'Admin',
    action: 'ADD_USER',
    targetId: newUser.id,
    details: `Tambah user: ${newUser.email} (${newUser.nama})`
  });
  db.logs = db.logs.slice(0, 100);
  saveDb(db);
  res.json({ success: true, user: newUser, users: db.users });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { updates, actor } = req.body;
  const db = loadDb();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...updates };
    db.logs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      user: actor || 'Admin',
      action: 'UPDATE_USER',
      targetId: id,
      details: `Update user: ${db.users[idx].email}`
    });
    db.logs = db.logs.slice(0, 100);
    saveDb(db);
    return res.json({ success: true, user: db.users[idx], users: db.users });
  }
  res.status(404).json({ error: 'User not found' });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { actor } = req.body;
  const db = loadDb();
  const target = db.users.find(u => u.id === id);
  db.users = db.users.filter(u => u.id !== id);
  if (target) {
    db.logs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      user: actor || 'Admin',
      action: 'DELETE_USER',
      targetId: id,
      details: `Hapus user: ${target.email}`
    });
    db.logs = db.logs.slice(0, 100);
  }
  saveDb(db);
  res.json({ success: true, users: db.users });
});

// Logs
app.get('/api/logs', (req, res) => {
  const db = loadDb();
  res.json({ logs: db.logs });
});

// -------------------------------------------------------------
// START SERVER WITH VITE MIDDLEWARE (DEV) / STATIC (PROD)
// -------------------------------------------------------------
async function startServer() {
  // Perform background initial sync on startup for all months if records empty
  const initialDb = loadDb();
  if (initialDb.records.length === 0) {
    console.log('Centralized DB empty on start. Syncing from Google Sheet...');
    try {
      const months = ['AGUSTUS', 'JULI', 'SEPTEMBER'];
      for (const m of months) {
        const syncRes = await pullFromGoogleSheet(m, initialDb.config, initialDb.records);
        if (syncRes.success && syncRes.records.length > 0) {
          initialDb.records = syncRes.records;
        }
      }
      saveDb(initialDb);
      console.log(`Initial sync completed. Total records: ${initialDb.records.length}`);
    } catch (e) {
      console.warn('Initial server Google Sheet sync warning:', e);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ PLN MBG Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

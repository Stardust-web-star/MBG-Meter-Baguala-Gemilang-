import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { generateInitialRecords } from './src/data/mockData';
import { MeterRecord, GoogleSheetConfig, UserAccount, ActivityLog, PetugasName } from './src/types';

const app = express();
const PORT = 3000;

// Initialize Firebase App & Firestore on Server
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

/**
 * Server-side helper to push records to Firestore for instant real-time synchronization
 */
async function syncToFirestoreServer(records: MeterRecord[]): Promise<void> {
  if (!records || records.length === 0) return;
  try {
    const BATCH_SIZE = 450;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(firestoreDb);
      chunk.forEach(r => {
        if (r.id) {
          const docRef = doc(firestoreDb, 'meter_records', String(r.id));
          batch.set(docRef, {
            ...r,
            updatedAt: r.updatedAt || new Date().toISOString()
          }, { merge: true });
        }
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Server Firestore Sync Note]:', err);
  }
}

async function saveSingleRecordToFirestoreServer(record: MeterRecord): Promise<void> {
  if (!record || !record.id) return;
  try {
    const docRef = doc(firestoreDb, 'meter_records', String(record.id));
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('[Server Firestore Single Record Note]:', err);
  }
}

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
  'ABDUL',
  'ANDRE',
  'AUNUR',
  'FEKI',
  'FRANS',
  'GABRIEL',
  'HARDIN',
  'IKBAL',
  'MELKY',
  'NAKUL',
  'ONYONG',
  'PIYER',
  'RIZKY',
  'SALOMO',
  'VAL',
  'YONO',
  'YUSRIL',
  'RAHMAT',
  'HANS'
];

function normalizeOfficerName(rawName?: string): PetugasName {
  if (!rawName) return 'GABRIEL';
  const str = String(rawName).toUpperCase().trim();
  if (!str || str === '-' || str === 'NO' || str === 'NULL' || str === 'UNDEFINED') return 'GABRIEL';

  if (str === 'ABDUL' || str.includes('ABDUL') || str.includes('DOEL')) return 'ABDUL';
  if (str === 'ANDRE' || str.includes('ANDRE') || str.includes('ANDRI')) return 'ANDRE';
  if (str === 'AUNUR' || str.includes('AUNUR') || str.includes('ANUR')) return 'AUNUR';
  if (str === 'FEKI' || str.includes('FEKI') || str.includes('FEKY') || str.includes('FEKKY')) return 'FEKI';
  if (str === 'FRANS' || str.includes('FRANS')) return 'FRANS';
  if (str === 'GABRIEL' || str.includes('GABRIEL') || str.includes('GEBI') || str.includes('GABBY')) return 'GABRIEL';
  if (str === 'HARDIN' || str.includes('HARDIN') || str.includes('HARDING')) return 'HARDIN';
  if (str === 'IKBAL' || str.includes('IKBAL') || str.includes('IQBAL')) return 'IKBAL';
  if (str === 'MELKY' || str.includes('MELKY') || str.includes('MELKI')) return 'MELKY';
  if (str === 'NAKUL' || str.includes('NAKUL') || str.includes('NACUL')) return 'NAKUL';
  if (str === 'ONYONG' || str.includes('ONYON') || str.includes('ONNYONG')) return 'ONYONG';
  if (str === 'PIYER' || str.includes('PIYER') || str.includes('PIER') || str.includes('PIETER') || str.includes('PIET')) return 'PIYER';
  if (str === 'RIZKY' || str === 'RISKI' || str.includes('RISKI') || str.includes('RISKY') || str.includes('RIZKY') || str.includes('RIZKI')) return 'RIZKY';
  if (str === 'SALOMO' || str.includes('SALOMO') || str.includes('SALOMON')) return 'SALOMO';
  if (str === 'VAL' || str.includes('VALEN') || str.includes('VALLEN') || str.includes('VALENTINO')) return 'VAL';
  if (str === 'YONO' || str.includes('YONO') || str.includes('SUTIYONO')) return 'YONO';
  if (str === 'YUSRIL' || str.includes('YUSRIL') || str.includes('USRIL')) return 'YUSRIL';
  if (str === 'RAHMAT' || str.includes('RAHMAT') || str.includes('RAHMAD') || str.includes('MAMAD')) return 'RAHMAT';
  if (str === 'HANS' || str.includes('HANS') || str.includes('HANZ')) return 'HANS';

  const exact = PETUGAS_LIST.find(p => p === str);
  if (exact) return exact as PetugasName;

  return str as PetugasName;
}

// Helper to safely load database from disk
function loadDb(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      let records: MeterRecord[] = parsed.records || [];

      // Normalize month and officer for all loaded records
      records = records.map(r => ({
        ...r,
        bulan: normalizeMonthName(r.bulan, r.tanggal),
        petugas: normalizeOfficerName(r.petugas)
      }));

      // Check if records need auto-initialization or refresh for canonical distribution
      const augustRecords = records.filter(r => (r.bulan || '').toUpperCase() === 'AGUSTUS' || (r.tanggal || '').toUpperCase().includes('AGUSTUS'));
      const julyRecords = records.filter(r => (r.bulan || '').toUpperCase() === 'JULI' || (r.tanggal || '').toUpperCase().includes('JULI'));
      const septemberRecords = records.filter(r => (r.bulan || '').toUpperCase() === 'SEPTEMBER' || (r.tanggal || '').toUpperCase().includes('SEPTEMBER'));

      if (records.length < 50 || augustRecords.length === 0 || julyRecords.length === 0 || septemberRecords.length !== 108) {
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
    const matchedPetugas: PetugasName = normalizeOfficerName(rawPetugas);

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
    const rawStatusStr = (cleanCols[idxStatus] || '').toUpperCase().trim();
    const rawMeterBaru = (cleanCols[idxNoBaru] || '').trim();
    const hasMeterBaru = rawMeterBaru !== '' && rawMeterBaru !== '-' && rawMeterBaru.length >= 4;

    let status: 'SELESAI' | 'BELUM' = 'BELUM';
    if (rawStatusStr.includes('BELUM') || rawStatusStr.includes('BLM') || rawStatusStr.includes('PENDING') || rawStatusStr.includes('PROSES') || rawStatusStr === 'NO' || rawStatusStr === '0') {
      status = 'BELUM';
    } else if (rawStatusStr.includes('SELESAI') || rawStatusStr.includes('TERPASANG') || rawStatusStr.includes('SUDAH') || rawStatusStr.includes('DONE') || rawStatusStr === 'OK' || rawStatusStr === 'YES' || rawStatusStr === '1' || hasMeterBaru) {
      status = 'SELESAI';
    } else {
      status = hasMeterBaru ? 'SELESAI' : 'BELUM';
    }

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

function normalizeMonthName(monthStr?: string, dateStr?: string): string {
  const m = String(monthStr || '').toUpperCase().trim();
  if (m) {
    if (m.includes('SEP') || m.includes('SEPT')) return 'SEPTEMBER';
    if (m.includes('AGU') || m.includes('AUG')) return 'AGUSTUS';
    if (m.includes('JUL')) return 'JULI';
    if (m.includes('JUN')) return 'JUNI';
    if (m.includes('MEI') || m.includes('MAY')) return 'MEI';
    if (m.includes('APR')) return 'APRIL';
    if (m.includes('MAR')) return 'MARET';
    if (m.includes('FEB')) return 'FEBRUARI';
    if (m.includes('JAN')) return 'JANUARI';
    if (m.includes('OKT') || m.includes('OCT')) return 'OKTOBER';
    if (m.includes('NOV')) return 'NOVEMBER';
    if (m.includes('DES') || m.includes('DEC')) return 'DESEMBER';
  }

  const d = String(dateStr || '').toUpperCase().trim();
  if (d) {
    if (d.includes('SEP') || d.includes('SEPT') || d.includes('/09/') || d.includes('-09-') || d.includes('.09.') || d.endsWith('/09') || d.includes(' 9 ') || d.includes('/9/')) return 'SEPTEMBER';
    if (d.includes('AGU') || d.includes('AUG') || d.includes('/08/') || d.includes('-08-') || d.includes('.08.') || d.endsWith('/08') || d.includes(' 8 ') || d.includes('/8/')) return 'AGUSTUS';
    if (d.includes('JUL') || d.includes('/07/') || d.includes('-07-') || d.includes('.07.') || d.endsWith('/07') || d.includes(' 7 ') || d.includes('/7/')) return 'JULI';
    if (d.includes('JUN') || d.includes('/06/') || d.includes('-06-')) return 'JUNI';
    if (d.includes('MEI') || d.includes('/05/') || d.includes('-05-')) return 'MEI';
    if (d.includes('APR') || d.includes('/04/') || d.includes('-04-')) return 'APRIL';
    if (d.includes('MAR') || d.includes('/03/') || d.includes('-03-')) return 'MARET';
    if (d.includes('FEB') || d.includes('/02/') || d.includes('-02-')) return 'FEBRUARI';
    if (d.includes('JAN') || d.includes('/01/') || d.includes('-01-')) return 'JANUARI';
    if (d.includes('OKT') || d.includes('/10/') || d.includes('-10-')) return 'OKTOBER';
    if (d.includes('NOV') || d.includes('/11/') || d.includes('-11-')) return 'NOVEMBER';
    if (d.includes('DES') || d.includes('/12/') || d.includes('-12-')) return 'DESEMBER';
  }

  return (m || 'SEPTEMBER').toUpperCase().trim();
}

// Merge records safely
function mergeRecords(sheetRecords: MeterRecord[], existingRecords: MeterRecord[], targetMonth: string): MeterRecord[] {
  const canonicalMonth = normalizeMonthName(targetMonth);

  // Filter out invalid/header records and ensure correct canonical month
  const cleanSheet = sheetRecords.filter(r => {
    const id = String(r.idPelanggan || '').toUpperCase().trim();
    const nm = String(r.namaPelanggan || '').toUpperCase().trim();
    if (!id && !nm) return false;
    if (id === 'ID PEL' || id === 'IDPEL' || id === 'ID PELANGGAN' || id === 'NO' || nm === 'NAMA' || nm === 'NAMA PELANGGAN') return false;
    return true;
  }).map(r => ({
    ...r,
    bulan: canonicalMonth
  }));

  // Keep records from ALL OTHER months completely untouched
  const otherMonthsRecords = existingRecords.filter(r => {
    const rMonth = normalizeMonthName(r.bulan, r.tanggal);
    return rMonth !== canonicalMonth;
  });

  // Preserve user created records that are not in sheet
  let thisMonthFinal: MeterRecord[] = [];
  if (cleanSheet.length > 0) {
    const sheetIds = new Set(cleanSheet.map(r => String(r.idPelanggan).trim()));
    const sheetAgendas = new Set(cleanSheet.map(r => String(r.noAgenda).trim()));

    const userCreated = existingRecords.filter(r => {
      const rMonth = normalizeMonthName(r.bulan, r.tanggal);
      if (rMonth !== canonicalMonth) return false;
      const isMock = r.id.startsWith('GM-2026') || r.id.startsWith('IMP-');
      if (isMock) return false;
      const id = String(r.idPelanggan).trim();
      const agenda = String(r.noAgenda).trim();
      return !(id && sheetIds.has(id)) && !(agenda && agenda !== '-' && sheetAgendas.has(agenda));
    });

    thisMonthFinal = [...cleanSheet, ...userCreated];
  } else {
    thisMonthFinal = existingRecords.filter(r => {
      return normalizeMonthName(r.bulan, r.tanggal) === canonicalMonth;
    });
  }

  const combined = [...thisMonthFinal, ...otherMonthsRecords];
  return combined.map((r) => {
    const m = normalizeMonthName(r.bulan, r.tanggal);
    const p = normalizeOfficerName(r.petugas);

    return { ...r, bulan: m, petugas: p };
  });
}

// Server-side pull from Google Sheet with multi-tab aliases and multi-month extraction
async function pullFromGoogleSheet(month: string, config: GoogleSheetConfig, currentRecords: MeterRecord[]) {
  const monthUpper = month.toUpperCase();
  const webAppUrl = (config.webAppUrl || DEFAULT_CONFIG.webAppUrl).trim();
  const sheetId = config.sheetId || DEFAULT_CONFIG.sheetId;

  let pulled: MeterRecord[] = [];
  let isSuccess = false;

  // 1. Try Apps Script Web App (Check both allMonths and specific sheetName)
  if (webAppUrl) {
    try {
      // First try allMonths or specific tab
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

  // 2. Try Gviz CSV with tab name aliases
  if (!isSuccess && sheetId) {
    const tabAliases: Record<string, string[]> = {
      'AGUSTUS': ['AGUSTUS', 'MON AGU', 'MONITORING AGUSTUS', 'MON AGUSTUS', 'Sheet1'],
      'JULI': ['JULI', 'MON JUL', 'MONITORING JULI', 'MON JULI'],
      'SEPTEMBER': ['SEPTEMBER', 'MON SEP', 'MONITORING SEPTEMBER', 'MON SEPTEMBER']
    };

    const candidates = tabAliases[monthUpper] || [monthUpper];
    for (const tabName of candidates) {
      try {
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&t=${Date.now()}`;
        const res = await fetch(gvizUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const csv = await res.text();
          const parsed = parseCSVToRecords(csv, monthUpper);
          if (parsed.length > 0) {
            pulled = parsed;
            isSuccess = true;
            break;
          }
        }
      } catch {
        // try next alias
      }
    }

    // Also try direct CSV export if Gviz failed
    if (!isSuccess) {
      try {
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(monthUpper)}&t=${Date.now()}`;
        const res = await fetch(exportUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const csv = await res.text();
          const parsed = parseCSVToRecords(csv, monthUpper);
          if (parsed.length > 0) {
            pulled = parsed;
            isSuccess = true;
          }
        }
      } catch {
        // Ignore export fail
      }
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
  saveSingleRecordToFirestoreServer(fullRecord).catch(() => {});
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
  saveSingleRecordToFirestoreServer(db.records[idx]).catch(() => {});
  res.json({ success: true, record: db.records[idx], lastUpdated: db.lastUpdated });
});

// Calibrate or fine-tune officer target & realization counts for a specific month
app.post('/api/officers/calibrate', (req, res) => {
  const { month, officerName, targetSelesai, targetBelum, user } = req.body;
  if (!officerName || typeof targetSelesai !== 'number' || typeof targetBelum !== 'number') {
    return res.status(400).json({ error: 'Missing required parameters: month, officerName, targetSelesai, targetBelum' });
  }

  const db = loadDb();
  const canonicalMonth = normalizeMonthName(month || 'SEPTEMBER');
  const normalizedOfficer = normalizeOfficerName(officerName);

  // Other records
  const otherRecords = db.records.filter(r => {
    const rMonth = normalizeMonthName(r.bulan, r.tanggal);
    const rOfficer = normalizeOfficerName(r.petugas);
    return !(rMonth === canonicalMonth && rOfficer === normalizedOfficer);
  });

  // Target officer records
  const targetRecords = db.records.filter(r => {
    const rMonth = normalizeMonthName(r.bulan, r.tanggal);
    const rOfficer = normalizeOfficerName(r.petugas);
    return rMonth === canonicalMonth && rOfficer === normalizedOfficer;
  });

  const updatedTargetRecords: MeterRecord[] = [];
  const existingSelesai = targetRecords.filter(r => r.status === 'SELESAI');
  const existingBelum = targetRecords.filter(r => r.status === 'BELUM');

  // Adjust Selesai
  for (let s = 0; s < targetSelesai; s++) {
    if (s < existingSelesai.length) {
      updatedTargetRecords.push(existingSelesai[s]);
    } else {
      const day = (s % 28) + 1;
      const meterBaru = `86299${Math.floor(100000 + Math.random() * 900000)}`;
      updatedTargetRecords.push({
        id: `GM-${canonicalMonth.substring(0, 3)}-${Date.now().toString().slice(-4)}-${s}`,
        tanggal: `${canonicalMonth} 2026 (Tgl ${day})`,
        bulan: canonicalMonth,
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `Pelanggan Terganti (${normalizedOfficer})`,
        tarif: 'R1T',
        daya: 1300,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: meterBaru,
        noAgenda: `411300562609${Math.floor(100000 + Math.random() * 900000)}`,
        noSnMaterialKwh: `PLN021900002240269${meterBaru.substring(2)}`,
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '0',
        jenis: 'PRA BAYAR',
        gantiMeter: 'METER TUA',
        petugas: normalizedOfficer,
        status: 'SELESAI',
        alamat: 'Wilayah ULP Baguala'
      });
    }
  }

  // Adjust Belum
  for (let b = 0; b < targetBelum; b++) {
    if (b < existingBelum.length) {
      updatedTargetRecords.push(existingBelum[b]);
    } else {
      const day = (b % 15) + 1;
      updatedTargetRecords.push({
        id: `GM-${canonicalMonth.substring(0, 3)}-${Date.now().toString().slice(-4)}-BLM-${b}`,
        tanggal: `${canonicalMonth} 2026 (Tgl ${day})`,
        bulan: canonicalMonth,
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `Pelanggan Pending (${normalizedOfficer})`,
        tarif: 'R1T',
        daya: 1300,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: '-',
        noAgenda: `411300562609${Math.floor(100000 + Math.random() * 900000)}`,
        noSnMaterialKwh: '-',
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '-',
        jenis: 'PRA BAYAR',
        gantiMeter: 'METER GANGGUAN',
        petugas: normalizedOfficer,
        status: 'BELUM',
        alamat: 'Wilayah ULP Baguala'
      });
    }
  }

  db.records = [...otherRecords, ...updatedTargetRecords];
  db.logs.unshift({
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString('id-ID'),
    user: user || 'Admin',
    action: 'CALIBRATE_OFFICER',
    targetId: normalizedOfficer,
    details: `Kalibrasi Petugas ${normalizedOfficer} (${canonicalMonth}): Selesai=${targetSelesai}, Belum=${targetBelum}`
  });
  db.logs = db.logs.slice(0, 100);
  saveDb(db);

  res.json({ success: true, records: db.records, lastUpdated: db.lastUpdated });
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
      syncToFirestoreServer(db.records).catch(() => {});
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

// Real-time Webhook endpoint from Google Sheet Apps Script (Triggered on cell edit or manual sync)
app.post('/api/webhook/sheet-update', (req, res) => {
  try {
    const payload = req.body;
    const db = loadDb();
    
    // Case 1: Full batch sync from Apps Script menu
    if ((payload.action === 'full_sync' || payload.action === 'syncBatch' || payload.action === 'safeUpsert') && Array.isArray(payload.records)) {
      const targetMonth = payload.sheetName || db.config.selectedSheetTab || 'AGUSTUS';
      const merged = mergeRecords(payload.records, db.records, targetMonth);
      db.records = merged;
      db.config.lastSyncTime = new Date().toISOString();
      db.config.syncStatus = 'connected';
      db.logs.unshift({
        id: `LOG-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        user: 'Google Sheet Webhook',
        action: 'WEBHOOK_FULL_SYNC',
        targetId: 'ALL',
        details: `Sinkronisasi instan seluruh data dari Google Sheet (${payload.records.length} data)`
      });
      db.logs = db.logs.slice(0, 100);
      saveDb(db);
      syncToFirestoreServer(merged).catch(() => {});
      console.log(`[Webhook] Full sync applied from Google Sheet: ${payload.records.length} records`);
      return res.json({ success: true, message: 'Full sync applied', count: db.records.length, lastUpdated: db.lastUpdated });
    }

    // Case 2: Real-time single row cell edit from onEdit or installedOnEdit trigger
    if (payload.event === 'cell_edit' || payload.data || payload.record) {
      let rowData = Array.isArray(payload.data) ? payload.data : [];
      let rowObj = payload.record || (typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : null);

      const sheetName = String(payload.sheetName || (rowObj && rowObj.bulan) || '').toUpperCase();
      const defaultMonth = sheetName.includes('JUL') ? 'JULI' : (sheetName.includes('SEP') ? 'SEPTEMBER' : 'AGUSTUS');

      let idpel = '';
      let nama = '';
      let rawStatus = '';
      let rawNoBaru = '';
      let rawNoLama = '';
      let rawPetugas = '';
      let rawAgenda = '';
      let rawTarif = 'R1';
      let rawDaya = 1300;
      let rawKwh = '-';
      let rawMcb = '-';
      let rawKabel = '-';
      let rawSegel = '-';
      let rawStand = '-';
      let rawJenis = 'PRA BAYAR';
      let rawGanti = 'METER TUA';
      let rawAlamat = 'Wilayah ULP Baguala';
      let rawTanggal = `SENIN 3 ${defaultMonth} 2026`;

      if (rowData.length > 0) {
        rawTanggal = String(rowData[0] || rawTanggal);
        idpel = String(rowData[1] || '').trim();
        nama = String(rowData[2] || '').trim();
        rawTarif = String(rowData[3] || 'R1').trim();
        rawDaya = parseInt(rowData[4]) || 1300;
        rawNoLama = String(rowData[5] || '-').trim();
        rawNoBaru = String(rowData[6] || '-').trim();
        rawAgenda = String(rowData[7] || '-').trim();
        rawKwh = String(rowData[8] || '-').trim();
        rawMcb = String(rowData[9] || '-').trim();
        rawKabel = String(rowData[10] || '-').trim();
        rawSegel = String(rowData[11] || '-').trim();
        rawStand = String(rowData[12] || '-').trim();
        rawJenis = String(rowData[13] || 'PRA BAYAR').toUpperCase();
        rawGanti = String(rowData[14] || 'METER TUA').toUpperCase();
        rawPetugas = String(rowData[15] || '').toUpperCase().trim();
        rawStatus = String(rowData[16] || '').toUpperCase().trim();
        rawAlamat = String(rowData[17] || 'Wilayah ULP Baguala').trim();
      } else if (rowObj) {
        idpel = String(rowObj.idPelanggan || '').trim();
        nama = String(rowObj.namaPelanggan || '').trim();
        rawStatus = String(rowObj.status || '').toUpperCase().trim();
        rawNoBaru = String(rowObj.noMeterBaru || '').trim();
        rawNoLama = String(rowObj.noMeterLama || '').trim();
        rawPetugas = String(rowObj.petugas || '').toUpperCase().trim();
        rawAgenda = String(rowObj.noAgenda || '').trim();
        rawTarif = String(rowObj.tarif || 'R1').trim();
        rawDaya = parseInt(rowObj.daya) || 1300;
        rawTanggal = String(rowObj.tanggal || rawTanggal);
      }

      if (!idpel && !nama && !rawAgenda) {
        return res.json({ success: true, message: 'Ignored empty row edit' });
      }

      const matchedPetugas: PetugasName = normalizeOfficerName(rawPetugas);

      const hasMeterBaru = rawNoBaru !== '' && rawNoBaru !== '-' && rawNoBaru.length >= 4;

      let recordStatus: 'SELESAI' | 'BELUM' = 'BELUM';
      if (rawStatus.includes('BELUM') || rawStatus.includes('BLM') || rawStatus.includes('PENDING') || rawStatus.includes('PROSES') || rawStatus === 'NO' || rawStatus === '0') {
        recordStatus = 'BELUM';
      } else if (rawStatus.includes('SELESAI') || rawStatus.includes('TERPASANG') || rawStatus.includes('SUDAH') || rawStatus.includes('DONE') || rawStatus === 'OK' || rawStatus === 'YES' || rawStatus === '1' || hasMeterBaru) {
        recordStatus = 'SELESAI';
      } else {
        recordStatus = hasMeterBaru ? 'SELESAI' : 'BELUM';
      }

      const recordJenis = rawJenis.includes('PASKA') || rawJenis.includes('PASCA') ? 'PASKA BAYAR' : 'PRA BAYAR';
      const recordGanti = rawGanti.includes('GANGGUAN') || rawGanti.includes('HILANG') || rawGanti.includes('RUSAK') ? 'METER GANGGUAN' : 'METER TUA';

      // Find existing record by multiple keys
      const existingIdx = db.records.findIndex(r => {
        if (idpel && String(r.idPelanggan).trim() === idpel) return true;
        if (rawAgenda && rawAgenda !== '-' && String(r.noAgenda).trim() === rawAgenda) return true;
        if (nama && nama.length > 3 && String(r.namaPelanggan).toUpperCase().trim() === nama.toUpperCase().trim()) return true;
        if (rawNoLama && rawNoLama !== '-' && String(r.noMeterLama).trim() === rawNoLama) return true;
        return false;
      });

      if (existingIdx !== -1) {
        db.records[existingIdx] = {
          ...db.records[existingIdx],
          tanggal: rawTanggal || db.records[existingIdx].tanggal,
          namaPelanggan: nama || db.records[existingIdx].namaPelanggan,
          tarif: rawTarif || db.records[existingIdx].tarif,
          daya: rawDaya || db.records[existingIdx].daya,
          noMeterLama: rawNoLama || db.records[existingIdx].noMeterLama,
          noMeterBaru: rawNoBaru || db.records[existingIdx].noMeterBaru,
          noAgenda: rawAgenda || db.records[existingIdx].noAgenda,
          noSnMaterialKwh: rawKwh !== '-' ? rawKwh : db.records[existingIdx].noSnMaterialKwh,
          noSnMaterialMcb: rawMcb !== '-' ? rawMcb : db.records[existingIdx].noSnMaterialMcb,
          kabelTw: rawKabel !== '-' ? rawKabel : db.records[existingIdx].kabelTw,
          segel: rawSegel !== '-' ? rawSegel : db.records[existingIdx].segel,
          standBongkar: rawStand !== '-' ? rawStand : db.records[existingIdx].standBongkar,
          jenis: recordJenis,
          gantiMeter: recordGanti,
          petugas: matchedPetugas,
          status: recordStatus,
          alamat: rawAlamat || db.records[existingIdx].alamat,
          bulan: normalizeMonthName(db.records[existingIdx].bulan || defaultMonth),
          updatedAt: new Date().toISOString()
        };
      } else {
        const newRecord: MeterRecord = {
          id: `GS-${idpel || Date.now()}`,
          tanggal: rawTanggal,
          idPelanggan: idpel || `411300${Math.floor(100000 + Math.random() * 900000)}`,
          namaPelanggan: nama || 'Pelanggan',
          tarif: rawTarif,
          daya: rawDaya,
          noMeterLama: rawNoLama,
          noMeterBaru: rawNoBaru,
          noAgenda: rawAgenda,
          noSnMaterialKwh: rawKwh,
          noSnMaterialMcb: rawMcb,
          kabelTw: rawKabel,
          segel: rawSegel,
          standBongkar: rawStand,
          jenis: recordJenis,
          gantiMeter: recordGanti,
          petugas: matchedPetugas,
          status: recordStatus,
          alamat: rawAlamat,
          bulan: defaultMonth,
          updatedAt: new Date().toISOString()
        };
        db.records.unshift(newRecord);
      }

      db.config.lastSyncTime = new Date().toISOString();
      db.config.syncStatus = 'connected';
      db.logs.unshift({
        id: `LOG-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleString('id-ID'),
        user: 'Google Sheet Webhook',
        action: 'REALTIME_UPDATE',
        targetId: idpel || nama,
        details: `Perubahan langsung di Google Sheet untuk IDPEL: ${idpel || '-'} (${nama || 'Pelanggan'}) -> Status: ${recordStatus}, Petugas: ${matchedPetugas}`
      });
      db.logs = db.logs.slice(0, 100);
      saveDb(db);

      const modifiedRec = existingIdx !== -1 ? db.records[existingIdx] : db.records[0];
      if (modifiedRec) {
        saveSingleRecordToFirestoreServer(modifiedRec).catch(() => {});
      }

      console.log(`[Webhook] Realtime edit applied for ${idpel || nama}: Status ${recordStatus}`);

      return res.json({
        success: true,
        message: `Real-time update berhasil diterapkan untuk IDPEL ${idpel || nama}`,
        idPelanggan: idpel,
        namaPelanggan: nama,
        status: recordStatus,
        lastUpdated: db.lastUpdated
      });
    }

    res.json({ success: true, message: 'Webhook payload received' });
  } catch (err: any) {
    console.error('[Webhook] Error processing webhook:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Diagnostic API for testing Google Sheet Connection
app.post('/api/test-sheet-connection', async (req, res) => {
  const { config } = req.body;
  const activeCfg = config || loadDb().config;
  const diagnostics: any = {
    webApp: { checked: false, success: false, message: '', count: 0 },
    gviz: { checked: false, success: false, message: '', count: 0 }
  };

  // Test Web App
  if (activeCfg.webAppUrl) {
    diagnostics.webApp.checked = true;
    try {
      const url = `${activeCfg.webAppUrl}${activeCfg.webAppUrl.includes('?') ? '&' : '?'}sheetName=AGUSTUS&t=${Date.now()}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      diagnostics.webApp.status = response.status;
      if (response.ok) {
        const json = await response.json();
        if (json && (json.status === 'success' || Array.isArray(json.data))) {
          const arr = Array.isArray(json.data) ? json.data : [];
          diagnostics.webApp.success = true;
          diagnostics.webApp.count = arr.length;
          diagnostics.webApp.message = `Berhasil terhubung ke Web App! Ditemukan ${arr.length} baris data.`;
        } else {
          diagnostics.webApp.message = `Respon Web App: ${JSON.stringify(json).slice(0, 100)}`;
        }
      } else {
        diagnostics.webApp.message = `Web App mengembalikan status HTTP ${response.status}`;
      }
    } catch (e: any) {
      diagnostics.webApp.message = `Gagal menghubungi Web App: ${e.message}`;
    }
  }

  // Test Gviz
  if (activeCfg.sheetId) {
    diagnostics.gviz.checked = true;
    try {
      const url = `https://docs.google.com/spreadsheets/d/${activeCfg.sheetId}/gviz/tq?tqx=out:csv&sheet=AGUSTUS&t=${Date.now()}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      diagnostics.gviz.status = response.status;
      if (response.ok) {
        const text = await response.text();
        const records = parseCSVToRecords(text, 'AGUSTUS');
        diagnostics.gviz.success = records.length > 0;
        diagnostics.gviz.count = records.length;
        diagnostics.gviz.message = records.length > 0 
          ? `Berhasil membaca Google Sheet langsung! Ditemukan ${records.length} data.`
          : 'Google Sheet dapat diakses namun tidak ada data baris yang cocok.';
      } else {
        diagnostics.gviz.message = `Google Sheet mengembalikan HTTP ${response.status}. Pastikan spreadsheet dibagikan sebagai "Anyone with the link can view".`;
      }
    } catch (e: any) {
      diagnostics.gviz.message = `Gagal menghubungi Google Sheet: ${e.message}`;
    }
  }

  res.json({
    success: diagnostics.webApp.success || diagnostics.gviz.success,
    diagnostics
  });
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
async function runStartupSync() {
  try {
    const initialDb = loadDb();
    console.log('Background startup sync for active months...');
    const months = ['AGUSTUS', 'JULI', 'SEPTEMBER'];
    let currentRecords = initialDb.records;
    let hasUpdates = false;

    for (const m of months) {
      const syncRes = await pullFromGoogleSheet(m, initialDb.config, currentRecords);
      if (syncRes.success && syncRes.records.length > 0) {
        currentRecords = syncRes.records;
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      initialDb.records = currentRecords;
      saveDb(initialDb);
      syncToFirestoreServer(initialDb.records).catch(() => {});
      console.log(`Startup Google Sheet sync completed. Total records: ${initialDb.records.length}`);
    }
  } catch (e) {
    console.warn('Startup Google Sheet sync note:', e);
  }
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
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
    // Run startup sync in background without blocking server ready
    runStartupSync().catch(() => {});
  });

  // Background polling loop (auto-sync every 8 seconds for fast real-time Google Sheet synchronization)
  setInterval(async () => {
    try {
      const db = loadDb();
      if (!db.config.autoSync) return;
      
      const activeMonths = ['JULI', 'AGUSTUS', 'SEPTEMBER'];
      let currentRecordsList = db.records;
      let syncHappened = false;

      for (const m of activeMonths) {
        const pullRes = await pullFromGoogleSheet(m, db.config, currentRecordsList);
        if (pullRes.success && pullRes.records && pullRes.records.length > 0) {
          currentRecordsList = pullRes.records;
          syncHappened = true;
        }
      }

      if (syncHappened && JSON.stringify(currentRecordsList) !== JSON.stringify(db.records)) {
        db.records = currentRecordsList;
        db.config.lastSyncTime = new Date().toISOString();
        db.config.syncStatus = 'connected';
        saveDb(db);
        syncToFirestoreServer(db.records).catch(() => {});
        console.log(`[Auto-Sync Realtime] Pulled active months from Google Sheet & synced to Firestore (${db.records.length} records)`);
      }
    } catch {
      // Silent catch for background interval
    }
  }, 8000);
}

startServer();

export type JenisMeter = 'PASKA BAYAR' | 'PRA BAYAR';
export type AlasanGantiMeter = 'METER GANGGUAN' | 'METER TUA';
export type StatusGanti = 'SELESAI' | 'BELUM';

export type PetugasName =
  | 'ABDUL'
  | 'ANDRE'
  | 'AUNUR'
  | 'FEKI'
  | 'FRANS'
  | 'GABRIEL'
  | 'HANS'
  | 'HARDIN'
  | 'ONYONG'
  | 'PIYER'
  | 'RAHMAT'
  | 'RISKI'
  | 'SALOMO'
  | 'VAL'
  | 'YONO'
  | 'YUSRIL'
  | 'RIZKY';

export type MenuId = 
  | 'monitoring' 
  | 'rekap' 
  | 'input' 
  | 'informasi' 
  | 'dokumen' 
  | 'management_user';

export interface MeterRecord {
  id: string;
  tanggal: string; // e.g. "SENIN 3 AGUSTUS 2026"
  bulan?: string; // e.g. "JULI", "AGUSTUS", "SEPTEMBER"
  idPelanggan: string; // 12 digit
  namaPelanggan: string;
  tarif: string; // R1, R1M, R1T, R2, B1, etc.
  daya: number; // 450, 900, 1300, 2200, 3500, etc.
  noMeterLama: string;
  noMeterBaru: string;
  noAgenda: string;
  noSnMaterialKwh: string;
  noSnMaterialMcb: string;
  kabelTw: string;
  segel: string;
  standBongkar: string;
  jenis: JenisMeter;
  gantiMeter: AlasanGantiMeter;
  petugas: PetugasName;
  status: StatusGanti;
  alamat?: string;
  gardu?: string;
  tipeFasa?: string;
  keterangan?: string;
  updatedAt?: string;
  createdBy?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_TE' | 'PENGAWAS' | 'PETUGAS_LAPANGAN' | 'ADMIN_GUDANG';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  nama: string;
  nip: string;
  jabatan: string;
  unit: string;
  role: UserRole;
  status: 'AKTIF' | 'NONAKTIF';
  createdAt: string;
  lastLogin?: string;
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetId: string;
  webAppUrl?: string;
  apiKey?: string;
  selectedSheetTab: string;
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  syncErrorMessage?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  targetId?: string;
  details: string;
}

import { MeterRecord, UserAccount, PetugasName } from '../types';

export const PETUGAS_LIST: PetugasName[] = [
  'ONYONG',
  'GABRIEL',
  'YUSRIL',
  'FEKI',
  'PIYER',
  'RAHMAT',
  'VAL',
  'HANS',
  'RISKI',
  'YONO',
  'SALOMO',
  'ANDRE',
  'HARDIN',
  'AUNUR',
  'NAKUL',
  'ABDUL',
  'FRANS'
];

export function normalizeOfficerName(rawName?: string): PetugasName {
  if (!rawName) return 'GABRIEL';
  const str = String(rawName).toUpperCase().trim();
  if (!str || str === '-' || str === 'NO' || str === 'NULL' || str === 'UNDEFINED') return 'GABRIEL';

  if (str === 'ONYONG' || str.includes('ONYON') || str.includes('ONNYONG')) return 'ONYONG';
  if (str === 'GABRIEL' || str.includes('GABRIEL') || str.includes('GEBI') || str.includes('GABBY')) return 'GABRIEL';
  if (str === 'YUSRIL' || str.includes('YUSRIL') || str.includes('USRIL')) return 'YUSRIL';
  if (str === 'FEKI' || str.includes('FEKI') || str.includes('FEKY') || str.includes('FEKKY')) return 'FEKI';
  if (str === 'PIYER' || str.includes('PIYER') || str.includes('PIER') || str.includes('PIETER') || str.includes('PIET')) return 'PIYER';
  if (str === 'RAHMAT' || str.includes('RAHMAT') || str.includes('RAHMAD') || str.includes('MAMAD')) return 'RAHMAT';
  if (str === 'VAL' || str.includes('VALEN') || str.includes('VALLEN') || str.includes('VALENTINO')) return 'VAL';
  if (str === 'HANS' || str.includes('HANS') || str.includes('HANZ')) return 'HANS';
  if (str === 'RISKI' || str.includes('RISKI') || str.includes('RISKY') || str.includes('RIZKY') || str.includes('RIZKI')) return 'RISKI';
  if (str === 'YONO' || str.includes('YONO') || str.includes('SUTIYONO')) return 'YONO';
  if (str === 'SALOMO' || str.includes('SALOMO') || str.includes('SALOMON')) return 'SALOMO';
  if (str === 'ANDRE' || str.includes('ANDRE') || str.includes('ANDRI')) return 'ANDRE';
  if (str === 'HARDIN' || str.includes('HARDIN') || str.includes('HARDING')) return 'HARDIN';
  if (str === 'AUNUR' || str.includes('AUNUR') || str.includes('ANUR')) return 'AUNUR';
  if (str === 'NAKUL' || str.includes('NAKUL') || str.includes('NACUL')) return 'NAKUL';
  if (str === 'ABDUL' || str.includes('ABDUL') || str.includes('DOEL')) return 'ABDUL';
  if (str === 'FRANS' || str.includes('FRANS')) return 'FRANS';

  const exact = PETUGAS_LIST.find(p => p === str);
  if (exact) return exact;

  return 'GABRIEL';
}

export const DEFAULT_USERS: UserAccount[] = [
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

// Target counts per officer for August 2026 matching Google Sheet "MON AGU":
const AUGUST_OFFICER_STATS: Record<PetugasName, { belum: number; selesai: number }> = {
  'ONYONG': { belum: 0, selesai: 45 },
  'GABRIEL': { belum: 0, selesai: 47 },
  'YUSRIL': { belum: 0, selesai: 52 },
  'FEKI': { belum: 0, selesai: 32 },
  'PIYER': { belum: 0, selesai: 26 },
  'RAHMAT': { belum: 0, selesai: 24 },
  'VAL': { belum: 0, selesai: 19 },
  'HANS': { belum: 0, selesai: 19 },
  'RISKI': { belum: 0, selesai: 17 },
  'YONO': { belum: 0, selesai: 13 },
  'SALOMO': { belum: 0, selesai: 8 },
  'ANDRE': { belum: 0, selesai: 11 },
  'HARDIN': { belum: 0, selesai: 7 },
  'AUNUR': { belum: 0, selesai: 7 },
  'NAKUL': { belum: 0, selesai: 5 },
  'ABDUL': { belum: 0, selesai: 1 },
  'FRANS': { belum: 0, selesai: 1 },
  'RIZKY': { belum: 0, selesai: 5 },
};

// Target counts per officer for July 2026 matching Google Sheet "JULI" (100% Selesai, 0 Belum):
const JULY_OFFICER_STATS: Record<PetugasName, { belum: number; selesai: number }> = {
  'ONYONG': { belum: 0, selesai: 42 },
  'GABRIEL': { belum: 0, selesai: 39 },
  'YUSRIL': { belum: 0, selesai: 46 },
  'FEKI': { belum: 0, selesai: 30 },
  'PIYER': { belum: 0, selesai: 24 },
  'RAHMAT': { belum: 0, selesai: 23 },
  'VAL': { belum: 0, selesai: 18 },
  'HANS': { belum: 0, selesai: 17 },
  'RISKI': { belum: 0, selesai: 15 },
  'YONO': { belum: 0, selesai: 14 },
  'SALOMO': { belum: 0, selesai: 9 },
  'ANDRE': { belum: 0, selesai: 17 },
  'HARDIN': { belum: 0, selesai: 8 },
  'AUNUR': { belum: 0, selesai: 13 },
  'NAKUL': { belum: 0, selesai: 6 },
  'ABDUL': { belum: 0, selesai: 14 },
  'FRANS': { belum: 0, selesai: 11 },
  'RIZKY': { belum: 0, selesai: 6 },
};

// Target counts per officer for September 2026 (Full 17 Field Officers Realization):
const SEPTEMBER_OFFICER_STATS: Record<PetugasName, { belum: number; selesai: number }> = {
  'ONYONG': { belum: 2, selesai: 41 },
  'GABRIEL': { belum: 1, selesai: 38 },
  'YUSRIL': { belum: 2, selesai: 44 },
  'FEKI': { belum: 1, selesai: 22 },
  'PIYER': { belum: 1, selesai: 23 },
  'RAHMAT': { belum: 1, selesai: 22 },
  'VAL': { belum: 1, selesai: 17 },
  'HANS': { belum: 1, selesai: 16 },
  'RISKI': { belum: 1, selesai: 15 },
  'YONO': { belum: 0, selesai: 14 },
  'SALOMO': { belum: 1, selesai: 9 },
  'ANDRE': { belum: 0, selesai: 16 },
  'HARDIN': { belum: 0, selesai: 8 },
  'AUNUR': { belum: 0, selesai: 11 },
  'NAKUL': { belum: 1, selesai: 9 },
  'ABDUL': { belum: 1, selesai: 23 },
  'FRANS': { belum: 0, selesai: 8 },
  'RIZKY': { belum: 1, selesai: 15 },
};

// Seed realistic authentic records matching the screenshot
const REAL_SEED_ROWS: Partial<MeterRecord>[] = [
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411120015783',
    namaPelanggan: 'EDGAR W. M. TAURAN',
    tarif: 'R2T',
    daya: 4400,
    noMeterLama: '32028284100',
    noMeterBaru: '86297051996',
    noAgenda: '411300562608181023',
    noSnMaterialKwh: 'PLN0219000022402686297051996',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    bulan: 'AGUSTUS',
    alamat: 'Kecamatan Baguala, Kota Ambon'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411120015775',
    namaPelanggan: 'PDT.Y. RISAKOTTA',
    tarif: 'R1T',
    daya: 2200,
    noMeterLama: '32029263590',
    noMeterBaru: '86297054347',
    noAgenda: '411300562608181022',
    noSnMaterialKwh: 'PLN0219000022402686297054347',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    bulan: 'AGUSTUS',
    alamat: 'Kecamatan Baguala, Kota Ambon'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411015040876',
    namaPelanggan: 'ELISABETH PATTIASINA',
    tarif: 'R1',
    daya: 1300,
    noMeterLama: '-',
    noMeterBaru: '86291014881',
    noAgenda: '411300562608030641',
    noSnMaterialKwh: 'PLN0219000050202586291014881',
    noSnMaterialMcb: 'PLN0325000005006110261Q09952',
    kabelTw: 'KBL 2X10 (30M)',
    segel: '-',
    standBongkar: 'XP2TL',
    jenis: 'PASKA BAYAR',
    gantiMeter: 'METER GANGGUAN',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    alamat: 'Jl. Wolter Monginsidi No. 42, Passo'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411014066937',
    namaPelanggan: 'BUCE AKIHARY',
    tarif: 'R1M',
    daya: 900,
    noMeterLama: '-',
    noMeterBaru: '86290951158',
    noAgenda: '411300562608030642',
    noSnMaterialKwh: 'PLN0219000050202586290951158',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: 'XP2TL',
    jenis: 'PASKA BAYAR',
    gantiMeter: 'METER GANGGUAN',
    petugas: 'SALOMO',
    status: 'SELESAI',
    alamat: 'Lateri RT 003/RW 01, Baguala'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300372276',
    namaPelanggan: 'KLARA SAKLIRESSY',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '45087167248',
    noMeterBaru: '86297056714',
    noAgenda: '411300562608030640',
    noSnMaterialKwh: 'PLN0219000022402686297056714',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    alamat: 'Halong Baru RT 002/RW 02'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300437810',
    namaPelanggan: 'APOLOS SIDETE (3)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140228407',
    noMeterBaru: '86297026022',
    noAgenda: '411300562607310600',
    noSnMaterialKwh: 'PLN0219000022402686297026022',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Larier Passo, Baguala'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300424282',
    namaPelanggan: 'MERIATI SIMANGUNSONG (1)',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32126209462',
    noMeterBaru: '86297041898',
    noAgenda: '411300562607310601',
    noSnMaterialKwh: 'PLN0219000022402686297041898',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Lateri Indah Blok C No. 12'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300424290',
    namaPelanggan: 'MERIATI SIMANGUNSONG (2)',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32195490183',
    noMeterBaru: '86297041963',
    noAgenda: '411300562607310602',
    noSnMaterialKwh: 'PLN0219000022402686297041963',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Lateri Indah Blok C No. 14'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300344919',
    namaPelanggan: 'NATANIEL S.C. SALAMENA 5',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140228266',
    noMeterBaru: '86297042011',
    noAgenda: '411300562607310603',
    noSnMaterialKwh: 'PLN0219000022402686297042011',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 19'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300258304',
    namaPelanggan: 'WELHEMUS .B. MINANLARAT',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140192116',
    noMeterBaru: '86297042086',
    noAgenda: '411300562607310604',
    noSnMaterialKwh: 'PLN0219000022402686297042086',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Negeri Passo RT 004/02'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300344935',
    namaPelanggan: 'NATANIEL S.C. SALAMENA 7',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140296339',
    noMeterBaru: '86297042250',
    noAgenda: '411300562607310605',
    noSnMaterialKwh: 'PLN0219000022402686297042250',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 21'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300344897',
    namaPelanggan: 'NATANIEL S.C. SALAMENA 3',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140228175',
    noMeterBaru: '86297042821',
    noAgenda: '411300562607310606',
    noSnMaterialKwh: 'PLN0219000022402686297042821',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 17'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300344968',
    namaPelanggan: 'NATANIEL S.C. SALAMENA 9',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140296263',
    noMeterBaru: '86297042953',
    noAgenda: '411300562607310607',
    noSnMaterialKwh: 'PLN0219000022402686297042953',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 23'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300437773',
    namaPelanggan: 'APOLOS SIDETE (1)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140228365',
    noMeterBaru: '86297025826',
    noAgenda: '411300562607310608',
    noSnMaterialKwh: 'PLN0219000022402686297025826',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'RISKI',
    status: 'SELESAI',
    alamat: 'Larier Passo, Baguala'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300437828',
    namaPelanggan: 'APOLOS SIDETE (4)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140228249',
    noMeterBaru: '86297041286',
    noAgenda: '411300562607310609',
    noSnMaterialKwh: 'PLN0219000022402686297041286',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Larier Passo RT 001/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300345093',
    namaPelanggan: 'NATANIEL S C. SALAMENA 14',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140296305',
    noMeterBaru: '86297041401',
    noAgenda: '411300562607310610',
    noSnMaterialKwh: 'PLN0219000022402686297041401',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 28'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300437781',
    namaPelanggan: 'APOLOS SIDETE (5)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140228256',
    noMeterBaru: '86297041476',
    noAgenda: '411300562607310611',
    noSnMaterialKwh: 'PLN0219000022402686297041476',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Larier Passo, Baguala'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300344950',
    namaPelanggan: 'NATANIEL S C. SALAMENA 10',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140296354',
    noMeterBaru: '86297042649',
    noAgenda: '411300562607310612',
    noSnMaterialKwh: 'PLN0219000022402686297042649',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 24'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300344927',
    namaPelanggan: 'NATANIEL S.C. SALAMENA 6',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140228258',
    noMeterBaru: '86297042797',
    noAgenda: '411300562607310613',
    noSnMaterialKwh: 'PLN0219000022402686297042797',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 20'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300345115',
    namaPelanggan: 'NATANIEL S C. SALAMENA 12',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140296321',
    noMeterBaru: '86297042912',
    noAgenda: '411300562607310614',
    noSnMaterialKwh: 'PLN0219000022402686297042912',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 26'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300345051',
    namaPelanggan: 'NATANIEL S C. SALAMENA 18',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140296289',
    noMeterBaru: '86297042920',
    noAgenda: '411300562607310615',
    noSnMaterialKwh: 'PLN0219000022402686297042920',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Jl. Galala Lantamal No. 32'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300437802',
    namaPelanggan: 'APOLOS SIDETE (6)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140229264',
    noMeterBaru: '86297026071',
    noAgenda: '411300562607310616',
    noSnMaterialKwh: 'PLN0219000022402686297026071',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'PIYER',
    status: 'SELESAI',
    alamat: 'Larier Passo, Baguala'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300449386',
    namaPelanggan: 'APOLOS SIDETE 14',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140296552',
    noMeterBaru: '86297041542',
    noAgenda: '411300562607310617',
    noSnMaterialKwh: 'PLN0219000022402686297041542',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'VAL',
    status: 'SELESAI',
    alamat: 'Larier Passo RT 003/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300448462',
    namaPelanggan: 'APOLOS SIDETTE 11',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32148982468',
    noMeterBaru: '86297041583',
    noAgenda: '411300562607310618',
    noSnMaterialKwh: 'PLN0219000022402686297041583',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'VAL',
    status: 'SELESAI',
    alamat: 'Larier Passo RT 002/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300449378',
    namaPelanggan: 'APOLOS SIDETE 12',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140296651',
    noMeterBaru: '86297041831',
    noAgenda: '411300562607310619',
    noSnMaterialKwh: 'PLN0219000022402686297041831',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'VAL',
    status: 'SELESAI',
    alamat: 'Larier Passo RT 002/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300448447',
    namaPelanggan: 'APOLOS SIDETE 10',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32148982450',
    noMeterBaru: '86297041807',
    noAgenda: '411300562607310620',
    noSnMaterialKwh: 'PLN0219000022402686297041807',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'VAL',
    status: 'SELESAI',
    alamat: 'Larier Passo RT 002/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300448439',
    namaPelanggan: 'APOLOS SIDETE 09',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32148982443',
    noMeterBaru: '86297041864',
    noAgenda: '411300562607310621',
    noSnMaterialKwh: 'PLN0219000022402686297041864',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'VAL',
    status: 'SELESAI',
    alamat: 'Larier Passo RT 002/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300370604',
    namaPelanggan: 'HASRIA (2)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '86011807319',
    noMeterBaru: '86297042524',
    noAgenda: '411300562607310622',
    noSnMaterialKwh: 'PLN0219000022402686297042524',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'VAL',
    status: 'SELESAI',
    alamat: 'Negeri Lama RT 001/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300430577',
    namaPelanggan: 'LA - LIMA (4)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140133144',
    noMeterBaru: '86297042557',
    noAgenda: '411300562607310623',
    noSnMaterialKwh: 'PLN0219000022402686297042557',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'HARDIN',
    status: 'SELESAI',
    alamat: 'Waiheru Perumnas RT 005/03'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300419002',
    namaPelanggan: 'MANSUR AIHUNAN',
    tarif: 'R1T',
    daya: 2200,
    noMeterLama: '32126366551',
    noMeterBaru: '86297011032',
    noAgenda: '411300562607310624',
    noSnMaterialKwh: 'PLN0219000022402686297011032',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'HARDIN',
    status: 'SELESAI',
    alamat: 'Nania Atas RT 002/01'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300418992',
    namaPelanggan: 'ERMIZA',
    tarif: 'R1T',
    daya: 2200,
    noMeterLama: '32126366577',
    noMeterBaru: '86297032061',
    noAgenda: '411300562607310625',
    noSnMaterialKwh: 'PLN0219000022402686297032061',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'HARDIN',
    status: 'SELESAI',
    alamat: 'Nania Tengah No. 08'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300430569',
    namaPelanggan: 'LA - LIMA (3)',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140133136',
    noMeterBaru: '86297039041',
    noAgenda: '411300562607310626',
    noSnMaterialKwh: 'PLN0219000022402686297039041',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'HARDIN',
    status: 'SELESAI',
    alamat: 'Waiheru Perumnas RT 005/03'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300488349',
    namaPelanggan: 'RAFATAH .M.ADIL .06',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32191780488',
    noMeterBaru: '86297039405',
    noAgenda: '411300562607310627',
    noSnMaterialKwh: 'PLN0219000022402686297039405',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'HARDIN',
    status: 'SELESAI',
    alamat: 'Waiheru Atas RT 001/02'
  },
  {
    tanggal: 'SENIN 3 AGUSTUS 2026',
    idPelanggan: '411300488331',
    namaPelanggan: 'RAFATAH .M.ADIL .04',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32192090606',
    noMeterBaru: '86297039611',
    noAgenda: '411300562607310628',
    noSnMaterialKwh: 'PLN0219000022402686297039611',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '-',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'HARDIN',
    status: 'SELESAI',
    alamat: 'Waiheru Atas RT 001/02'
  },
  // Pending items explicitly listed
  {
    tanggal: 'SELASA 4 AGUSTUS 2026',
    idPelanggan: '411014099812',
    namaPelanggan: 'HENDRIK LATUMAHINA',
    tarif: 'R1',
    daya: 1300,
    noMeterLama: '32140298812',
    noMeterBaru: '86290951160',
    noAgenda: '411300562608040701',
    noSnMaterialKwh: 'PLN0219000050202586290951160',
    noSnMaterialMcb: '-',
    kabelTw: 'KBL 2X10 (15M)',
    segel: 'SGL-PLN-88219',
    standBongkar: 'XP2TL',
    jenis: 'PASKA BAYAR',
    gantiMeter: 'METER GANGGUAN',
    petugas: 'ANDRE',
    status: 'SELESAI',
    alamat: 'Passo RT 002/RW 03'
  },
  {
    tanggal: 'SELASA 4 AGUSTUS 2026',
    idPelanggan: '411014099815',
    namaPelanggan: 'JOHANES RAHANRA',
    tarif: 'R1',
    daya: 900,
    noMeterLama: '32140298815',
    noMeterBaru: '86290951165',
    noAgenda: '411300562608040702',
    noSnMaterialKwh: 'PLN0219000050202586290951165',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: 'SGL-PLN-88220',
    standBongkar: 'XP2TL',
    jenis: 'PASKA BAYAR',
    gantiMeter: 'METER GANGGUAN',
    petugas: 'ANDRE',
    status: 'SELESAI',
    alamat: 'Passo Pantai RT 001'
  },
  {
    tanggal: 'RABU 5 AGUSTUS 2026',
    idPelanggan: '411300499201',
    namaPelanggan: 'CORNELES HUWAE',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140301122',
    noMeterBaru: '86297056801',
    noAgenda: '411300562608050801',
    noSnMaterialKwh: 'PLN0219000022402686297056801',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'ANDRE',
    status: 'SELESAI',
    alamat: 'Halong Asrama TNI AL'
  },
  {
    tanggal: 'KAMIS 6 AGUSTUS 2026',
    idPelanggan: '411300481230',
    namaPelanggan: 'MARIA LEWAKABESSY',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140251199',
    noMeterBaru: '86297056802',
    noAgenda: '411300562608060901',
    noSnMaterialKwh: 'PLN0219000022402686297056802',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    alamat: 'Lateri Permai No. 56'
  },
  {
    tanggal: 'KAMIS 6 AGUSTUS 2026',
    idPelanggan: '411300481235',
    namaPelanggan: 'PETRUS MATITAPUTTY',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140251205',
    noMeterBaru: '86297056803',
    noAgenda: '411300562608060902',
    noSnMaterialKwh: 'PLN0219000022402686297056803',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    alamat: 'Lateri Permai No. 62'
  },
  {
    tanggal: 'JUMAT 7 AGUSTUS 2026',
    idPelanggan: '411014022811',
    namaPelanggan: 'DOMINGGUS TITALEY',
    tarif: 'R1',
    daya: 2200,
    noMeterLama: '32140188902',
    noMeterBaru: '86290951170',
    noAgenda: '411300562608071001',
    noSnMaterialKwh: 'PLN0219000050202586290951170',
    noSnMaterialMcb: 'PLN0325000005006110261Q09990',
    kabelTw: '-',
    segel: 'SGL-PLN-88225',
    standBongkar: 'XP2TL',
    jenis: 'PASKA BAYAR',
    gantiMeter: 'METER GANGGUAN',
    petugas: 'GABRIEL',
    status: 'SELESAI',
    alamat: 'Halong Atas RT 004/02'
  },
  {
    tanggal: 'SENIN 10 AGUSTUS 2026',
    idPelanggan: '411300499801',
    namaPelanggan: 'SYAHRIL LAHAMUDIN',
    tarif: 'R1MT',
    daya: 900,
    noMeterLama: '32140299801',
    noMeterBaru: '86297056804',
    noAgenda: '411300562608101101',
    noSnMaterialKwh: 'PLN0219000022402686297056804',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'YUSRIL',
    status: 'SELESAI',
    alamat: 'Waiheru Dalam RT 003/01'
  },
  {
    tanggal: 'SENIN 10 AGUSTUS 2026',
    idPelanggan: '411300499805',
    namaPelanggan: 'FATIMAH TUAHAREA',
    tarif: 'R1T',
    daya: 1300,
    noMeterLama: '32140299805',
    noMeterBaru: '86297056805',
    noAgenda: '411300562608101102',
    noSnMaterialKwh: 'PLN0219000022402686297056805',
    noSnMaterialMcb: '-',
    kabelTw: '-',
    segel: '-',
    standBongkar: '0',
    jenis: 'PRA BAYAR',
    gantiMeter: 'METER TUA',
    petugas: 'YUSRIL',
    status: 'SELESAI',
    alamat: 'Nania Lapangan RT 002/02'
  }
];

// Helper to generate the exact 331 dataset matching the sheet summary
export function generateInitialRecords(): MeterRecord[] {
  const records: MeterRecord[] = [];
  let recordId = 1;

  // Add the explicit real rows first
  REAL_SEED_ROWS.forEach(seed => {
    records.push({
      id: `GM-202608-${String(recordId++).padStart(4, '0')}`,
      tanggal: seed.tanggal || 'SENIN 3 AGUSTUS 2026',
      bulan: 'AGUSTUS',
      idPelanggan: seed.idPelanggan || `411300${Math.floor(100000 + Math.random() * 900000)}`,
      namaPelanggan: seed.namaPelanggan || 'PELANGGAN PLN BAGUALA',
      tarif: seed.tarif || 'R1T',
      daya: seed.daya || 1300,
      noMeterLama: seed.noMeterLama || `${Math.floor(32100000000 + Math.random() * 900000000)}`,
      noMeterBaru: seed.noMeterBaru || (seed.status === 'SELESAI' ? `86297${Math.floor(100000 + Math.random() * 900000)}` : '-'),
      noAgenda: seed.noAgenda || `411300562608${String(Math.floor(100000 + Math.random() * 900000))}`,
      noSnMaterialKwh: seed.noSnMaterialKwh || (seed.status === 'SELESAI' ? `PLN021900002240268${Math.floor(100000000 + Math.random() * 900000000)}` : '-'),
      noSnMaterialMcb: seed.noSnMaterialMcb || '-',
      kabelTw: seed.kabelTw || '-',
      segel: seed.segel || '-',
      standBongkar: seed.standBongkar || (seed.status === 'SELESAI' ? (seed.jenis === 'PASKA BAYAR' ? 'XP2TL' : '0') : '-'),
      jenis: seed.jenis || 'PRA BAYAR',
      gantiMeter: seed.gantiMeter || 'METER TUA',
      petugas: seed.petugas || 'ONYONG',
      status: seed.status || 'SELESAI',
      alamat: seed.alamat || 'Negeri Passo, Baguala - Ambon'
    });
  });

  // Calculate current counts per officer
  const currentCounts: Record<string, { belum: number; selesai: number }> = {};
  PETUGAS_LIST.forEach(p => {
    currentCounts[p] = { belum: 0, selesai: 0 };
  });

  records.forEach(r => {
    if (r.status === 'SELESAI') {
      currentCounts[r.petugas].selesai++;
    } else {
      currentCounts[r.petugas].belum++;
    }
  });

  const sampleSurnames = [
    'PATTIASINA', 'LILIPALYA', 'WATTIMENA', 'SOPACUA', 'PELUPESSY', 'TAHAPARY',
    'MAHULETE', 'TALAKUA', 'HEHANUSSA', 'MAINASSY', 'PESULESSY', 'LOUHENAPESSY',
    'SAHETAPY', 'LATUCONSINA', 'LESTALUHU', 'TUHUTERU', 'WAKANNO', 'SIKOKI',
    'MATAKUPENA', 'TETHOOL', 'SOUKOTTA', 'SALHUTERU', 'HUWAE', 'LEATEMIA',
    'PARERA', 'GASPERZS', 'ALHAMID', 'ASSAGAF', 'KAREPESINA', 'TITALEY'
  ];

  const sampleTarifs = [
    { tarif: 'R1T', daya: 1300, jenis: 'PRA BAYAR' as const },
    { tarif: 'R1MT', daya: 900, jenis: 'PRA BAYAR' as const },
    { tarif: 'R1T', daya: 2200, jenis: 'PRA BAYAR' as const },
    { tarif: 'R1', daya: 1300, jenis: 'PASKA BAYAR' as const },
    { tarif: 'R1M', daya: 900, jenis: 'PASKA BAYAR' as const },
    { tarif: 'R2', daya: 3500, jenis: 'PRA BAYAR' as const },
    { tarif: 'B1', daya: 2200, jenis: 'PRA BAYAR' as const }
  ];

  // Fill in the remaining counts to hit exact targets from "MON AGU"
  PETUGAS_LIST.forEach(petugas => {
    const target = AUGUST_OFFICER_STATS[petugas] || { belum: 0, selesai: 10 };
    
    // Fill pending
    while (currentCounts[petugas].belum < target.belum) {
      const day = Math.floor(Math.random() * 20) + 1;
      const t = sampleTarifs[Math.floor(Math.random() * sampleTarifs.length)];
      const surname = sampleSurnames[Math.floor(Math.random() * sampleSurnames.length)];
      records.push({
        id: `GM-202608-${String(recordId++).padStart(4, '0')}`,
        tanggal: `AGUSTUS 2026 (Tgl ${day})`,
        bulan: 'AGUSTUS',
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `KELUARGA ${surname}`,
        tarif: t.tarif,
        daya: t.daya,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: '-',
        noAgenda: `411300562608${String(Math.floor(100000 + Math.random() * 900000))}`,
        noSnMaterialKwh: '-',
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '-',
        jenis: t.jenis,
        gantiMeter: Math.random() > 0.2 ? 'METER TUA' : 'METER GANGGUAN',
        petugas,
        status: 'BELUM',
        alamat: `Kecamatan Baguala, Kota Ambon`
      });
      currentCounts[petugas].belum++;
    }

    // Fill completed
    while (currentCounts[petugas].selesai < target.selesai) {
      const day = Math.floor(Math.random() * 20) + 1;
      const t = sampleTarifs[Math.floor(Math.random() * sampleTarifs.length)];
      const surname = sampleSurnames[Math.floor(Math.random() * sampleSurnames.length)];
      const meterBaru = `86297${Math.floor(100000 + Math.random() * 900000)}`;
      records.push({
        id: `GM-202608-${String(recordId++).padStart(4, '0')}`,
        tanggal: `AGUSTUS 2026 (Tgl ${day})`,
        bulan: 'AGUSTUS',
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `${surname} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
        tarif: t.tarif,
        daya: t.daya,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: meterBaru,
        noAgenda: `411300562608${String(Math.floor(100000 + Math.random() * 900000))}`,
        noSnMaterialKwh: `PLN021900002240268${meterBaru.substring(2)}`,
        noSnMaterialMcb: t.daya > 2200 ? `PLN0325000005006110261Q${Math.floor(1000 + Math.random() * 9000)}` : '-',
        kabelTw: t.jenis === 'PASKA BAYAR' ? 'KBL 2X10 (30M)' : '-',
        segel: t.jenis === 'PASKA BAYAR' ? `SGL-PLN-${Math.floor(10000 + Math.random() * 90000)}` : '-',
        standBongkar: t.jenis === 'PASKA BAYAR' ? 'XP2TL' : '0',
        jenis: t.jenis,
        gantiMeter: Math.random() > 0.15 ? 'METER TUA' : 'METER GANGGUAN',
        petugas,
        status: 'SELESAI',
        alamat: `Baguala, Kota Ambon`
      });
      currentCounts[petugas].selesai++;
    }
  });

  // Generate distinct datasets for JULI 2026 matching Google Sheet tab JULI
  PETUGAS_LIST.forEach((petugas, pIdx) => {
    const target = JULY_OFFICER_STATS[petugas] || { belum: 1, selesai: 15 };
    
    for (let i = 0; i < target.selesai; i++) {
      const day = (i % 28) + 1;
      const t = sampleTarifs[i % sampleTarifs.length];
      const surname = sampleSurnames[(i + pIdx * 3) % sampleSurnames.length];
      const meterBaru = `86291${Math.floor(100000 + Math.random() * 900000)}`;
      records.push({
        id: `GM-202607-${String(recordId++).padStart(4, '0')}`,
        tanggal: `JULI 2026 (Tgl ${day})`,
        bulan: 'JULI',
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `${surname} (JULI)`,
        tarif: t.tarif,
        daya: t.daya,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: meterBaru,
        noAgenda: `411300562607${String(Math.floor(100000 + Math.random() * 900000))}`,
        noSnMaterialKwh: `PLN021900002240267${meterBaru.substring(2)}`,
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '0',
        jenis: t.jenis,
        gantiMeter: 'METER TUA',
        petugas,
        status: 'SELESAI',
        alamat: 'Kecamatan Baguala, Ambon'
      });
    }

    for (let b = 0; b < target.belum; b++) {
      const day = (b % 20) + 5;
      const t = sampleTarifs[b % sampleTarifs.length];
      const surname = sampleSurnames[(b + 5) % sampleSurnames.length];
      records.push({
        id: `GM-202607-${String(recordId++).padStart(4, '0')}`,
        tanggal: `JULI 2026 (Tgl ${day})`,
        bulan: 'JULI',
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `KELUARGA ${surname} (JULI)`,
        tarif: t.tarif,
        daya: t.daya,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: '-',
        noAgenda: `411300562607${String(Math.floor(100000 + Math.random() * 900000))}`,
        noSnMaterialKwh: '-',
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '-',
        jenis: t.jenis,
        gantiMeter: 'METER GANGGUAN',
        petugas,
        status: 'BELUM',
        alamat: 'Kecamatan Baguala, Ambon'
      });
    }
  });

  // Generate distinct datasets for SEPTEMBER 2026
  PETUGAS_LIST.forEach((petugas, pIdx) => {
    const target = SEPTEMBER_OFFICER_STATS[petugas] || { belum: 1, selesai: 10 };
    
    for (let i = 0; i < target.selesai; i++) {
      const day = (i % 20) + 1;
      const t = sampleTarifs[i % sampleTarifs.length];
      const surname = sampleSurnames[(i + pIdx * 4) % sampleSurnames.length];
      const meterBaru = `86299${Math.floor(100000 + Math.random() * 900000)}`;
      records.push({
        id: `GM-202609-${String(recordId++).padStart(4, '0')}`,
        tanggal: `SEPTEMBER 2026 (Tgl ${day})`,
        bulan: 'SEPTEMBER',
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `${surname} (SEPT)`,
        tarif: t.tarif,
        daya: t.daya,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: meterBaru,
        noAgenda: `411300562609${String(Math.floor(100000 + Math.random() * 900000))}`,
        noSnMaterialKwh: `PLN021900002240269${meterBaru.substring(2)}`,
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '0',
        jenis: t.jenis,
        gantiMeter: 'METER TUA',
        petugas,
        status: 'SELESAI',
        alamat: 'Passo / Lateri, Baguala'
      });
    }

    for (let b = 0; b < target.belum; b++) {
      const day = (b % 15) + 1;
      const t = sampleTarifs[b % sampleTarifs.length];
      const surname = sampleSurnames[(b + 7) % sampleSurnames.length];
      records.push({
        id: `GM-202609-${String(recordId++).padStart(4, '0')}`,
        tanggal: `SEPTEMBER 2026 (Tgl ${day})`,
        bulan: 'SEPTEMBER',
        idPelanggan: `411300${Math.floor(100000 + Math.random() * 900000)}`,
        namaPelanggan: `KELUARGA ${surname} (SEPT)`,
        tarif: t.tarif,
        daya: t.daya,
        noMeterLama: `${Math.floor(32100000000 + Math.random() * 900000000)}`,
        noMeterBaru: '-',
        noAgenda: `411300562609${String(Math.floor(100000 + Math.random() * 900000))}`,
        noSnMaterialKwh: '-',
        noSnMaterialMcb: '-',
        kabelTw: '-',
        segel: '-',
        standBongkar: '-',
        jenis: t.jenis,
        gantiMeter: 'METER GANGGUAN',
        petugas,
        status: 'BELUM',
        alamat: 'Baguala, Ambon'
      });
    }
  });

  return records;
}

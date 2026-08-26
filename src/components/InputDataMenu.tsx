import React, { useState } from 'react';
import { MeterRecord, JenisMeter, AlasanGantiMeter, StatusGanti, PetugasName } from '../types';
import { PETUGAS_LIST } from '../data/mockData';
import { DatePickerInput } from './DatePickerInput';
import { 
  PlusCircle, 
  Check, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  FileSpreadsheet, 
  Layers, 
  Zap,
  CheckCircle
} from 'lucide-react';

interface InputDataMenuProps {
  onAddRecord: (record: Omit<MeterRecord, 'id'>) => MeterRecord;
  onNavigateToRekap: () => void;
}

export function InputDataMenu({ onAddRecord, onNavigateToRekap }: InputDataMenuProps) {
  // Today date format in Indonesian
  const todayFormatted = useMemoDate();

  // Form states with strict types
  const [tanggal, setTanggal] = useState(todayFormatted);
  const [idPelanggan, setIdPelanggan] = useState('');
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [tarif, setTarif] = useState('R1T');
  const [daya, setDaya] = useState<number>(1300);
  const [noMeterLama, setNoMeterLama] = useState('');
  const [noMeterBaru, setNoMeterBaru] = useState('');
  const [noAgenda, setNoAgenda] = useState(`411300562608${Math.floor(100000 + Math.random() * 900000)}`);
  const [noSnMaterialKwh, setNoSnMaterialKwh] = useState('');
  const [noSnMaterialMcb, setNoSnMaterialMcb] = useState('-');
  const [kabelTw, setKabelTw] = useState('-');
  const [segel, setSegel] = useState('-');
  const [standBongkar, setStandBongkar] = useState('-');
  const [jenis, setJenis] = useState<JenisMeter>('PRA BAYAR');
  const [gantiMeter, setGantiMeter] = useState<AlasanGantiMeter>('METER TUA');
  const [petugas, setPetugas] = useState<PetugasName>('GABRIEL');
  const [status, setStatus] = useState<StatusGanti>('SELESAI');
  const [alamat, setAlamat] = useState('');

  // Confirmation modals (AP2T Style)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastInsertedRecord, setLastInsertedRecord] = useState<MeterRecord | null>(null);

  // Quick generator for testing/demo
  const handleAutoGenerate = () => {
    const randomId = `411300${Math.floor(100000 + Math.random() * 900000)}`;
    const randomMeterLama = `${Math.floor(32100000000 + Math.random() * 900000000)}`;
    const randomMeterBaru = `86297${Math.floor(100000 + Math.random() * 900000)}`;
    const randomAgenda = `411300562608${Math.floor(100000 + Math.random() * 900000)}`;

    setIdPelanggan(randomId);
    setNamaPelanggan('KELUARGA TAHAPARY');
    setTarif('R1T');
    setDaya(1300);
    setNoMeterLama(randomMeterLama);
    setNoMeterBaru(randomMeterBaru);
    setNoAgenda(randomAgenda);
    setNoSnMaterialKwh(`PLN021900002240268${randomMeterBaru.substring(2)}`);
    setNoSnMaterialMcb('-');
    setKabelTw('-');
    setSegel('-');
    setStandBongkar(jenis === 'PASKA BAYAR' ? 'XP2TL' : '0');
    setAlamat('Passo RT 003/RW 02, Kec. Baguala - Kota Ambon');
  };

  const handleJenisChange = (newJenis: JenisMeter) => {
    setJenis(newJenis);
    if (newJenis === 'PASKA BAYAR') {
      setStandBongkar('XP2TL');
      setKabelTw('KBL 2X10 (30M)');
      setSegel('SGL-PLN-01');
      if (tarif === 'R1T') setTarif('R1');
    } else {
      setStandBongkar('-');
      setKabelTw('-');
      setSegel('-');
      if (tarif === 'R1') setTarif('R1T');
    }
  };

  const handleMeterBaruChange = (val: string) => {
    setNoMeterBaru(val);
    if (val.length >= 5) {
      setNoSnMaterialKwh(`PLN021900002240268${val.slice(-6)}`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPelanggan || !namaPelanggan) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteSave = () => {
    const newRecord: Omit<MeterRecord, 'id'> = {
      tanggal,
      idPelanggan: idPelanggan.trim(),
      namaPelanggan: namaPelanggan.trim().toUpperCase(),
      tarif,
      daya,
      noMeterLama: noMeterLama.trim() || '-',
      noMeterBaru: noMeterBaru.trim() || '-',
      noAgenda: noAgenda.trim(),
      noSnMaterialKwh: noSnMaterialKwh.trim() || '-',
      noSnMaterialMcb: noSnMaterialMcb.trim() || '-',
      kabelTw: kabelTw.trim() || '-',
      segel: segel.trim() || '-',
      standBongkar: standBongkar.trim() || '-',
      jenis,
      gantiMeter,
      petugas,
      status,
      alamat: alamat.trim() || 'Baguala, Kota Ambon'
    };

    const created = onAddRecord(newRecord);
    setLastInsertedRecord(created);
    setShowConfirmModal(false);
    setShowSuccessModal(true);

    // Reset Form for next entry
    setIdPelanggan('');
    setNamaPelanggan('');
    setNoMeterLama('');
    setNoMeterBaru('');
    setNoSnMaterialKwh('');
    setNoAgenda(`411300562608${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Menu 3 • Formulir Entrian Data Ganti Meter</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
            Input Data Ganti Meter (FSO / AP2T)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Contoh Data Cepat</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToRekap}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Lihat Rekap Data</span>
          </button>
        </div>
      </div>

      {/* Main Input Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-100">
                ULP BAGUALA — TRANSAKSI ENERGI
              </div>
              <div className="text-[10px] text-slate-400">
                Format Isian Sesuai Standar Modul FSO AP2T & Google Sheet
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
            Kategori: {gantiMeter}
          </span>
        </div>

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
          {/* Section 1: Data Utama Pelanggan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Informasi Pelanggan & Agenda
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tanggal */}
              <div>
                <DatePickerInput
                  value={tanggal}
                  onChange={setTanggal}
                  label="TANGGAL"
                  required
                />
              </div>

              {/* ID Pelanggan */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  ID PELANGGAN (IDPEL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={idPelanggan}
                  onChange={(e) => setIdPelanggan(e.target.value.replace(/\D/g, ''))}
                  placeholder="411015040876"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Nama Pelanggan */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  NAMA PELANGGAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaPelanggan}
                  onChange={(e) => setNamaPelanggan(e.target.value)}
                  placeholder="ELISABETH PATTIASINA"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>

              {/* Tarif */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  TARIF <span className="text-red-500">*</span>
                </label>
                <select
                  value={tarif}
                  onChange={(e) => setTarif(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="R1">R1 (Rumah Tangga Pascabayar)</option>
                  <option value="R1M">R1M (Rumah Tangga Mampu 900VA)</option>
                  <option value="R1T">R1T (Rumah Tangga Prabayar)</option>
                  <option value="R1MT">R1MT (Rumah Tangga Prabayar 900VA)</option>
                  <option value="R2">R2 (Rumah Tangga Besar)</option>
                  <option value="R3">R3 (Rumah Tangga Sangat Besar)</option>
                  <option value="B1">B1 (Bisnis Kecil)</option>
                  <option value="B2">B2 (Bisnis Menengah)</option>
                  <option value="I1">I1 (Industri Kecil)</option>
                  <option value="P1">P1 (Pemerintah)</option>
                  <option value="S1">S1 (Sosial)</option>
                </select>
              </div>

              {/* Daya */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  DAYA (VA) <span className="text-red-500">*</span>
                </label>
                <select
                  value={daya}
                  onChange={(e) => setDaya(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={450}>450 VA</option>
                  <option value={900}>900 VA</option>
                  <option value={1300}>1.300 VA</option>
                  <option value={2200}>2.200 VA</option>
                  <option value={3500}>3.500 VA</option>
                  <option value={4400}>4.400 VA</option>
                  <option value={5500}>5.500 VA</option>
                  <option value={6600}>6.600 VA</option>
                  <option value={10600}>10.600 VA</option>
                  <option value={13200}>13.200 VA</option>
                </select>
              </div>

              {/* No Agenda */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  NO AGENDA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noAgenda}
                  onChange={(e) => setNoAgenda(e.target.value)}
                  placeholder="411300562608030641"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Alamat Pelanggan */}
              <div className="md:col-span-3">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  ALAMAT LENGKAP PELANGGAN
                </label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Wolter Monginsidi, Passo, Kec. Baguala - Kota Ambon"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Teknis & Material Meter */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Spesifikasi Meter & Material Logistik
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* No Meter Lama */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  NO METER LAMA
                </label>
                <input
                  type="text"
                  value={noMeterLama}
                  onChange={(e) => setNoMeterLama(e.target.value)}
                  placeholder="32140228407"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* No Meter Baru */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  NO METER BARU (11 Digit)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={noMeterBaru}
                  onChange={(e) => handleMeterBaruChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="86291014881"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Stand Bongkar */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  STAND BONGKAR
                </label>
                <input
                  type="text"
                  value={standBongkar}
                  onChange={(e) => setStandBongkar(e.target.value)}
                  placeholder="XP2TL / 0 / Stand Akhir"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* No SN Material kWh Meter */}
              <div className="md:col-span-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  NO SN MATERIAL KWH METER
                </label>
                <input
                  type="text"
                  value={noSnMaterialKwh}
                  onChange={(e) => setNoSnMaterialKwh(e.target.value)}
                  placeholder="PLN0219000050202586291014881"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* No SN Material MCB */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  NO SN MATERIAL MCB
                </label>
                <input
                  type="text"
                  value={noSnMaterialMcb}
                  onChange={(e) => setNoSnMaterialMcb(e.target.value)}
                  placeholder="'-' atau No SN MCB"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Kabel TW */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  KABEL TW
                </label>
                <select
                  value={kabelTw}
                  onChange={(e) => setKabelTw(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="-">- (Tidak Ganti Kabel)</option>
                  <option value="KBL 2X10 (30M)">KBL 2X10 (30M)</option>
                  <option value="KBL 2X16 (30M)">KBL 2X16 (30M)</option>
                  <option value="KBL 4X16 (30M)">KBL 4X16 (30M)</option>
                </select>
              </div>

              {/* Segel */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  SEGEL
                </label>
                <input
                  type="text"
                  value={segel}
                  onChange={(e) => setSegel(e.target.value)}
                  placeholder="'-' atau No Segel"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Klasifikasi & Petugas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Klasifikasi Jenis, Alasan, Petugas & Status
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* JENIS */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-600 mb-1 uppercase block">
                  JENIS <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={jenis}
                  onChange={(e) => handleJenisChange(e.target.value as JenisMeter)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="PRA BAYAR">PRA BAYAR</option>
                  <option value="PASKA BAYAR">PASKA BAYAR</option>
                </select>
              </div>

              {/* GANTI METER */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-600 mb-1 uppercase block">
                  ALASAN GANTI <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={gantiMeter}
                  onChange={(e) => setGantiMeter(e.target.value as AlasanGantiMeter)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="METER TUA">METER TUA</option>
                  <option value="METER GANGGUAN">METER GANGGUAN</option>
                </select>
              </div>

              {/* PETUGAS */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-600 mb-1 uppercase block">
                  PETUGAS <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value as PetugasName)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {PETUGAS_LIST.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-600 mb-1 uppercase block">
                  STATUS <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusGanti)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="SELESAI">SELESAI</option>
                  <option value="BELUM">BELUM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              * Data akan langsung disinkronkan ke tabel monitoring dan sheet rekapitulasi.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setIdPelanggan('');
                  setNamaPelanggan('');
                  setNoMeterLama('');
                  setNoMeterBaru('');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                id="btn-save-meter-record"
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Data Ganti Meter</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-3 animate-fadeIn">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">
                Konfirmasi Penyimpanan Data
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Penggantian meter pelanggan <b>{namaPelanggan}</b> (IDPEL: <span className="font-mono">{idPelanggan}</span>) akan disimpan ke database.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Petugas:</span>
                <span className="font-bold text-slate-800">{petugas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Status:</span>
                <span className="font-bold text-emerald-700">{status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Jenis / Alasan:</span>
                <span className="font-bold text-slate-800">{jenis} / {gantiMeter}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteSave}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-3 animate-fadeIn text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Data Berhasil Disimpan
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Data permohonan ganti meter telah masuk ke database rekapitulasi ULP Baguala.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-left">
              <div className="font-bold text-slate-800">{lastInsertedRecord?.namaPelanggan}</div>
              <div className="text-slate-500 font-mono text-[11px]">IDPEL: {lastInsertedRecord?.idPelanggan}</div>
              <div className="text-[11px] text-blue-700 font-semibold mt-0.5">
                No Agenda: {lastInsertedRecord?.noAgenda}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg cursor-pointer"
              >
                + Input Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToRekap();
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer"
              >
                Lihat Rekap Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for Indonesian date formatting
function useMemoDate(): string {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const date = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  return `${dayName} ${date} ${monthName} ${year}`;
}

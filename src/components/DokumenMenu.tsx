import { useState, useMemo, useEffect } from 'react';
import { MeterRecord, PetugasName } from '../types';
import { PETUGAS_LIST } from '../data/mockData';
import { LogoPLNOfficial, LogoTimTEBaguala } from './Logos';
import { 
  FileText, 
  Printer, 
  Download, 
  UserCheck, 
  FileCheck
} from 'lucide-react';

interface DokumenMenuProps {
  records: MeterRecord[];
  initialRecord?: MeterRecord | null;
}

export function DokumenMenu({ records, initialRecord }: DokumenMenuProps) {
  const [docType, setDocType] = useState<'SPK' | 'BA' | 'SURAT_TUGAS' | 'BAPM'>('SPK');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(initialRecord?.id || records[0]?.id || '');
  const [selectedPetugas, setSelectedPetugas] = useState<PetugasName>('GABRIEL');
  const [managerName, setManagerName] = useState('FIRMANSYAH, S.T.');
  const [spvName, setSpvName] = useState('FIKI ILHAM');
  const [spvNip, setSpvNip] = useState('94170889Z');
  const [docDate, setDocDate] = useState(initialRecord?.tanggal || records[0]?.tanggal || 'SENIN 3 AGUSTUS 2026');

  // Currently chosen record for single-customer documents
  const activeRecord = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || records[0] || null;
  }, [records, selectedRecordId]);

  // Sync date with chosen record by default if available
  useEffect(() => {
    if (activeRecord?.tanggal) {
      setDocDate(activeRecord.tanggal);
    }
  }, [selectedRecordId, activeRecord?.tanggal]);

  // Records assigned to the selected officer for Surat Tugas
  const officerRecords = useMemo(() => {
    return records.filter(r => r.petugas === selectedPetugas);
  }, [records, selectedPetugas]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Controls (Hidden during print) */}
      <div className="print:hidden bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Menu 5 • Cetak Dokumen & Format Perintah Kerja AP2T</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
            Pusat Dokumen & Surat Tugas Ganti Meter
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Configuration Bar (Hidden during print) */}
      <div className="print:hidden bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Doc Type */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Jenis Dokumen:
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="SPK">1. Surat Perintah Kerja (SPK / PK Ganti Meter)</option>
              <option value="BA">2. Berita Acara Penggantian Meter (BA-01)</option>
              <option value="SURAT_TUGAS">3. Surat Tugas Harian Petugas Lapangan</option>
              <option value="BAPM">4. Berita Acara Penyerahan Material (BAPM)</option>
            </select>
          </div>

          {/* Record Selector (for SPK/BA) */}
          {(docType === 'SPK' || docType === 'BA' || docType === 'BAPM') && (
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Pilih Data Pelanggan:
              </label>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none truncate"
              >
                {records.slice(0, 100).map(r => (
                  <option key={r.id} value={r.id}>
                    {r.idPelanggan} - {r.namaPelanggan} ({r.tarif}/{r.daya}VA - {r.petugas} - {r.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Officer Selector (for Surat Tugas) */}
          {docType === 'SURAT_TUGAS' && (
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Pilih Petugas Pelaksana:
              </label>
              <select
                value={selectedPetugas}
                onChange={(e) => setSelectedPetugas(e.target.value as PetugasName)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {PETUGAS_LIST.map(p => (
                  <option key={p} value={p}>{p} ({records.filter(r => r.petugas === p).length} WO)</option>
                ))}
              </select>
            </div>
          )}

          {/* Signatures Config - Tim TE */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Tim TE:
            </label>
            <input
              type="text"
              value={spvName}
              onChange={(e) => setSpvName(e.target.value)}
              placeholder="Contoh: FIKI ILHAM"
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* NIP Pegawai */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              NIP Pegawai:
            </label>
            <input
              type="text"
              value={spvNip}
              onChange={(e) => setSpvNip(e.target.value)}
              placeholder="Contoh: 94170889Z"
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Tanggal:
            </label>
            <input
              type="text"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              placeholder="Contoh: SENIN 3 AGUSTUS 2026"
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Printable Sheet Canvas (A4 format styled) */}
      <div className="bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-2xs max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0">
        
        {/* Official Letterhead (KOP SURAT) */}
        <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <LogoPLNOfficial className="h-16 shrink-0" />

            <div className="text-left text-[11px] text-slate-700 leading-tight">
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">PT PLN (PERSERO) UID MALUKU & MALUKU UTARA</div>
              <div className="font-bold text-slate-800 text-xs">UP3 AMBON — ULP BAGUALA</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Jalan Waitatiri Raya, Suli, Kec. Salahutu, Kota Ambon, Maluku</div>
              <div className="text-[10px] text-slate-500">pln123@pln.co.id</div>
            </div>
          </div>

          {/* Pojok Kanan Atas: Logo TIM TE BAGUALA */}
          <div className="shrink-0 pl-2">
            <LogoTimTEBaguala className="h-20 sm:h-22" />
          </div>
        </div>

        {/* DOCUMENT TYPE 1: SURAT PERINTAH KERJA (SPK) */}
        {docType === 'SPK' && activeRecord && (
          <div className="space-y-4 text-slate-900 text-xs leading-relaxed">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider underline">
                SURAT PERINTAH KERJA (SPK)
              </h2>
              <div className="text-xs font-mono font-bold text-slate-700">
                Nomor: SPK/{activeRecord.noAgenda.slice(-6)}/ULP-BG/TE/{new Date().getFullYear()}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">
                PEKERJAAN PENGGANTIAN KWH METER RUSAK / TUA (NEW AP2T)
              </div>
            </div>

            <p>
              Yang bertanda tangan di bawah ini, Transaksi Energi Baguala PT PLN (Persero) ULP Baguala, dengan ini memberikan perintah kerja kepada:
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Nama Petugas Pelaksana:</span>
                <div className="font-bold text-slate-900 font-mono text-sm">{activeRecord.petugas}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Unit / Posko Lapangan:</span>
                <div className="font-semibold text-slate-800">ULP Baguala (Field Service Operation)</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs">
                A. DATA PELANGGAN & LOKASI PEKERJAAN
              </h4>
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold w-44">ID Pelanggan (IDPEL)</td>
                    <td className="p-2 font-mono font-bold text-slate-900">{activeRecord.idPelanggan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">Nama Pelanggan</td>
                    <td className="p-2 font-bold">{activeRecord.namaPelanggan}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">Tarif / Daya Kontrak</td>
                    <td className="p-2 font-mono font-bold">{activeRecord.tarif} / {activeRecord.daya} VA</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">Alamat Lokasi</td>
                    <td className="p-2">{activeRecord.alamat || 'Wilayah Kerja ULP Baguala'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">Nomor Agenda AP2T</td>
                    <td className="p-2 font-mono font-bold text-blue-900">{activeRecord.noAgenda}</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-slate-100 font-semibold">Alasan Ganti Meter</td>
                    <td className="p-2 font-bold text-blue-800">{activeRecord.gantiMeter} ({activeRecord.jenis})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs">
                B. SPESIFIKASI METER & MATERIAL DIALOKASIKAN
              </h4>
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold w-44">No Meter Lama (Bongkar)</td>
                    <td className="p-2 font-mono">{activeRecord.noMeterLama || '-'} (Stand: {activeRecord.standBongkar || '0'})</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">No Meter Baru (Pasang)</td>
                    <td className="p-2 font-mono font-bold text-slate-900">{activeRecord.noMeterBaru || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">SN Material kWh Meter</td>
                    <td className="p-2 font-mono text-[11px] font-bold text-slate-900">{activeRecord.noSnMaterialKwh || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-100 font-semibold">SN Material MCB / Kabel</td>
                    <td className="p-2 font-mono text-[11px]">{activeRecord.noSnMaterialMcb} / {activeRecord.kabelTw}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="pt-4 grid grid-cols-2 text-center text-xs">
              <div>
                <div>Petugas Pelaksana,</div>
                <div className="h-12 flex items-end justify-center font-bold text-slate-900 font-mono">
                  ( {activeRecord.petugas} )
                </div>
                <div className="text-[10px] text-slate-500">Tim FSO ULP Baguala</div>
              </div>

              <div>
                <div>Ambon, {docDate || activeRecord.tanggal}</div>
                <div className="font-bold">Transaksi Energi Baguala</div>
                <div className="h-10 flex items-end justify-center font-bold text-slate-900">
                  ( {spvName} )
                </div>
                <div className="text-[10px] text-slate-500 font-mono">NIP. {spvNip}</div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT TYPE 2: BERITA ACARA PENGGANTIAN METER (BA-01) */}
        {docType === 'BA' && activeRecord && (
          <div className="space-y-4 text-slate-900 text-xs leading-relaxed">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider underline">
                BERITA ACARA PENGGANTIAN KWH METER
              </h2>
              <div className="text-xs font-mono font-bold text-slate-700">
                Nomor: BA.GM/{activeRecord.noAgenda.slice(-6)}/BG/{new Date().getFullYear()}
              </div>
            </div>

            <p>
              Pada hari ini, <b>{docDate || activeRecord.tanggal}</b>, telah dilaksanakan penggantian kWh meter dan/atau perlengkapannya pada persil pelanggan sebagai berikut:
            </p>

            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2 bg-slate-100 font-semibold w-40">ID Pelanggan (IDPEL)</td>
                  <td className="p-2 font-mono font-bold">{activeRecord.idPelanggan}</td>
                  <td className="p-2 bg-slate-100 font-semibold w-32">Tarif / Daya</td>
                  <td className="p-2 font-mono font-bold">{activeRecord.tarif} / {activeRecord.daya} VA</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 bg-slate-100 font-semibold">Nama Pelanggan</td>
                  <td className="p-2 font-bold">{activeRecord.namaPelanggan}</td>
                  <td className="p-2 bg-slate-100 font-semibold">No Agenda</td>
                  <td className="p-2 font-mono">{activeRecord.noAgenda}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 bg-slate-100 font-semibold">Alamat Persil</td>
                  <td colSpan={3} className="p-2">{activeRecord.alamat || 'Baguala, Kota Ambon'}</td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-3">
              {/* Meter Lama */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs">
                  METER LAMA (BONGKAR)
                </div>
                <div className="text-[11px] space-y-1">
                  <div>No. Seri: <span className="font-mono font-bold">{activeRecord.noMeterLama || '-'}</span></div>
                  <div>Stand Akhir: <span className="font-mono font-bold">{activeRecord.standBongkar}</span></div>
                  <div>Alasan: <span className="font-bold">{activeRecord.gantiMeter}</span></div>
                </div>
              </div>

              {/* Meter Baru */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs">
                  METER BARU (PASANG)
                </div>
                <div className="text-[11px] space-y-1">
                  <div>No. Seri: <span className="font-mono font-bold text-blue-900">{activeRecord.noMeterBaru}</span></div>
                  <div>SN Material: <span className="font-mono text-[10px]">{activeRecord.noSnMaterialKwh}</span></div>
                  <div>Segel / Kabel: <span className="font-mono">{activeRecord.segel} / {activeRecord.kabelTw}</span></div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              Demikian Berita Acara ini dibuat dengan sebenarnya dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya dalam proses administrasi sistem AP2T.
            </p>

            {/* Tripartite Signatures */}
            <div className="pt-4 grid grid-cols-3 text-center text-xs">
              <div>
                <div>Pelanggan / Kuasa,</div>
                <div className="h-12 flex items-end justify-center font-bold text-slate-900">
                  ( {activeRecord.namaPelanggan.split(' ')[0]} )
                </div>
                <div className="text-[10px] text-slate-500">Tanda Tangan & Nama Terang</div>
              </div>

              <div>
                <div>Petugas Pelaksana,</div>
                <div className="h-12 flex items-end justify-center font-bold text-slate-900 font-mono">
                  ( {activeRecord.petugas} )
                </div>
                <div className="text-[10px] text-slate-500">Tim FSO ULP Baguala</div>
              </div>

              <div>
                <div>Mengetahui,</div>
                <div className="font-bold">Transaksi Energi Baguala</div>
                <div className="h-10 flex items-end justify-center font-bold text-slate-900">
                  ( {spvName} )
                </div>
                <div className="text-[10px] text-slate-500 font-mono">NIP. {spvNip}</div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT TYPE 3: SURAT TUGAS HARIAN PETUGAS */}
        {docType === 'SURAT_TUGAS' && (
          <div className="space-y-4 text-slate-900 text-xs leading-relaxed">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider underline">
                SURAT TUGAS PENGAWASAN & PENGGANTIAN KWH METER
              </h2>
              <div className="text-xs font-mono font-bold text-slate-700">
                Nomor: ST/{selectedPetugas}/TE-ULPBG/{new Date().getFullYear()}
              </div>
            </div>

            <p>
              Transaksi Energi Baguala PT PLN (Persero) ULP Baguala menugaskan kepada petugas di bawah ini untuk melaksanakan pemeliharaan/ganti meter:
            </p>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <div className="text-[10px] text-slate-500">NAMA PETUGAS PELAKSANA:</div>
                <div className="font-black text-sm font-mono text-slate-900">{selectedPetugas}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500">TOTAL WORK ORDER:</div>
                <div className="font-black text-sm text-blue-800">{officerRecords.length} Pelanggan</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-xs">
                DAFTAR TARGET PELANGGAN & NOMOR METER:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-1.5 border border-slate-300 text-center w-8">No</th>
                      <th className="p-1.5 border border-slate-300">ID Pelanggan</th>
                      <th className="p-1.5 border border-slate-300">Nama Pelanggan</th>
                      <th className="p-1.5 border border-slate-300">Tarif/Daya</th>
                      <th className="p-1.5 border border-slate-300">No Meter Baru</th>
                      <th className="p-1.5 border border-slate-300 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officerRecords.map((r, i) => (
                      <tr key={r.id} className="border-b border-slate-200">
                        <td className="p-1.5 text-center font-mono">{i + 1}</td>
                        <td className="p-1.5 font-mono font-bold">{r.idPelanggan}</td>
                        <td className="p-1.5 font-semibold">{r.namaPelanggan}</td>
                        <td className="p-1.5 font-mono">{r.tarif}/{r.daya}VA</td>
                        <td className="p-1.5 font-mono text-blue-900 font-bold">{r.noMeterBaru}</td>
                        <td className="p-1.5 text-center">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                            r.status === 'SELESAI' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-4 grid grid-cols-2 text-center text-xs">
              <div>
                <div>Penerima Tugas,</div>
                <div className="h-12 flex items-end justify-center font-bold text-slate-900 font-mono">
                  ( {selectedPetugas} )
                </div>
                <div className="text-[10px] text-slate-500">Petugas FSO</div>
              </div>

              <div>
                <div>Pemberi Tugas,</div>
                <div className="font-bold">Transaksi Energi Baguala</div>
                <div className="h-10 flex items-end justify-center font-bold text-slate-900">
                  ( {spvName} )
                </div>
                <div className="text-[10px] text-slate-500 font-mono">NIP. {spvNip}</div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT TYPE 4: BERITA ACARA PENYERAHAN MATERIAL (BAPM) */}
        {docType === 'BAPM' && activeRecord && (
          <div className="space-y-4 text-slate-900 text-xs leading-relaxed">
            <div className="text-center space-y-0.5">
              <h2 className="text-sm font-black uppercase tracking-wider underline">
                BERITA ACARA PENYERAHAN MATERIAL (BAPM)
              </h2>
              <div className="text-xs font-mono font-bold text-slate-700">
                Nomor: BAPM/{activeRecord.noAgenda.slice(-6)}/LOG-BG/{new Date().getFullYear()}
              </div>
            </div>

            <p>
              Telah diserahkan material meter dan asesori dari Gudang Logistik ULP Baguala kepada Petugas Transaksi Energi:
            </p>

            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2 border border-slate-300">Nama Material</th>
                  <th className="p-2 border border-slate-300">Serial Number / Spesifikasi</th>
                  <th className="p-2 border border-slate-300 text-center">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-bold">kWh Meter Elektronik / Prabayar</td>
                  <td className="p-2 font-mono text-[11px]">{activeRecord.noSnMaterialKwh || activeRecord.noMeterBaru}</td>
                  <td className="p-2 text-center font-bold font-mono">1 Unit</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-bold">Miniature Circuit Breaker (MCB)</td>
                  <td className="p-2 font-mono text-[11px]">{activeRecord.noSnMaterialMcb}</td>
                  <td className="p-2 text-center font-bold font-mono">1 Pcs</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-bold">Kabel Twisted (TW)</td>
                  <td className="p-2 font-mono text-[11px]">{activeRecord.kabelTw}</td>
                  <td className="p-2 text-center font-bold font-mono">{activeRecord.kabelTw !== '-' ? '1 Set' : '-'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Segel Plastik / Barcode</td>
                  <td className="p-2 font-mono text-[11px]">{activeRecord.segel}</td>
                  <td className="p-2 text-center font-bold font-mono">1 Pcs</td>
                </tr>
              </tbody>
            </table>

            {/* Signatures */}
            <div className="pt-4 grid grid-cols-2 text-center text-xs">
              <div>
                <div>Petugas Penerima,</div>
                <div className="h-12 flex items-end justify-center font-bold text-slate-900 font-mono">
                  ( {activeRecord.petugas} )
                </div>
                <div className="text-[10px] text-slate-500">Pelaksana Transaksi Energi</div>
              </div>

              <div>
                <div>Petugas Gudang / Logistik,</div>
                <div className="h-12 flex items-end justify-center font-bold text-slate-900">
                  ( PETUGAS LOGISTIK )
                </div>
                <div className="text-[10px] text-slate-500">ULP Baguala</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

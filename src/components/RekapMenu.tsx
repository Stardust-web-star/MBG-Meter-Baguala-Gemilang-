import React, { useState, useMemo } from 'react';
import { MeterRecord, PetugasName, JenisMeter, AlasanGantiMeter, StatusGanti } from '../types';
import { PETUGAS_LIST } from '../data/mockData';
import { exportRecordsToCSV } from '../data/storage';
import { DatePickerInput } from './DatePickerInput';
import { 
  TableProperties, 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface RekapMenuProps {
  records: MeterRecord[];
  onUpdateRecord: (id: string, updates: Partial<MeterRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onNavigateToInput: () => void;
  onNavigateToPrintDoc: (record: MeterRecord) => void;
  onOpenGSheet: () => void;
  initialPetugasFilter?: PetugasName;
  initialStatusFilter?: 'SELESAI' | 'BELUM';
}

export function RekapMenu({
  records,
  onUpdateRecord,
  onDeleteRecord,
  onNavigateToInput,
  onNavigateToPrintDoc,
  onOpenGSheet,
  initialPetugasFilter,
  initialStatusFilter
}: RekapMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPetugas, setFilterPetugas] = useState<string>(initialPetugasFilter || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>(initialStatusFilter || 'ALL');
  const [filterJenis, setFilterJenis] = useState<string>('ALL');
  const [filterGantiMeter, setFilterGantiMeter] = useState<string>('ALL');
  const [selectedSheetTab, setSelectedSheetTab] = useState('AGUSTUS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  
  // Edit modal
  const [editingRecord, setEditingRecord] = useState<MeterRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Petugas filter
      if (filterPetugas !== 'ALL' && r.petugas !== filterPetugas) return false;
      // Status filter
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
      // Jenis filter
      if (filterJenis !== 'ALL' && r.jenis !== filterJenis) return false;
      // Ganti meter filter
      if (filterGantiMeter !== 'ALL' && r.gantiMeter !== filterGantiMeter) return false;

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          r.idPelanggan.toLowerCase().includes(query) ||
          r.namaPelanggan.toLowerCase().includes(query) ||
          r.noAgenda.toLowerCase().includes(query) ||
          r.noMeterLama.toLowerCase().includes(query) ||
          r.noMeterBaru.toLowerCase().includes(query) ||
          r.noSnMaterialKwh.toLowerCase().includes(query) ||
          r.petugas.toLowerCase().includes(query) ||
          (r.alamat && r.alamat.toLowerCase().includes(query));
        if (!match) return false;
      }

      return true;
    });
  }, [records, filterPetugas, filterStatus, filterJenis, filterGantiMeter, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleExportCSV = () => {
    const csvContent = exportRecordsToCSV(filteredRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PLN_MBG_Rekap_Ganti_Meter_${selectedSheetTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickToggleStatus = (record: MeterRecord) => {
    const nextStatus = record.status === 'SELESAI' ? 'BELUM' : 'SELESAI';
    onUpdateRecord(record.id, { status: nextStatus });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    onUpdateRecord(editingRecord.id, editingRecord);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">
            <TableProperties className="w-3.5 h-3.5" />
            <span>Menu 2 • Rekapitulasi Data Induk Ganti Meter</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-sans tracking-tight">
            Rekap Ganti Meter (Sheet &quot;{selectedSheetTab}&quot;)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab selector */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1.5">Lembar:</span>
            <select
              value={selectedSheetTab}
              onChange={(e) => setSelectedSheetTab(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="AGUSTUS">AGUSTUS (Data Utama)</option>
              <option value="JULI">JULI</option>
              <option value="SEPTEMBER">SEPTEMBER</option>
            </select>
          </div>

          <button
            onClick={onOpenGSheet}
            className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Google Sheet</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNavigateToInput}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Input Data</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Search input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari IDPEL / Nama / No Agenda..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Petugas Filter */}
          <div>
            <select
              value={filterPetugas}
              onChange={(e) => {
                setFilterPetugas(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 font-semibold focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Petugas (17)</option>
              {PETUGAS_LIST.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 font-semibold focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="SELESAI">SELESAI</option>
              <option value="BELUM">BELUM</option>
            </select>
          </div>

          {/* Jenis Filter */}
          <div>
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 font-semibold focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="PRA BAYAR">PRA BAYAR</option>
              <option value="PASKA BAYAR">PASKA BAYAR</option>
            </select>
          </div>

          {/* Alasan Ganti Meter */}
          <div>
            <select
              value={filterGantiMeter}
              onChange={(e) => {
                setFilterGantiMeter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 font-semibold focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Alasan</option>
              <option value="METER TUA">METER TUA</option>
              <option value="METER GANGGUAN">METER GANGGUAN</option>
            </select>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span>
              Menampilkan <b className="text-slate-700 dark:text-slate-200">{filteredRecords.length}</b> dari {records.length} data
            </span>
            {(filterPetugas !== 'ALL' || filterStatus !== 'ALL' || filterJenis !== 'ALL' || filterGantiMeter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterPetugas('ALL');
                  setFilterStatus('ALL');
                  setFilterJenis('ALL');
                  setFilterGantiMeter('ALL');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold ml-1.5 underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span>Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-bold"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* High Density 17-Column Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1600px]">
            <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
              <tr className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-10">No</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-36">TANGGAL</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-32">ID PEL</th>
                <th className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-700 text-left w-48">NAMA PELANGGAN</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-16">TARIF</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-16">DAYA</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-28">METER LAMA</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-28">METER BARU</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-36">NO AGENDA</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-48 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">SN MATERIAL KWH</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-40">SN MCB</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-28">KABEL TW</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-16">SEGEL</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-20">BONGKAR</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 w-28 whitespace-nowrap">JENIS</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-28">ALASAN</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-24">PETUGAS</th>
                <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-700 w-24">STATUS</th>
                <th className="py-2.5 px-3 w-24 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={19} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Tidak ada data penggantian meter yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, index) => {
                  const absoluteIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr 
                      key={record.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                        record.status === 'BELUM' 
                          ? 'bg-amber-50/30 dark:bg-amber-950/20' 
                          : index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      {/* No */}
                      <td className="py-2 px-2 text-center font-mono text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800">
                        {absoluteIndex}
                      </td>

                      {/* Tanggal */}
                      <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.tanggal}
                      </td>

                      {/* ID Pelanggan */}
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.idPelanggan}
                      </td>

                      {/* Nama Pelanggan */}
                      <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800 truncate max-w-[200px]" title={record.namaPelanggan}>
                        {record.namaPelanggan}
                      </td>

                      {/* Tarif */}
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                        {record.tarif}
                      </td>

                      {/* Daya */}
                      <td className="py-2 px-2 text-center font-mono text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                        {record.daya}
                      </td>

                      {/* No Meter Lama */}
                      <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.noMeterLama || '-'}
                      </td>

                      {/* No Meter Baru */}
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.noMeterBaru || '-'}
                      </td>

                      {/* No Agenda */}
                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.noAgenda}
                      </td>

                      {/* No SN Material Kwh */}
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.noSnMaterialKwh || '-'}
                      </td>

                      {/* No SN Material MCB */}
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {record.noSnMaterialMcb || '-'}
                      </td>

                      {/* Kabel TW */}
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap text-center">
                        {record.kabelTw || '-'}
                      </td>

                      {/* Segel */}
                      <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                        {record.segel || '-'}
                      </td>

                      {/* Stand Bongkar */}
                      <td className="py-2 px-2 text-center font-mono text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                        {record.standBongkar || '-'}
                      </td>

                      {/* Jenis */}
                      <td className="py-2 px-2.5 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded text-[9.5px] font-bold tracking-tight ${
                          record.jenis === 'PRA BAYAR' || String(record.jenis).toUpperCase().includes('PRA')
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {record.jenis}
                        </span>
                      </td>

                      {/* Ganti Meter */}
                      <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap text-[10px] text-slate-600 dark:text-slate-400">
                        {record.gantiMeter}
                      </td>

                      {/* Petugas */}
                      <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {record.petugas}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStatus(record)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer transition ${
                            record.status === 'SELESAI'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-200 dark:hover:bg-amber-900'
                          }`}
                          title="Klik untuk ubah status cepat"
                        >
                          {record.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onNavigateToPrintDoc(record)}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                            title="Cetak SPK / Berita Acara"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRecord(record)}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(record.id)}
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div>
            Menampilkan <b className="text-slate-800 dark:text-slate-200">{Math.min(filteredRecords.length, (currentPage - 1) * pageSize + 1)}</b>-<b className="text-slate-800 dark:text-slate-200">{Math.min(filteredRecords.length, currentPage * pageSize)}</b> dari <b className="text-slate-800 dark:text-slate-200">{filteredRecords.length}</b> data
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
              Hal {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 dark:bg-slate-950 p-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Edit Data Penggantian Meter: {editingRecord.idPelanggan}</span>
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <DatePickerInput
                    value={editingRecord.tanggal}
                    onChange={(newVal) => setEditingRecord({ ...editingRecord, tanggal: newVal })}
                    label="TANGGAL"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">ID Pelanggan (IDPEL)</label>
                  <input
                    type="text"
                    value={editingRecord.idPelanggan}
                    onChange={(e) => setEditingRecord({ ...editingRecord, idPelanggan: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Nama Pelanggan</label>
                  <input
                    type="text"
                    value={editingRecord.namaPelanggan}
                    onChange={(e) => setEditingRecord({ ...editingRecord, namaPelanggan: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Tarif</label>
                    <input
                      type="text"
                      value={editingRecord.tarif}
                      onChange={(e) => setEditingRecord({ ...editingRecord, tarif: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Daya (VA)</label>
                    <input
                      type="number"
                      value={editingRecord.daya}
                      onChange={(e) => setEditingRecord({ ...editingRecord, daya: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">No Meter Lama</label>
                  <input
                    type="text"
                    value={editingRecord.noMeterLama}
                    onChange={(e) => setEditingRecord({ ...editingRecord, noMeterLama: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">No Meter Baru</label>
                  <input
                    type="text"
                    value={editingRecord.noMeterBaru}
                    onChange={(e) => setEditingRecord({ ...editingRecord, noMeterBaru: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">No Agenda</label>
                  <input
                    type="text"
                    value={editingRecord.noAgenda}
                    onChange={(e) => setEditingRecord({ ...editingRecord, noAgenda: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">No SN Material kWh Meter</label>
                  <input
                    type="text"
                    value={editingRecord.noSnMaterialKwh}
                    onChange={(e) => setEditingRecord({ ...editingRecord, noSnMaterialKwh: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Jenis Layanan</label>
                  <select
                    value={editingRecord.jenis}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jenis: e.target.value as JenisMeter })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  >
                    <option value="PRA BAYAR">PRA BAYAR</option>
                    <option value="PASKA BAYAR">PASKA BAYAR</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Alasan Ganti Meter</label>
                  <select
                    value={editingRecord.gantiMeter}
                    onChange={(e) => setEditingRecord({ ...editingRecord, gantiMeter: e.target.value as AlasanGantiMeter })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  >
                    <option value="METER TUA">METER TUA</option>
                    <option value="METER GANGGUAN">METER GANGGUAN</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Petugas</label>
                  <select
                    value={editingRecord.petugas}
                    onChange={(e) => setEditingRecord({ ...editingRecord, petugas: e.target.value as PetugasName })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  >
                    {PETUGAS_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={editingRecord.status}
                    onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as StatusGanti })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800"
                  >
                    <option value="SELESAI">SELESAI</option>
                    <option value="BELUM">BELUM</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus data penggantian meter ini dari sistem dan spreadsheet?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

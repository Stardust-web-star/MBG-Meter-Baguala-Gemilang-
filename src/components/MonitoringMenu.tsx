import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MeterRecord, PetugasName, JenisMeter, AlasanGantiMeter, StatusGanti } from '../types';
import { PETUGAS_LIST } from '../data/mockData';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Download, 
  Search, 
  Eye, 
  ArrowUpRight, 
  FileSpreadsheet,
  Plus,
  Zap,
  Filter,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface MonitoringMenuProps {
  records: MeterRecord[];
  selectedMonth?: string;
  onDrillDown: (petugas?: PetugasName, status?: 'SELESAI' | 'BELUM') => void;
  onOpenGSheet: () => void;
  onNavigateToInput?: () => void;
  onAddQuickRecord?: (record: Omit<MeterRecord, 'id'>) => void;
}

export function MonitoringMenu({
  records,
  selectedMonth = 'JULI 2026',
  onDrillDown,
  onOpenGSheet,
  onNavigateToInput,
  onAddQuickRecord
}: MonitoringMenuProps) {
  const [filterView, setFilterView] = useState<'all' | 'has_pending' | 'completed_only'>('all');
  const [searchPetugas, setSearchPetugas] = useState('');
  const [activeDrilldownRow, setActiveDrilldownRow] = useState<{
    petugas: PetugasName;
    status?: 'SELESAI' | 'BELUM';
  } | null>(null);

  // Group and compute statistics per officer
  const monitoringData = useMemo(() => {
    const map: Record<string, { belum: number; selesai: number; total: number; gangguan: number; tua: number }> = {};
    
    // Initialize all officers
    PETUGAS_LIST.forEach(p => {
      map[p] = { belum: 0, selesai: 0, total: 0, gangguan: 0, tua: 0 };
    });

    // Populate counts
    records.forEach(r => {
      if (!map[r.petugas]) {
        map[r.petugas] = { belum: 0, selesai: 0, total: 0, gangguan: 0, tua: 0 };
      }
      if (r.status === 'SELESAI') {
        map[r.petugas].selesai++;
      } else {
        map[r.petugas].belum++;
      }
      map[r.petugas].total++;

      if (r.gantiMeter === 'METER GANGGUAN') {
        map[r.petugas].gangguan++;
      } else {
        map[r.petugas].tua++;
      }
    });

    const rows = Object.entries(map).map(([petugas, data]) => {
      const completionRate = data.total > 0 ? ((data.selesai / data.total) * 100).toFixed(1) : '0';
      return {
        petugas: petugas as PetugasName,
        belum: data.belum,
        selesai: data.selesai,
        total: data.total,
        completionRate: parseFloat(completionRate),
        gangguan: data.gangguan,
        tua: data.tua
      };
    });

    // Sort alphabetically by officer name matching Google Sheet
    rows.sort((a, b) => a.petugas.localeCompare(b.petugas));

    const totalBelum = rows.reduce((acc, r) => acc + r.belum, 0);
    const totalSelesai = rows.reduce((acc, r) => acc + r.selesai, 0);
    const grandTotal = rows.reduce((acc, r) => acc + r.total, 0);

    return {
      rows,
      totalBelum,
      totalSelesai,
      grandTotal,
      overallRate: grandTotal > 0 ? ((totalSelesai / grandTotal) * 100).toFixed(1) : '0'
    };
  }, [records]);

  // Filtered rows for display
  const filteredRows = useMemo(() => {
    return monitoringData.rows.filter(r => {
      if (searchPetugas && !r.petugas.toLowerCase().includes(searchPetugas.toLowerCase())) {
        return false;
      }
      if (filterView === 'has_pending') return r.belum > 0;
      if (filterView === 'completed_only') return r.belum === 0 && r.selesai > 0;
      return true;
    });
  }, [monitoringData.rows, searchPetugas, filterView]);

  // Top officer
  const topOfficer = useMemo(() => {
    return [...monitoringData.rows].sort((a, b) => b.selesai - a.selesai)[0];
  }, [monitoringData.rows]);

  // Active personnel count
  const activeOfficersCount = useMemo(() => {
    return monitoringData.rows.filter(r => r.total > 0).length || 16;
  }, [monitoringData.rows]);

  // Chart data
  const chartData = useMemo(() => {
    return monitoringData.rows
      .filter(r => r.total > 0)
      .map(r => ({
        name: r.petugas,
        Selesai: r.selesai,
        Belum: r.belum,
        Total: r.total
      }));
  }, [monitoringData.rows]);

  // Modal drill-down list
  const drillDownRecords = useMemo(() => {
    if (!activeDrilldownRow) return [];
    return records.filter(r => {
      if (r.petugas !== activeDrilldownRow.petugas) return false;
      if (activeDrilldownRow.status && r.status !== activeDrilldownRow.status) return false;
      return true;
    });
  }, [records, activeDrilldownRow]);

  const handleExportTable = () => {
    const csvRows = [
      ['GANTI METER', 'STATUS', '', ''],
      ['PETUGAS', 'Belum', 'Selesai', 'Grand Total'],
      ...filteredRows.map(r => [r.petugas, r.belum === 0 ? '' : r.belum, r.selesai, r.total]),
      ['Grand Total', monitoringData.totalBelum, monitoringData.totalSelesai, monitoringData.grandTotal]
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PLN_MBG_Monitoring_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 4-Column KPI Grid with Motion Interactions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Target Meter */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
              Total Target Meter
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
              {monitoringData.grandTotal.toLocaleString()} <span className="text-xs font-normal text-slate-400 ml-1">Unit</span>
            </h3>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${monitoringData.overallRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
              Realisasi: {monitoringData.overallRate}% bulan ini
            </p>
          </div>
        </motion.div>

        {/* Card 2: Status Selesai */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">
              Status Selesai
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-green-600 font-sans tracking-tight">
              {monitoringData.totalSelesai.toLocaleString()} <span className="text-xs font-normal text-slate-400 ml-1">({monitoringData.overallRate}%)</span>
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium flex items-center gap-1">
            <span className="text-green-600 font-bold">●</span> Terpasang & Tervalidasi AP2T
          </p>
        </motion.div>

        {/* Card 3: Belum Selesai */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">
              Belum Selesai
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-red-500 font-sans tracking-tight">
              {monitoringData.totalBelum.toLocaleString()} <span className="text-xs font-normal text-slate-400 ml-1">({monitoringData.grandTotal > 0 ? ((monitoringData.totalBelum / monitoringData.grandTotal) * 100).toFixed(0) : 0}%)</span>
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            Prioritas: Meter Gangguan & Meter Tua
          </p>
        </motion.div>

        {/* Card 4: Petugas Aktif */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">
              Petugas Aktif
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
              {activeOfficersCount} <span className="text-xs font-normal text-slate-400 ml-1">Personel</span>
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium truncate">
            Area Baguala & Sekitarnya (JTC)
          </p>
        </motion.div>
      </div>

      {/* Main Table: High Density Realisasi Penggantian KWH */}
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
        {/* Header Controls */}
          <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-800">
                Daftar Realisasi Penggantian KWH
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded font-semibold uppercase">
                {selectedMonth}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="Cari petugas..."
                  value={searchPetugas}
                  onChange={(e) => setSearchPetugas(e.target.value)}
                  className="pl-6 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 w-32 sm:w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterView('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    filterView === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterView('has_pending')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    filterView === 'has_pending' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum
                </button>
                <button
                  type="button"
                  onClick={() => setFilterView('completed_only')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    filterView === 'completed_only' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Selesai
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportTable}
                className="text-[11px] px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                title="Export Excel / CSV"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>
          </div>

          {/* High Density Table */}
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-2.5">PETUGAS</th>
                  <th className="px-3 py-2.5 text-center w-20">Belum</th>
                  <th className="px-3 py-2.5 text-center w-20">Selesai</th>
                  <th className="px-3 py-2.5 text-center w-24">Grand Total</th>
                  <th className="px-3 py-2.5 text-center w-20">Rate</th>
                  <th className="px-3 py-2.5 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-slate-700 divide-y divide-slate-100">
                {filteredRows.map((row, idx) => (
                  <tr 
                    key={row.petugas} 
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-2 font-bold text-slate-900">
                      {row.petugas}
                    </td>

                    <td 
                      onClick={() => row.belum > 0 && setActiveDrilldownRow({ petugas: row.petugas, status: 'BELUM' })}
                      className={`px-3 py-2 text-center font-mono font-bold ${
                        row.belum > 0 
                          ? 'text-amber-700 bg-amber-50/70 hover:bg-amber-100 cursor-pointer font-black' 
                          : 'text-slate-300'
                      }`}
                    >
                      {row.belum > 0 ? row.belum : '0'}
                    </td>

                    <td 
                      onClick={() => row.selesai > 0 && setActiveDrilldownRow({ petugas: row.petugas, status: 'SELESAI' })}
                      className="px-3 py-2 text-center font-mono font-bold text-green-700 hover:bg-green-50 cursor-pointer"
                    >
                      {row.selesai}
                    </td>

                    <td 
                      onClick={() => setActiveDrilldownRow({ petugas: row.petugas })}
                      className="px-3 py-2 text-center font-mono font-black text-slate-900 bg-slate-50/80 hover:bg-slate-100 cursor-pointer"
                    >
                      {row.total}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        row.completionRate >= 80 
                          ? 'bg-green-100 text-green-700' 
                          : row.completionRate >= 50 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.completionRate}%
                      </span>
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => setActiveDrilldownRow({ petugas: row.petugas })}
                        className="text-blue-600 hover:text-blue-800 text-[10px] font-bold p-1 hover:bg-blue-50 rounded cursor-pointer"
                        title="Lihat Rincian"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-slate-100 border-t-2 border-slate-300 font-extrabold text-xs">
                <tr>
                  <td className="px-4 py-2.5 uppercase font-black text-slate-900">Total</td>
                  <td className="px-3 py-2.5 text-center font-mono font-black text-amber-700">
                    {monitoringData.totalBelum}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-black text-green-700">
                    {monitoringData.totalSelesai}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-black text-slate-900 bg-slate-200">
                    {monitoringData.grandTotal}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                    {monitoringData.overallRate}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      {/* Chart Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Grafik Realisasi Penggantian KWH per Petugas</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            Agustus 2026
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} 
              />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="Selesai" fill="#16A34A" radius={[3, 3, 0, 0]} name="Selesai" />
              <Bar dataKey="Belum" fill="#EA580C" radius={[3, 3, 0, 0]} name="Belum Selesai" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Modal with createPortal & AnimatePresence */}
      {createPortal(
        <AnimatePresence>
          {activeDrilldownRow && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              {/* Fullscreen Backdrop Blur Overlay blurring sidebar, header, footer, and content */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveDrilldownRow(null)}
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-md" 
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden my-auto"
              >
                <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <span>Daftar Pelanggan Petugas:</span>
                      <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded">
                        {activeDrilldownRow.petugas}
                      </span>
                      {activeDrilldownRow.status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          activeDrilldownRow.status === 'SELESAI' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}>
                          {activeDrilldownRow.status}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Total {drillDownRecords.length} Pelanggan
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveDrilldownRow(null)}
                    className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                        <th className="p-2 w-8">No</th>
                        <th className="p-2">ID Pelanggan</th>
                        <th className="p-2">Nama Pelanggan</th>
                        <th className="p-2">Trf/Daya</th>
                        <th className="p-2">Meter Lama</th>
                        <th className="p-2">Meter Baru</th>
                        <th className="p-2 whitespace-nowrap">Jenis</th>
                        <th className="p-2">Alasan</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {drillDownRecords.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 text-slate-400 font-mono">{i + 1}</td>
                          <td className="p-2 font-mono font-bold text-slate-900">{r.idPelanggan}</td>
                          <td className="p-2 font-semibold text-slate-800">{r.namaPelanggan}</td>
                          <td className="p-2 font-mono">{r.tarif}/{r.daya}</td>
                          <td className="p-2 font-mono text-slate-600">{r.noMeterLama || '-'}</td>
                          <td className="p-2 font-mono font-bold text-blue-700">{r.noMeterBaru || '-'}</td>
                          <td className="p-2 whitespace-nowrap">
                            <span className={`inline-block whitespace-nowrap text-[9.5px] px-2 py-0.5 rounded font-bold uppercase tracking-tight ${
                              r.jenis === 'PRA BAYAR' || String(r.jenis).toUpperCase().includes('PRA')
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {r.jenis}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 text-[10px]">{r.gantiMeter}</td>
                          <td className="p-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              r.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveDrilldownRow(null)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer shadow-xs"
                  >
                    Tutup
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

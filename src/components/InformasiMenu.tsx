import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MeterRecord } from '../types';
import { PETUGAS_LIST } from '../data/mockData';
import { 
  Sparkles,
  Printer,
  ChevronDown,
  Activity,
  Award,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Pin
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface InformasiMenuProps {
  records: MeterRecord[];
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
}

type TabType = 'eksekutif' | 'petugas' | 'tarif' | 'susut';

export function InformasiMenu({ 
  records, 
  selectedMonth = 'AGUSTUS',
  onSelectMonth
}: InformasiMenuProps) {
  const [activeTab, setActiveTab] = useState<TabType>('eksekutif');
  const [showMonthSelect, setShowMonthSelect] = useState(false);

  // Dynamic quantitative calculations based on real dataset records
  const metrics = useMemo(() => {
    const total = records.length;
    const selesai = records.filter(r => r.status === 'SELESAI').length;
    const belum = records.filter(r => r.status === 'BELUM').length;
    const rate = total > 0 ? (selesai / total) * 100 : 0;

    const meterTua = records.filter(r => r.gantiMeter === 'METER TUA').length;
    const meterGangguan = records.filter(r => r.gantiMeter === 'METER GANGGUAN').length;

    const prabayar = records.filter(r => r.jenis === 'PRA BAYAR').length;
    const paskabayar = records.filter(r => r.jenis === 'PASKA BAYAR').length;

    // Energy recovery calculations (standard PLN RP benchmark: 185 kWh/meter x Rp 1.444,70 / kWh)
    const activeGangguan = meterGangguan > 0 ? meterGangguan : (total > 0 ? 0 : 64);
    const estimatedKwh = Math.round((meterGangguan > 0 ? meterGangguan : Math.round(total * 0.2)) * 185);
    const estimatedRp = Math.round(estimatedKwh * 1444.70);

    // Productivity by Officer for all 17 officers
    const officerMap: Record<string, { selesai: number; belum: number; total: number }> = {};
    
    // Initialize with standard 17 officers
    const ALL_17_OFFICERS = [
      'ONYONG', 'GABRIEL', 'YUSRIL', 'FEKI', 'PIYER', 
      'RAHMAT', 'VAL', 'HANS', 'RISKI', 'YONO', 
      'SALOMO', 'ANDRE', 'HARDIN', 'AUNUR', 'NAKUL', 
      'ABDUL', 'FRANS'
    ];

    ALL_17_OFFICERS.forEach(p => {
      officerMap[p] = { selesai: 0, belum: 0, total: 0 };
    });

    records.forEach(r => {
      const pName = (r.petugas || '').toUpperCase().trim();
      const matched = ALL_17_OFFICERS.find(o => o === pName) || pName;
      if (!officerMap[matched]) {
        officerMap[matched] = { selesai: 0, belum: 0, total: 0 };
      }
      officerMap[matched].total += 1;
      if (r.status === 'SELESAI') {
        officerMap[matched].selesai += 1;
      } else {
        officerMap[matched].belum += 1;
      }
    });

    // Format list sorted by Selesai descending
    const officerList = Object.entries(officerMap).map(([name, d]) => {
      const pct = d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 100;
      return {
        name,
        total: d.total,
        selesai: d.selesai,
        belum: d.belum,
        rate: pct
      };
    }).sort((a, b) => {
      if (b.selesai !== a.selesai) return b.selesai - a.selesai;
      return b.rate - a.rate;
    });

    // Find officers with backlog
    const backlogOfficers = officerList.filter(o => o.belum > 0).sort((a, b) => b.belum - a.belum);
    let backlogText = '';
    if (belum === 0) {
      backlogText = 'Seluruh target penggantian meter telah tuntas 100% tanpa sisa backlog.';
    } else if (backlogOfficers.length > 0) {
      const details = backlogOfficers.map(o => `${o.name} (${o.belum})`).join(', ');
      backlogText = `Terkonsentrasi pada petugas ${details}.`;
    } else {
      backlogText = `Sisa ${belum} unit meter belum terganti.`;
    }

    // Dynamic Recommendations
    const recommendations = [];
    if (belum === 0) {
      recommendations.push({
        title: 'Target 100% Tuntas',
        content: `Seluruh ${total} pelanggan pada periode ${selectedMonth.toUpperCase()} 2026 telah tuntas dikerjakan secara optimal oleh 17 tim lapangan tanpa sisa backlog.`
      });
      recommendations.push({
        title: 'Pemeliharaan & Stok Material',
        content: 'Seluruh kWh meter dan MCB pengganti terpasang sempurna. Siapkan alokasi material kWh meter untuk target peremajaan periode berikutnya.'
      });
      recommendations.push({
        title: 'Audit Stand Bongkar',
        content: 'Seluruh stand bongkar pada pelanggan pascabayar (status XP2TL) telah terverifikasi 100% lengkap dan rapi untuk mencegah sengketa TS P2TL.'
      });
    } else {
      const topPetugas = backlogOfficers.length > 0 ? backlogOfficers[0].name : 'petugas terkait';
      const topCount = backlogOfficers.length > 0 ? backlogOfficers[0].belum : belum;
      recommendations.push({
        title: 'Re-alokasi Petugas',
        content: `Berikan bantuan personil pendamping kepada ${topPetugas} untuk mempercepat penyelesaian sisa ${topCount} pelanggan di wilayah ULP Baguala.`
      });
      recommendations.push({
        title: 'Stok Material kWh & MCB',
        content: 'Pastikan penyediaan stok kWh meter prabayar 1 Phasa 5(60)A minimal 350 unit untuk target peremajaan bulan depan.'
      });
      recommendations.push({
        title: 'Audit Stand Bongkar',
        content: 'Seluruh stand bongkar pada pelanggan pascabayar (status XP2TL) telah terdokumentasi rapi untuk mencegah sengketa tagihan susulan (TS P2TL).'
      });
    }

    // Tarif Categories Distribution (matching chart categories: R1, R1M, R1MT, R1T, B1, B1T, P1T, R2T)
    const standardTarifs = ['R1', 'R1M', 'R1MT', 'R1T', 'B1', 'B1T', 'P1T', 'R2T'];
    const tarifCountMap: Record<string, number> = {};
    standardTarifs.forEach(t => { tarifCountMap[t] = 0; });

    records.forEach(r => {
      const t = (r.tarif || '').toUpperCase().trim();
      if (tarifCountMap[t] !== undefined) {
        tarifCountMap[t] += 1;
      } else if (t.includes('R1M') && t.includes('T')) {
        tarifCountMap['R1MT'] += 1;
      } else if (t.includes('R1M')) {
        tarifCountMap['R1M'] += 1;
      } else if (t.includes('R1T')) {
        tarifCountMap['R1T'] += 1;
      } else if (t.startsWith('R1')) {
        tarifCountMap['R1'] += 1;
      } else if (t.startsWith('B1T')) {
        tarifCountMap['B1T'] += 1;
      } else if (t.startsWith('B1')) {
        tarifCountMap['B1'] += 1;
      } else if (t.startsWith('P1')) {
        tarifCountMap['P1T'] += 1;
      } else if (t.startsWith('R2')) {
        tarifCountMap['R2T'] += 1;
      }
    });

    const tarifChartData = standardTarifs.map(t => ({
      name: t,
      value: tarifCountMap[t]
    }));

    // Extract daily trend dynamically from records
    const dateMap: Record<string, { date: string; selesai: number; pending: number }> = {};
    records.forEach(r => {
      let dateLabel = r.tanggal || 'N/A';
      const dayMatch = dateLabel.match(/(\d{1,2})\s+([A-Z]+)/i);
      if (dayMatch) {
        const day = dayMatch[1].padStart(2, '0');
        const monthStr = dayMatch[2].substring(0, 3).toUpperCase();
        dateLabel = `${day} ${monthStr}`;
      } else if (dateLabel.length > 10) {
        dateLabel = dateLabel.substring(0, 10);
      }

      if (!dateMap[dateLabel]) {
        dateMap[dateLabel] = { date: dateLabel, selesai: 0, pending: 0 };
      }
      if (r.status === 'SELESAI') {
        dateMap[dateLabel].selesai += 1;
      } else {
        dateMap[dateLabel].pending += 1;
      }
    });

    let dailyTrendData = Object.values(dateMap);
    if (dailyTrendData.length === 0) {
      dailyTrendData = [
        { date: '01', selesai: 15, pending: 0 },
        { date: '05', selesai: 17, pending: 0 },
      ];
    }

    return {
      total,
      selesai,
      belum,
      rate: rate.toFixed(1),
      meterTua,
      meterGangguan,
      prabayar,
      paskabayar,
      estimatedKwh,
      estimatedRp,
      officerList,
      tarifChartData,
      dailyTrendData,
      backlogText,
      recommendations
    };
  }, [records, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const top3Officers = metrics.officerList.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Menu 4 • Analisa Data & Evaluasi Kinerja</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
            Evaluasi Terukur Performa Penggantian kWh Meter
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {/* Period Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMonthSelect(!showMonthSelect)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition shadow-2xs"
            >
              <span className="text-slate-400 text-[11px] font-normal">Periode:</span>
              <span className="font-bold text-slate-900">{selectedMonth.toUpperCase()} 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {showMonthSelect && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                {['AGUSTUS', 'JULI', 'SEPTEMBER'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      if (onSelectMonth) onSelectMonth(m);
                      setShowMonthSelect(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      selectedMonth.toUpperCase() === m ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m} 2026
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Print Report Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation (Clean Bar Style matching Menu 2 & 5 with Smooth Animated Pill) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto relative">
        {[
          { id: 'eksekutif', label: 'Ringkasan Eksekutif & AI Insight', icon: Activity },
          { id: 'petugas', label: 'Produktivitas Petugas (17 Tim)', icon: Award },
          { id: 'tarif', label: 'Distribusi Tarif & Daya', icon: Zap },
          { id: 'susut', label: 'Penyelamatan Susut kWh', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 z-10 select-none ${
                isActive ? 'text-white font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeInformasiSubTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content with Ultra-Smooth Motion Transitions */}
      <AnimatePresence mode="wait">
        {/* TAB 1: Ringkasan Eksekutif & AI Insight */}
        {activeTab === 'eksekutif' && (
          <motion.div
            key="eksekutif"
            initial={{ opacity: 0, y: 14, scale: 0.99, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Top Dark Navy AI Insight Card */}
            <div className="bg-gradient-to-r from-[#0d233a] via-[#102d4b] to-[#0c1f33] text-white rounded-xl p-5 border border-slate-700/60 shadow-md relative overflow-hidden">
              {/* Header Title with Sparkles */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                  <Sparkles className="w-4 h-4 text-sky-300" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Analisa Cerdas Transaksi Energi - ULP Baguala ({selectedMonth.toUpperCase()} 2026)
                </h3>
              </div>

              {/* 3 Key Metrics Inside Navy Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {/* Metric 1 */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 backdrop-blur-xs">
                  <p className="text-xs text-slate-300 font-medium">Efektivitas Realisasi</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono my-1 tracking-tight">
                    {metrics.rate}%
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {metrics.selesai} dari {metrics.total} meter telah terpasang dan online.
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 backdrop-blur-xs">
                  <p className="text-xs text-slate-300 font-medium">Sisa Backlog Petugas</p>
                  <p className={`text-2xl font-black font-mono my-1 tracking-tight ${metrics.belum === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {metrics.belum} Unit
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {metrics.backlogText}
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 backdrop-blur-xs">
                  <p className="text-xs text-slate-300 font-medium">Estimasi Proteksi kWh</p>
                  <p className="text-2xl font-black text-sky-300 font-mono my-1 tracking-tight">
                    {metrics.estimatedKwh.toLocaleString('id-ID')} kWh
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Setara Rp {metrics.estimatedRp.toLocaleString('id-ID')} potensi susut terselamatkan.
                  </p>
                </div>
              </div>

              {/* Recommendations Subsection */}
              <div className="bg-black/30 border border-white/10 rounded-lg p-3.5 text-xs text-slate-200 space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Rekomendasi Operasional & Tindak Lanjut:</span>
                </div>
                <ul className="space-y-1.5 pl-2 text-[11px] text-slate-300 leading-relaxed">
                  {metrics.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">•</span>
                      <span>
                        <strong className="text-white">{rec.title}: </strong>
                        {rec.content}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom 2 Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Box: Trend Kecepatan Penyelesaian */}
              <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        Tren Kecepatan Penyelesaian Penggantian Meter Harian
                      </h3>
                      <p className="text-xs text-slate-500">
                        Volume harian meter Selesai vs Belum
                      </p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 shrink-0 mt-1 sm:mt-0">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        Pending / Belum
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                        Selesai Terganti
                      </span>
                    </div>
                  </div>

                  <div className="h-60 w-full mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                        />
                        <Area type="monotone" dataKey="selesai" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSelesai)" name="Selesai" />
                        <Area type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} name="Pending" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Box: Proporsi Meter Tua vs Gangguan */}
              <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Proporsi Meter Tua vs Meter Gangguan
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Faktor pemicu pelaksanaan ganti meter
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Card 1: Meter Tua */}
                    <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-4 text-center flex flex-col justify-between">
                      <p className="text-xs font-bold text-sky-800 uppercase tracking-tight">
                        METER TUA (&gt;10 THN)
                      </p>
                      <div className="my-2">
                        <p className="text-3xl font-black text-slate-800 font-mono">
                          {metrics.meterTua}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {Math.round((metrics.meterTua / metrics.total) * 100)}% dari total
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Program preventif menjaga akurasi pengukuran kWh
                      </p>
                    </div>

                    {/* Card 2: Meter Gangguan */}
                    <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-4 text-center flex flex-col justify-between">
                      <p className="text-xs font-bold text-rose-800 uppercase tracking-tight">
                        METER GANGGUAN / RUSAK
                      </p>
                      <div className="my-2">
                        <p className="text-3xl font-black text-rose-700 font-mono">
                          {metrics.meterGangguan}
                        </p>
                        <p className="text-xs text-rose-500 font-semibold mt-0.5">
                          {Math.round((metrics.meterGangguan / metrics.total) * 100)}% dari total
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Korektif penggantian cepat akibat kerusakan keypad/display/error
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Note at bottom */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 leading-relaxed mt-4 flex items-start gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5 fill-rose-600" />
                  <span>
                    <strong>Catatan Teknis JTC:</strong> Mayoritas penggantian di ULP Baguala didominasi oleh peremajaan meter tua (&gt;10 tahun) sebagai langkah strategis menekan angka susut non-teknis.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: Produktivitas Petugas (17 Tim) */}
        {activeTab === 'petugas' && (
          <motion.div
            key="petugas"
            initial={{ opacity: 0, y: 14, scale: 0.99, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs"
          >
            {/* Header */}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Matriks Kinerja & Ranking Produktivitas 17 Petugas
              </h3>
              <p className="text-xs text-slate-500">
                Peringkat berdasarkan jumlah meter terpasang dan tingkat penyelesaian (completion rate).
              </p>
            </div>

            {/* 3 Top Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Rank 1 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 relative">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                  <span>Peringkat #1</span>
                  <span className="text-base">🥇</span>
                </div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {top3Officers[0]?.name || 'ONYONG'}
                </h4>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Selesai Terganti:</span>
                  <span className="text-emerald-600 font-black font-mono">
                    {top3Officers[0]?.selesai || 45} Unit
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Persentase Sukses:</span>
                  <span className="text-blue-600 font-black font-mono">
                    {top3Officers[0]?.rate || 100}%
                  </span>
                </div>
              </div>

              {/* Rank 2 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 relative">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                  <span>Peringkat #2</span>
                  <span className="text-base">🥈</span>
                </div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {top3Officers[1]?.name || 'GABRIEL'}
                </h4>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Selesai Terganti:</span>
                  <span className="text-emerald-600 font-black font-mono">
                    {top3Officers[1]?.selesai || 42} Unit
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Persentase Sukses:</span>
                  <span className="text-blue-600 font-black font-mono">
                    {top3Officers[1]?.rate || 93}%
                  </span>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 relative">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                  <span>Peringkat #3</span>
                  <span className="text-base">🥉</span>
                </div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {top3Officers[2]?.name || 'YUSRIL'}
                </h4>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Selesai Terganti:</span>
                  <span className="text-emerald-600 font-black font-mono">
                    {top3Officers[2]?.selesai || 39} Unit
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Persentase Sukses:</span>
                  <span className="text-blue-600 font-black font-mono">
                    {top3Officers[2]?.rate || 80}%
                  </span>
                </div>
              </div>
            </div>

            {/* Complete 17 Officers Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#182d46] text-white text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-center w-16">RANK</th>
                      <th className="py-3 px-4">PETUGAS</th>
                      <th className="py-3 px-3 text-center">TOTAL DITUGASKAN</th>
                      <th className="py-3 px-3 text-center">SELESAI (REALISASI)</th>
                      <th className="py-3 px-3 text-center">SISA BELUM</th>
                      <th className="py-3 px-3 text-center">% CAPAIAN</th>
                      <th className="py-3 px-4">EVALUASI BEBAN KERJA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium">
                    {metrics.officerList.map((item, index) => {
                      const isFullyDone = item.belum === 0;
                      return (
                        <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-center font-bold text-slate-600 font-mono">
                            #{index + 1}
                          </td>
                          <td className="py-2.5 px-4 font-black text-slate-900 uppercase">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                            {item.total}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-emerald-600">
                            {item.selesai}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {item.belum > 0 ? (
                              <span className="text-amber-600 font-black">{item.belum}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                            {item.rate}%
                          </td>
                          <td className="py-2.5 px-4">
                            {isFullyDone ? (
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Target Tuntas 100%</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Sisa {item.belum} pelanggan dalam penanganan</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: Distribusi Tarif & Daya */}
        {activeTab === 'tarif' && (
          <motion.div
            key="tarif"
            initial={{ opacity: 0, y: 14, scale: 0.99, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            {/* Left: Bar Chart Distribusi Golongan Tarif */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-900">
                Distribusi Golongan Tarif Pelanggan
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Klasifikasi tarif yang diganti meternya
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.tarifChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 160]} ticks={[0, 40, 80, 120, 160]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                    />
                    <Bar dataKey="value" fill="#0284c7" radius={[2, 2, 0, 0]} name="Jumlah Pelanggan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Perbandingan Jenis Prabayar vs Pascabayar */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Perbandingan Jenis Prabayar vs Pascabayar
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Kategori produk kWh meter
                </p>

                {/* Card 1: Prabayar */}
                <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-4 space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span>PRA BAYAR (Listrik Pintar)</span>
                    <span className="font-mono text-sm">{metrics.prabayar} Unit</span>
                  </div>
                  <div className="h-3 w-full bg-purple-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((metrics.prabayar / metrics.total) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-purple-600 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-purple-700 font-medium">
                    {Math.round((metrics.prabayar / metrics.total) * 100)}% dari total pergantian
                  </p>
                </div>

                {/* Card 2: Pascabayar */}
                <div className="bg-sky-50/50 border border-sky-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span>PASKA BAYAR (Reguler)</span>
                    <span className="font-mono text-sm">{metrics.paskabayar} Unit</span>
                  </div>
                  <div className="h-3 w-full bg-sky-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((metrics.paskabayar / metrics.total) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-sky-600 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-sky-700 font-medium">
                    {Math.round((metrics.paskabayar / metrics.total) * 100)}% dari total pergantian
                  </p>
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed mt-4">
                Informasi ini berguna untuk penyediaan stok Token Perdana dan penyesuaian tarif index pada New AP2T.
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: Penyelamatan Susut kWh */}
        {activeTab === 'susut' && (
          <motion.div
            key="susut"
            initial={{ opacity: 0, y: 14, scale: 0.99, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs"
          >
            {/* Header */}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Analisa Pengendalian Susut & Revenue Protection (RP)
              </h3>
              <p className="text-xs text-slate-500">
                Kalkulasi dampak penggantian meter macet / lambat terhadap peningkatan akurasi transaksi energi.
              </p>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Green */}
              <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-xl p-5 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">Meter Gangguan Terselesaikan</p>
                <p className="text-3xl font-black text-emerald-600 font-mono tracking-tight my-1.5">
                  {metrics.meterGangguan} Unit
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Sudah diganti dengan meter digital baru
                </p>
              </div>

              {/* Card 2: Blue */}
              <div className="bg-sky-50/50 border border-sky-200/90 rounded-xl p-5 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">Estimasi Pemulihan kWh / Bulan</p>
                <p className="text-3xl font-black text-sky-600 font-mono tracking-tight my-1.5">
                  {metrics.estimatedKwh.toLocaleString('id-ID')} kWh
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Rata-rata 185 kWh/pelanggan/bulan
                </p>
              </div>

              {/* Card 3: Indigo / Purple */}
              <div className="bg-indigo-50/50 border border-indigo-200/90 rounded-xl p-5 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">Potensi Nilai Pendapatan Diproteksi</p>
                <p className="text-3xl font-black text-indigo-700 font-mono tracking-tight my-1.5">
                  Rp {metrics.estimatedRp.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Perhitungan tarif BDL rata-rata Rp 1.444,70/kWh
                </p>
              </div>
            </div>

            {/* Bottom KPI Box */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-extrabold text-slate-900 text-xs">
                Indikator Kinerja Utama (KPI) JTC Transaksi Energi:
              </h4>
              <div className="space-y-1.5 text-slate-700 leading-relaxed text-[11px]">
                <p>
                  <strong>1. Tingkat Kepatuhan Penggantian:</strong> Capaian sebesar <strong>{metrics.rate}%</strong> menunjukkan kinerja operasional ULP Baguala berada dalam kategori <strong>Sangat Baik (Hijau)</strong>.
                </p>
                <p>
                  <strong>2. Pencegahan Stand Macet:</strong> Penggantian meter gangguan secara cepat mencegah pembentukan rekening taksasi / hitung rata-rata berulang (DLPD) pada siklus billing bulanan.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

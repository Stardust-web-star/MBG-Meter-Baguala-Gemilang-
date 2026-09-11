import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MeterRecord, PetugasName } from '../types';
import { PETUGAS_LIST } from '../data/mockData';
import { 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Smartphone, 
  Sparkles, 
  Calendar, 
  Users, 
  Filter, 
  Download, 
  RefreshCw, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  Share2,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MeterRecord[];
  selectedMonth?: string;
  defaultPetugasFilter?: PetugasName;
}

type TemplateType = 'daily' | 'executive' | 'officer_performance' | 'pending_wo' | 'custom';

export function WhatsAppBroadcastModal({
  isOpen,
  onClose,
  records,
  selectedMonth = 'SEPTEMBER',
  defaultPetugasFilter
}: WhatsAppBroadcastModalProps) {
  const [template, setTemplate] = useState<TemplateType>('daily');
  const [targetMonth, setTargetMonth] = useState<string>(selectedMonth || 'SEPTEMBER');
  const [selectedPetugas, setSelectedPetugas] = useState<string>(defaultPetugasFilter || 'ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [senderTitle, setSenderTitle] = useState<string>('Tim TE & Pengawas K3 ULP Baguala');
  const [customNotes, setCustomNotes] = useState<string>('Mohon tim tetap mengutamakan K3 dan kelengkapan dokumen Stand Bongkar.');
  const [targetPhoneNumber, setTargetPhoneNumber] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [waTheme, setWaTheme] = useState<'dark' | 'light'>('dark');

  // Available dates in dataset for the selected month
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    records.forEach(r => {
      const rMonth = (r.bulan || '').toUpperCase();
      if (targetMonth === 'ALL' || rMonth === targetMonth.toUpperCase()) {
        if (r.tanggal && r.tanggal.trim()) {
          dates.add(r.tanggal.trim());
        }
      }
    });
    return Array.from(dates);
  }, [records, targetMonth]);

  // Filter records based on selection
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchMonth = targetMonth === 'ALL' || (r.bulan || '').toUpperCase() === targetMonth.toUpperCase();
      const matchPetugas = selectedPetugas === 'ALL' || (r.petugas || '').toUpperCase() === selectedPetugas.toUpperCase();
      const matchDate = selectedDate === 'ALL' || r.tanggal === selectedDate;
      return matchMonth && matchPetugas && matchDate;
    });
  }, [records, targetMonth, selectedPetugas, selectedDate]);

  // Statistical calculations
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const selesai = filteredRecords.filter(r => r.status === 'SELESAI').length;
    const belum = filteredRecords.filter(r => r.status === 'BELUM').length;
    const pct = total > 0 ? ((selesai / total) * 100).toFixed(1) : '0.0';

    const meterTua = filteredRecords.filter(r => r.gantiMeter === 'METER TUA').length;
    const meterGangguan = filteredRecords.filter(r => r.gantiMeter === 'METER GANGGUAN').length;

    const prabayar = filteredRecords.filter(r => r.jenis === 'PRA BAYAR').length;
    const paskabayar = filteredRecords.filter(r => r.jenis === 'PASKA BAYAR').length;

    // Officer breakdown
    const officerMap: Record<string, { total: number; selesai: number; belum: number }> = {};
    PETUGAS_LIST.forEach(p => {
      officerMap[p] = { total: 0, selesai: 0, belum: 0 };
    });

    filteredRecords.forEach(r => {
      const p = (r.petugas || '').toUpperCase().trim();
      if (!officerMap[p]) {
        officerMap[p] = { total: 0, selesai: 0, belum: 0 };
      }
      officerMap[p].total += 1;
      if (r.status === 'SELESAI') officerMap[p].selesai += 1;
      else officerMap[p].belum += 1;
    });

    const officerRanked = Object.entries(officerMap)
      .map(([name, d]) => ({
        name,
        ...d,
        rate: d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0
      }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.selesai - a.selesai || b.rate - a.rate);

    return {
      total,
      selesai,
      belum,
      pct,
      meterTua,
      meterGangguan,
      prabayar,
      paskabayar,
      officerRanked
    };
  }, [filteredRecords]);

  // Generate WhatsApp Message Content dynamically
  const generatedMessage = useMemo(() => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const header = `⚡ *LAPORAN PENGGANTIAN METER (MBG) 2026*\n🏛️ *PT PLN (PERSERO) ULP BAGUALA - UP3 AMBON*\n📅 Waktu Kirim: ${dateFormatted} (${timeFormatted} WIT)\n📌 Pengirim: ${senderTitle}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (template === 'daily') {
      const dateLabel = selectedDate !== 'ALL' ? selectedDate : `Periode ${targetMonth}`;
      let msg = `${header}\n📢 *LAPORAN HARIAN PROGRESS LAPANGAN*\n📍 Periode/Tanggal: *${dateLabel}*\n\n`;
      msg += `📊 *RINGKASAN REKAPITULASI:*\n`;
      msg += `• Total Work Order (WO) : *${stats.total} Pelanggan*\n`;
      msg += `• ✅ Selesai Diganti   : *${stats.selesai} Unit (${stats.pct}%)*\n`;
      msg += `• ⏳ Belum Diganti     : *${stats.belum} Unit*\n\n`;

      msg += `🏷️ *BERDASARKAN KATEGORI METER:*\n`;
      msg += `• Meter Gangguan : ${stats.meterGangguan} unit\n`;
      msg += `• Meter Tua      : ${stats.meterTua} unit\n`;
      msg += `• Pra Bayar      : ${stats.prabayar} unit\n`;
      msg += `• Pasca Bayar    : ${stats.paskabayar} unit\n\n`;

      if (stats.officerRanked.length > 0) {
        msg += `👷‍♂️ *PRODUKTIVITAS TIM LAPANGAN:*\n`;
        stats.officerRanked.slice(0, 8).forEach((off, idx) => {
          const badge = off.rate === 100 ? '✅' : '⏳';
          msg += `${idx + 1}. *${off.name}*: ${off.selesai}/${off.total} WO (${off.rate}%) ${badge}\n`;
        });
        if (stats.officerRanked.length > 8) {
          msg += `_...dan ${stats.officerRanked.length - 8} petugas lainnya._\n`;
        }
        msg += `\n`;
      }

      if (customNotes) {
        msg += `💡 *CATATAN & INSTRUKSI LAPANGAN:*\n_${customNotes}_\n\n`;
      }

      msg += `⚡ *PLN ULP Baguala - Transaksi Energi & K3*`;
      return msg;
    }

    if (template === 'executive') {
      let msg = `${header}\n📊 *LAPORAN ANALISA & EKSEKUTIF BULANAN*\n📍 Periode Evaluasi: *BULAN ${targetMonth.toUpperCase()} 2026*\n\n`;
      msg += `🎯 *CAPAIAN TARGET PERFORMANCE (KPI):*\n`;
      msg += `• Total WO Ditargetkan : *${stats.total} Pelanggan*\n`;
      msg += `• Realisasi Fisik (DONE): *${stats.selesai} Pelanggan*\n`;
      msg += `• Outstanding Backlog   : *${stats.belum} Pelanggan*\n`;
      msg += `• Persentase Capaian    : *${stats.pct}%*\n\n`;

      msg += `📈 *ANALISA TEKNIS LAPANGAN:*\n`;
      msg += `1. Proporsi Penanganan: *${stats.meterGangguan} Meter Gangguan* & *${stats.meterTua} Meter Tua*.\n`;
      msg += `2. Potensi Penyelematan Energi: Est. *${(stats.meterGangguan * 185).toLocaleString('id-ID')} kWh* dari peremajaan meter macet/gangguan.\n`;
      msg += `3. Kualitas Data Material: 100% SN KWh Meter & SN MCB tercatat akurat untuk audit sistem PLN.\n\n`;

      if (stats.officerRanked.length > 0) {
        msg += `🏆 *TOP 5 PETUGAS TERPRODUKTIF:*\n`;
        stats.officerRanked.slice(0, 5).forEach((off, idx) => {
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️';
          msg += `${medal} *${off.name}*: ${off.selesai} Selesai (${off.rate}% Capaian)\n`;
        });
        msg += `\n`;
      }

      if (customNotes) {
        msg += `📝 *REKOMENDASI MANAJEMEN ULP:*\n_${customNotes}_\n\n`;
      }

      msg += `Cc: Manajer ULP Baguala, Spv TE, Spv K3 & PP`;
      return msg;
    }

    if (template === 'officer_performance') {
      let msg = `${header}\n👷‍♂️ *LAPORAN RINCIAN KINERJA 17 PETUGAS LAPANGAN*\n📍 Periode: *BULAN ${targetMonth.toUpperCase()} 2026*\n\n`;
      msg += `📋 *REKAP KINERJA PER PETUGAS:*\n`;
      
      stats.officerRanked.forEach((off, idx) => {
        const num = (idx + 1).toString().padStart(2, '0');
        const statusBadge = off.rate === 100 ? '🟢 COMPLETE' : off.rate >= 80 ? '🟡 GOOD' : '🔴 BACKLOG';
        msg += `${num}. *${off.name.padEnd(10)}* | WO: ${off.total} | Done: *${off.selesai}* | Pending: ${off.belum} [${off.rate}%] ${statusBadge}\n`;
      });

      msg += `\n📌 *RINGKASAN TIM:*\n`;
      msg += `• Total Tim Aktif  : ${stats.officerRanked.length} Petugas\n`;
      msg += `• Total WO Selesai : *${stats.selesai} / ${stats.total} WO*\n`;
      msg += `• Rata-rata Kinerja : *${stats.pct}%*\n\n`;

      if (customNotes) {
        msg += `📢 *PESAN PENGAWAS LAPANGAN:*\n_${customNotes}_\n\n`;
      }

      msg += `Terima kasih atas kerja keras seluruh tim di lapangan! ⚡`;
      return msg;
    }

    if (template === 'pending_wo') {
      const pendingList = filteredRecords.filter(r => r.status === 'BELUM').slice(0, 15);
      let msg = `${header}\n⚠️ *LAPORAN DAFTAR WORK ORDER (WO) PENDING / BELUM DIGANTI*\n📍 Periode: *BULAN ${targetMonth.toUpperCase()} 2026*\n\n`;
      msg += `🚨 *TOTAL SISA WO PENDING: ${stats.belum} PELANGGAN*\n`;
      msg += `Berikut daftar prioritas pelanggan yang belum diganti:\n\n`;

      if (pendingList.length === 0) {
        msg += `🎉 *Luar Biasa! Tidak ada WO Pending. Seluruh target 100% Tuntas!*\n\n`;
      } else {
        pendingList.forEach((r, idx) => {
          msg += `${idx + 1}. *${r.namaPelanggan}* (${r.idPelanggan})\n`;
          msg += `   📍 Alamat  : ${r.alamat || 'Wilayah ULP Baguala'}\n`;
          msg += `   🏷️ Jenis   : ${r.jenis} - ${r.gantiMeter}\n`;
          msg += `   👷 Petugas : *${r.petugas}*\n\n`;
        });
        if (stats.belum > 15) {
          msg += `_...dan ${stats.belum - 15} pelanggan pending lainnya._\n\n`;
        }
      }

      msg += `📌 *INSTRUKSI:* Mohon petugas penanggung jawab segera melakukan eksekusi penggantian dan updating status di aplikasi.\n\n`;
      msg += `⚡ *PLN ULP Baguala*`;
      return msg;
    }

    if (template === 'custom') {
      return customText || `${header}\n[Ketik pesan custom Anda di kolom sebelah kiri]`;
    }

    return header;
  }, [template, targetMonth, selectedDate, senderTitle, customNotes, stats, filteredRecords, customText]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(generatedMessage);
    let url = '';
    if (targetPhoneNumber && targetPhoneNumber.trim()) {
      let cleanPhone = targetPhoneNumber.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generatedMessage], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_MBG_WhatsApp_${targetMonth}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 dark:from-emerald-700 dark:via-teal-800 dark:to-green-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <Share2 className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg tracking-tight">WhatsApp Broadcast Generator</h3>
                  <span className="bg-emerald-400/20 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    Format PLN ULP Baguala
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium">
                  Buat pesan laporan, statistik, dan analisa penggantian meter siap broadcast ke Grup WA / Petugas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Left Controls Column (5 cols) */}
            <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {/* Template Selector Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  1. Pilih Jenis Template Laporan
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'daily', label: '📢 Laporan Harian Progress', desc: 'Progress WO hari ini / tanggal tertentu' },
                    { id: 'executive', label: '📊 Laporan Eksekutif & Analisa', desc: 'Ringkasan bulanan & KPI Manajer' },
                    { id: 'officer_performance', label: '👷 Laporan Kinerja 17 Petugas', desc: 'Breakdown produktivitas per petugas' },
                    { id: 'pending_wo', label: '⚠️ Laporan Work Order Pending', desc: 'Daftar prioritas pelanggan belum diganti' },
                    { id: 'custom', label: '✍️ Format Bebas / Custom', desc: 'Tulis pesan laporan sesuai kebutuhan' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setTemplate(item.id as TemplateType)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        template === item.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-950 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <div className="font-extrabold text-xs flex items-center justify-between">
                        <span>{item.label}</span>
                        {template === item.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Section */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-xs">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-500" />
                  2. Filter & Parameter Data
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Month Filter */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Pilih Bulan:
                    </label>
                    <select
                      value={targetMonth}
                      onChange={e => setTargetMonth(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="SEPTEMBER">SEPTEMBER 2026</option>
                      <option value="AGUSTUS">AGUSTUS 2026</option>
                      <option value="JULI">JULI 2026</option>
                      <option value="ALL">SEMUA BULAN</option>
                    </select>
                  </div>

                  {/* Petugas Filter */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Filter Petugas:
                    </label>
                    <select
                      value={selectedPetugas}
                      onChange={e => setSelectedPetugas(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="ALL">SEMUA (17 PETUGAS)</option>
                      {PETUGAS_LIST.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Date Filter (if available) */}
                {template === 'daily' && availableDates.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Spesifik Tanggal Kegiatan:
                    </label>
                    <select
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="ALL">Semua Tanggal Bulan {targetMonth}</option>
                      {availableDates.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sender Title Customization */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Jabatan / Pengirim:
                  </label>
                  <input
                    type="text"
                    value={senderTitle}
                    onChange={e => setSenderTitle(e.target.value)}
                    placeholder="Contoh: Pengawas TE ULP Baguala"
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Additional Notes */}
                {template !== 'custom' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Catatan / Pesan Tambahan Pimpinan:
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={e => setCustomNotes(e.target.value)}
                      placeholder="Masukkan catatan khusus untuk tim..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Custom Text Area if Custom Template */}
              {template === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Isi Pesan Custom:
                  </label>
                  <textarea
                    rows={6}
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="Ketik pesan broadcast laporan WhatsApp di sini..."
                    className="w-full text-xs p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              {/* Destination WhatsApp Number Optional */}
              <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Nomor WA Tujuan (Opsional)
                </label>
                <input
                  type="text"
                  value={targetPhoneNumber}
                  onChange={e => setTargetPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890 atau 628..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  Biarkan kosong jika ingin memilih Grup WA atau Kontak langsung saat aplikasi WhatsApp terbuka.
                </p>
              </div>
            </div>

            {/* Right Preview Column (7 cols) */}
            <div className="lg:col-span-7 p-5 flex flex-col justify-between bg-slate-100 dark:bg-slate-950">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Pratinjau Pesan WhatsApp
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setWaTheme(waTheme === 'dark' ? 'light' : 'dark')}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Tema WA: {waTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {generatedMessage.length} Karakter
                    </span>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble Mockup */}
                <div 
                  className={`p-4 rounded-2xl border shadow-inner max-h-[460px] overflow-y-auto transition-colors font-mono text-xs leading-relaxed whitespace-pre-wrap select-text ${
                    waTheme === 'dark' 
                      ? 'bg-[#0b141a] text-[#e9edef] border-[#222d34]' 
                      : 'bg-[#efeae2] text-[#111b21] border-[#d1d7db]'
                  }`}
                  style={{
                    backgroundImage: waTheme === 'dark' 
                      ? 'radial-gradient(#111b21 1px, transparent 0)' 
                      : 'radial-gradient(#e0d8cc 1px, transparent 0)',
                    backgroundSize: '16px 16px'
                  }}
                >
                  {/* WA Message Bubble Container */}
                  <div className={`p-3.5 rounded-2xl max-w-full shadow-md relative border ${
                    waTheme === 'dark'
                      ? 'bg-[#005c4b] text-[#e9edef] border-[#005c4b]'
                      : 'bg-[#d9fdd3] text-[#111b21] border-[#b2f3a6]'
                  }`}>
                    {generatedMessage}

                    {/* Timestamp & double check mark */}
                    <div className="mt-2 text-[10px] text-right font-sans opacity-70 flex items-center justify-end gap-1">
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIT</span>
                      <span className="text-sky-300 dark:text-sky-400 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Simpan .TXT
                  </button>
                </div>

                <div className="flex items-center space-x-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-sm ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Teks Tersalin!' : 'Salin Pesan WA'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSendWhatsApp}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Kirim via WhatsApp
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

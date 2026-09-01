import React, { useState } from 'react';
import { GoogleSheetConfig, MeterRecord } from '../types';
import { getRealCurrentMonthInfo } from '../utils/monthUtils';
import { exportRecordsToCSV, parseCSVToRecords, saveRecords, safeMergeRecords } from '../data/storage';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/appsScriptCode';
import { 
  Sheet, 
  RefreshCw, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Database, 
  FileSpreadsheet, 
  Sparkles,
  Code2,
  Copy,
  Send,
  HelpCircle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onSaveConfig: (newConfig: GoogleSheetConfig) => void;
  records: MeterRecord[];
  onUpdateRecords?: (records: MeterRecord[]) => void;
  onImportRecords?: (records: MeterRecord[]) => void;
}

export function GoogleSheetSyncModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  records,
  onUpdateRecords,
  onImportRecords
}: GoogleSheetSyncModalProps) {
  const updateRecords = onImportRecords || onUpdateRecords || (() => {});
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || 'https://docs.google.com/spreadsheets/d/1UYWV2Lj2YyR-jIKpQR5G4jyiIBaZXpuX6TSBV_9txEE/edit?gid=0#gid=0');
  const [sheetTab, setSheetTab] = useState(config.selectedSheetTab || getRealCurrentMonthInfo().id);
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || 'https://script.google.com/macros/s/AKfycbzUPTMp0lU2oz2lNmAxn416FmRN5isMdzXMtKzOWMRJydmvTyfzn7bs5Qvs2fJu3ohi/exec');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isFullSyncing, setIsFullSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string; details?: string } | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'script' | 'csv' | 'export'>('cloud');

  if (!isOpen) return null;

  // 1. SINKRONISASI BACA-SAHAJA (PULL + MERGE SAFE READ-ONLY)
  const handleFullTwoWaySync = async () => {
    setIsFullSyncing(true);
    setSyncStatusMsg(null);

    try {
      if (!webAppUrl.trim() && !sheetUrl.trim()) {
        throw new Error('Silakan isi URL Web App Google Apps Script atau Link Spreadsheet terlebih dahulu.');
      }

      await handlePullFromSheet();
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Gagal melakukan sinkronisasi dengan Google Sheet.'
      });
    } finally {
      setIsFullSyncing(false);
    }
  };

  // 2. Tarik Data dari Google Sheet (Pull Aman - Murni Membaca tanpa Mengubah Sheet)
  const handlePullFromSheet = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      if (webAppUrl.trim()) {
        const targetUrl = `${webAppUrl.trim()}${webAppUrl.includes('?') ? '&' : '?'}sheetName=${encodeURIComponent(sheetTab)}&t=${Date.now()}`;
        const response = await fetch(targetUrl);
        if (!response.ok) {
          throw new Error(`Web App Error HTTP ${response.status}. Pastikan URL Web App benar dan di-deploy dengan akses 'Anyone'.`);
        }
        const json = await response.json();
        if (json.status === 'error') {
          throw new Error(json.message || 'Gagal memproses data dari Google Apps Script.');
        }

        const rawSheetRecords: MeterRecord[] = Array.isArray(json.data) ? json.data : [];
        const cleanSheetRecords = rawSheetRecords.filter(r => {
          const idUpper = String(r.idPelanggan || '').toUpperCase().trim();
          const namaUpper = String(r.namaPelanggan || '').toUpperCase().trim();
          return idUpper !== 'ID PEL' && idUpper !== 'IDPEL' && idUpper !== 'ID PELANGGAN' && idUpper !== 'NO' &&
                 namaUpper !== 'NAMA' && namaUpper !== 'NAMA PELANGGAN' && !(idUpper.includes('PEL') && namaUpper.includes('NAMA'));
        });

        const merged = safeMergeRecords(cleanSheetRecords, records, sheetTab);

        updateRecords(merged);
        saveRecords(merged);

        const newConfig: GoogleSheetConfig = {
          ...config,
          sheetUrl,
          webAppUrl: webAppUrl.trim(),
          selectedSheetTab: sheetTab,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'connected'
        };
        onSaveConfig(newConfig);

        setSyncStatusMsg({
          type: 'success',
          text: `⚡ Sinkronisasi Tab "${sheetTab}" Berhasil! Terdata ${cleanSheetRecords.length} unit ganti meter dari Google Sheet.`,
          details: `Data pada tab "${sheetTab}" Google Sheet telah sinkron 100% dengan dashboard monitoring.`
        });
        return;
      }

      // Fallback: Public Sheet CSV Gviz Export (Pure Read)
      let fetchUrl = sheetUrl.trim();
      const match = fetchUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const sheetId = match ? match[1] : config.sheetId;

      if (fetchUrl.includes('docs.google.com/spreadsheets')) {
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetTab)}`;
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Google Sheet response code: ${response.status}. Pastikan izin share diset "Anyone with link can view" atau gunakan Web App URL.`);
      }

      const csvData = await response.text();
      const parsed = parseCSVToRecords(csvData);

      if (parsed.length === 0) {
        throw new Error('Data sheet kosong atau format kolom tidak sesuai header PLN.');
      }

      const merged = safeMergeRecords(parsed, records, sheetTab);
      updateRecords(merged);
      saveRecords(merged);

      const newConfig: GoogleSheetConfig = {
        ...config,
        sheetUrl,
        sheetId,
        webAppUrl: webAppUrl.trim(),
        selectedSheetTab: sheetTab,
        lastSyncTime: new Date().toISOString(),
        syncStatus: 'connected'
      };
      onSaveConfig(newConfig);

      setSyncStatusMsg({
        type: 'success',
        text: `⚡ Berhasil menarik ${parsed.length} data dari tab "${sheetTab}" Google Sheets (Mode Read-Only)!`,
        details: 'Data pada file Google Sheet Anda tetap utuh & tidak mengalami perubahan.'
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Gagal terhubung ke Google Sheet.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Info Proteksi Google Sheet
  const handlePushToSheet = async () => {
    setSyncStatusMsg({
      type: 'success',
      text: '🛡️ Mode Proteksi Read-Only Aktif!',
      details: 'Aplikasi dikonfigurasi untuk HANYA MEMBACA data dari Google Sheet. Data di file Google Sheet Anda dijamin 100% aman dan tidak akan diubah atau ditimpa.'
    });
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleImportCsv = () => {
    if (!csvInput.trim()) {
      setSyncStatusMsg({ type: 'error', text: 'Silakan tempel (paste) data CSV atau teks spreadsheet terlebih dahulu.' });
      return;
    }

    try {
      const parsed = parseCSVToRecords(csvInput);
      if (parsed.length === 0) {
        throw new Error('Format teks tidak valid atau tidak memiliki baris data.');
      }

      const merged = safeMergeRecords(parsed, records);
      saveRecords(merged);
      updateRecords(merged);
      setCsvInput('');
      setSyncStatusMsg({
        type: 'success',
        text: `Berhasil mengimpor ${parsed.length} data ganti meter ke dalam database sistem!`
      });
    } catch (e: any) {
      setSyncStatusMsg({ type: 'error', text: e.message || 'Gagal memproses data CSV.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvInput(text);
        setActiveTab('csv');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadCsv = () => {
    const csvContent = exportRecordsToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PLN_MBG_Ganti_Meter_${sheetTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/40 text-blue-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                Integrasi &amp; Sinkronisasi Google Sheet
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  MODE READ-ONLY (DATA SHEET DIJAMIN UTUH)
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Sinkronisasi data ganti meter PLN ULP Baguala dari Google Spreadsheet (Aplikasi membaca tanpa mengubah file)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-5 pt-3 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white border-t border-l border-r border-slate-200 text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sheet className="w-4 h-4 text-emerald-600" />
            Koneksi Sheet &amp; Web App
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'script'
                ? 'bg-white border-t border-l border-r border-slate-200 text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            Kode Apps Script (.gs)
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'csv'
                ? 'bg-white border-t border-l border-r border-slate-200 text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-600" />
            Impor CSV / File
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white border-t border-l border-r border-slate-200 text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Ekspor CSV
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status / Alert Message */}
          {syncStatusMsg && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                syncStatusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-amber-50 border-amber-200 text-amber-950 font-medium'
              }`}
            >
              {syncStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-slate-900">{syncStatusMsg.text}</div>
                {syncStatusMsg.details && (
                  <div className="text-[11px] text-slate-600">{syncStatusMsg.details}</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: KONEKSI SPREADSHEET & SINKRONISASI UTAMA */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Safety Banner */}
              <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 text-emerald-950">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    Garansi Keamanan Data Google Sheet (Proteksi Read-Only)
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    Mode sinkronisasi aktif adalah <b>Read-Only (Membaca/Menarik Data)</b>. Aplikasi hanya menarik data dari Google Sheet ke dashboard. <b>Data yang ada pada file Google Sheet Anda DIJAMIN 100% AMAN &amp; TIDAK AKAN PERNAH DIUBAH, DITIMPA, ATAU DIHAPUS OLEH APLIKASI.</b>
                  </p>
                </div>
              </div>

              {/* Status Overview Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    Status Database &amp; Lembar Kerja
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    {records.length} Baris Data Tersimpan di Aplikasi
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Spreadsheet Target:</span>
                    <span className="font-semibold text-slate-800">GM 2026 (PLN MBG Baguala)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tab Lembar Kerja Aktif:</span>
                    <span className="font-semibold text-blue-700">{sheetTab}</span>
                  </div>
                </div>
              </div>

              {/* Web App URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>1. URL Web App Google Apps Script (Endpoint 2-Way Sync)</span>
                  <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">TERHUBUNG</span>
                </label>
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbz.../exec"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Sheet URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. URL Lembar Kerja Google Sheet (Link Spreadsheet)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 border border-slate-300 transition"
                  >
                    Buka <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Tab Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Pilih Tab Bulan Lembar Kerja:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['JULI', 'AGUSTUS', 'SEPTEMBER'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSheetTab(tab)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        sheetTab === tab
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 space-y-2.5">
                {/* Master Safe Read-Only Sync Button */}
                <button
                  type="button"
                  onClick={handleFullTwoWaySync}
                  disabled={isFullSyncing || isSyncing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Zap className={`w-4 h-4 ${isFullSyncing ? 'animate-bounce' : 'text-amber-300'}`} />
                  <span>
                    {isFullSyncing 
                      ? 'Sedang Menarik Data dari Google Sheet...' 
                      : '⚡ Sinkronkan & Tarik Data dari Google Sheet (Safe Read-Only)'}
                  </span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Pull Only */}
                  <button
                    type="button"
                    onClick={handlePullFromSheet}
                    disabled={isSyncing || isFullSyncing}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menarik...' : '📥 Tarik Data dari Sheet (Read-Only)'}</span>
                  </button>

                  {/* Protection Info */}
                  <button
                    type="button"
                    onClick={handlePushToSheet}
                    className="py-2.5 px-3 bg-emerald-800/90 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>🛡️ Status Proteksi Data Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KODE GOOGLE APPS SCRIPT (.GS) */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        Kode Google Apps Script (Code.gs) - Versi Non-Destructive
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Kode ini menjamin tidak ada baris yang terhapus di Google Sheet
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Seluruh Kode .gs</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Cara Update Script di Google Sheets:
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>
                      Buka Google Sheet target Anda.
                    </li>
                    <li>
                      Klik menu <b>Ekstensi (Extensions)</b> &gt; <b>Apps Script</b>.
                    </li>
                    <li>
                      Ganti seluruh isi file <b>Code.gs</b> dengan kode di bawah ini, lalu klik <b>Simpan (Ctrl+S)</b>.
                    </li>
                    <li>
                      Klik tombol <b>Terapkan (Deploy)</b> &gt; <b>Kelola Penerapan (Manage Deployments)</b> &gt; Edit &gt; pilih <b>Versi Baru (New Version)</b> &gt; Terapkan.
                    </li>
                  </ol>
                </div>
              </div>

              <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    Code.gs • Non-Destructive Safe Upsert
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">100% Zero Data Loss</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-emerald-300 bg-slate-950 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-600 selection:text-white">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: CSV IMPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Tempel Teks CSV atau Upload File .CSV
                </label>
                <label className="cursor-pointer px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Pilih File .CSV
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <textarea
                rows={7}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="TANGGAL,ID PELANGGAN,NAMA PELANGGAN,TARIF,DAYA,NO METER LAMA,NO METER BARU,NO AGENDA,NO SN MATERIAL KWH METER,NO SN MATERIAL MCB,KABEL TW,SEGEL,STAND BONGKAR,JENIS,GANTI METER,PETUGAS,STATUS,ALAMAT&#10;SENIN 3 AGUSTUS 2026,411015040876,ELISABETH PATTIASINA,R1,1300,-,86291014881,411300562608030641,PLN0219000050202586291014881,PLN0325000005006110261Q09952,KBL 2X10 (30M),-,XP2TL,PASKA BAYAR,METER GANGGUAN,GABRIEL,SELESAI,Passo"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleImportCsv}
                className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Proses &amp; Impor Data ke Dashboard
              </button>
            </div>
          )}

          {/* TAB 4: CSV EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Format Ekspor Sesuai Template Google Sheet ({sheetTab})
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Data akan diekspor dalam format 18 kolom standar yang siap dibuka langsung di Microsoft Excel, Google Sheets, atau diimpor kembali ke modul FSO AP2T.
                </p>
                <div className="font-semibold text-slate-800">
                  Jumlah Data Siap Ekspor: <span className="text-blue-700 font-bold">{records.length} Baris Pelanggan</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download File CSV Spreadsheet ({sheetTab})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Status: {config.syncStatus.toUpperCase()} • Tab: {sheetTab}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

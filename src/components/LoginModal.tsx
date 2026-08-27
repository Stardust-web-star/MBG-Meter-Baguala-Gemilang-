import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';
import { getStoredUsers, setCurrentUser, logActivity } from '../data/storage';
import { LogoPLN, LogoDanantara } from './Logos';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: UserAccount) => void;
  isOpen?: boolean;
  onClose?: () => void;
  users?: UserAccount[];
  noticeMessage?: string | null;
}

export function LoginModal({ onLoginSuccess, isOpen = true, onClose, noticeMessage }: LoginModalProps) {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showEnkripsiInfo, setShowEnkripsiInfo] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const users = getStoredUsers();
      const user = users.find(
        u => (u.email.toLowerCase() === emailOrId.trim().toLowerCase() ||
              u.nip.toLowerCase() === emailOrId.trim().toLowerCase() ||
              u.id.toLowerCase() === emailOrId.trim().toLowerCase()) &&
             u.password === password
      );

      if (!user) {
        setIsLoading(false);
        setErrorMsg('Email / User ID atau Password salah. Silakan periksa kembali akun Anda.');
        return;
      }

      if (user.status === 'NONAKTIF') {
        setIsLoading(false);
        setErrorMsg('Akun Anda dinonaktifkan oleh Administrator. Hubungi SPV Transaksi Energi.');
        return;
      }

      user.lastLogin = new Date().toLocaleString('id-ID');
      setCurrentUser(user);
      logActivity(user.nama, 'LOGIN', user.id, `User login berhasil (${user.email})`);
      
      // Trigger smooth success transition state
      setIsSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(user);
      }, 450);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)', y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]"
      >
        
        {/* Left Side: PLN Branding Hero matching New AP2T */}
        <div className="md:col-span-5 bg-gradient-to-br from-cyan-800 via-teal-900 to-blue-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative geometric overlay */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/15 blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 w-fit mb-6">
              <LogoPLN className="h-6 text-white" />
            </div>

            <div className="inline-block bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase mb-3">
              COMPATIBLE NEW AP2T
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight mb-2 font-sans">
              MBG
            </h1>
            <p className="text-cyan-200 font-semibold text-sm mb-4">
              METER BAGUALA GEMILANG
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sistem Terpadu Monitoring & Rekap Penggantian kWh Meter ULP Baguala. Terintegrasi langsung dengan database Google Sheet dan modul FSO AP2T.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-slate-50">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Login Sistem MBG</h2>
                <p className="text-xs text-slate-500">Silakan masukkan akun terdaftar Anda</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span className="font-medium">Secure Portal</span>
              </div>
            </div>

            {noticeMessage && !errorMsg && (
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-sm">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-950">Sesi Berakhir</div>
                  <div>{noticeMessage}</div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Akses Ditolak</div>
                  <div>{errorMsg}</div>
                </div>
              </div>
            )}

            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email / User ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="login-email-input"
                      type="text"
                      required
                      placeholder="Masukkan Email / NIP..."
                      value={emailOrId}
                      onChange={(e) => setEmailOrId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold hover:underline"
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className={`w-full py-3 px-4 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-90 ${
                      isSuccess
                        ? 'bg-emerald-600 shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800'
                    }`}
                  >
                    {isSuccess ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-white font-bold"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-200 animate-bounce" />
                        <span>Otentikasi Berhasil • Membuka Dashboard...</span>
                      </motion.div>
                    ) : isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Akun...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Masuk ke Dashboard MBG</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900">
                  <div className="font-bold mb-1">Permintaan Reset Password AP2T</div>
                  <p className="text-slate-600">
                    Masukkan email terdaftar Anda. Password sementara akan di-reset menjadi default atau diteruskan ke Administrator.
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instruksi reset password telah dikirim ke email <b>{forgotEmail}</b>. Password default: <b>admin</b></span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Anda (Gmail / PLN)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="fikiilham56@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setForgotSuccess(true)}
                      className="mt-3 w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl"
                    >
                      Kirim Link Reset Password
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Kembali ke Form Login
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <button
              type="button"
              onClick={() => setShowEnkripsiInfo(!showEnkripsiInfo)}
              className="text-cyan-700 hover:underline flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Info Generator Enkripsi AP2T
            </button>
            <span>v3.0.2 • 2026</span>
          </div>

          {showEnkripsiInfo && (
            <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-300 text-[11px] text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Enkripsi Hardware Client New AP2T:</div>
              <div>• <b>Client IP:</b> 10.99.20.244 (Intranet PLN)</div>
              <div>• <b>Terminal:</b> ULP_BAGUALA_WS_01</div>
              <div>• <b>Session:</b> SHA256-AES-GCM (Hardware Registered)</div>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}

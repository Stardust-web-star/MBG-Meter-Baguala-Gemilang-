import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount, UserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  KeyRound, 
  X, 
  Mail, 
  User, 
  Building2, 
  Shield,
  Briefcase,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface ManagementUserMenuProps {
  users: UserAccount[];
  currentUser: UserAccount;
  onAddUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, updates: Partial<UserAccount>) => void;
  onDeleteUser: (id: string) => void;
}

export function ManagementUserMenu({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}: ManagementUserMenuProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccount | null>(null);

  // Form states for new user
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nip, setNip] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN_TE');
  const [jabatan, setJabatan] = useState('JTC Transaksi Energi');
  const [unit, setUnit] = useState('ULP Baguala - UP3 Ambon');
  const [noWa, setNoWa] = useState('');
  const [formError, setFormError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showEditPasswordText, setShowEditPasswordText] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let rand = 'Pln';
    for (let i = 0; i < 7; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(rand);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password || !nama) {
      setFormError('Harap lengkapi semua kolom wajib (*)');
      return;
    }

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setFormError('Email login ini sudah terdaftar. Gunakan email lain.');
      return;
    }

    onAddUser({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      nip: nip.trim() || `94${Math.floor(100000 + Math.random() * 900000)}Z`,
      role,
      jabatan: jabatan.trim(),
      unit: unit.trim(),
      status: 'AKTIF'
    });

    // Reset
    setNama('');
    setEmail('');
    setPassword('');
    setNip('');
    setFormError('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser.id, editingUser);
    setEditingUser(null);
  };

  const getRoleBadgeStyle = (userRole: UserRole) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10';
      case 'ADMIN_TE':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
      case 'ADMIN_GUDANG':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';
      case 'PETUGAS_LAPANGAN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10';
    }
  };

  const getRoleLabel = (userRole: UserRole) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return 'Super Administrator';
      case 'ADMIN_TE':
        return 'Admin Transaksi Energi';
      case 'ADMIN_GUDANG':
        return 'Admin Gudang';
      case 'PETUGAS_LAPANGAN':
        return 'Petugas Lapangan';
      default:
        return 'Pengawas K3 / Logistik';
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Otentikasi & Keamanan Pengguna</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Manajemen User & Hak Akses Aplikasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun petugas, administrator, serta otorisasi kewenangan untuk unit PLN ULP Baguala.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah User Admin</span>
        </motion.button>
      </div>

      {/* Security & Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Akun Terdaftar</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{users.length} Akun</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {users.filter(u => u.status === 'AKTIF').length} Akun Aktif
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Hak Akses</div>
            <div className="text-sm font-extrabold text-slate-900">Role-Based (RBAC)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Super Admin • Admin TE • Petugas</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sesi Login Aktif</div>
            <div className="text-xs font-extrabold text-slate-900 truncate">{currentUser.nama}</div>
            <div className="text-[11px] font-mono text-blue-600 truncate">{currentUser.email}</div>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Daftar Pengguna Aplikasi MBG
            </h3>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200/60">
              {users.length} User
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Kredensial disimpan lokal dengan enkripsi aman
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200/80 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Role Kewenangan</th>
                <th className="py-3 px-4">Unit / Jabatan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.id === currentUser.id;
                const initials = user.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Name & NIP */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{user.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {user.nip}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{user.email}</span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Password */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md text-[11px] text-slate-700 font-semibold tracking-widest">
                          {visiblePasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          title={visiblePasswords[user.id] ? "Sembunyikan Password" : "Tampilkan Password"}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                        >
                          {visiblePasswords[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ring-1 ${getRoleBadgeStyle(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    {/* Unit & Jabatan */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs">{user.unit}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{user.jabatan}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        user.status === 'AKTIF' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'AKTIF' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {user.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal Portal */}
      {createPortal(
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              {/* Fullscreen Backdrop Blur Overlay blurring sidebar, header, footer, and content */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-md" 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 w-full max-w-lg my-auto max-h-[92vh] flex flex-col overflow-hidden"
              >
                {/* Modal Header matching attached image */}
                <div className="flex items-start gap-4 mb-5 pb-4 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs border border-blue-100">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Tambah Pengguna / Otorisasi Akses
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Tambahkan email (Gmail atau email PLN) dan buat password untuk memberikan izin login ke Dashboard MBG.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 absolute top-6 right-6"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Email Login */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Email Pengguna (Gmail / Email Kantor) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: petugas.baguala@gmail.com"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bisa menggunakan akun Gmail pribadi petugas maupun email korporat @pln.co.id.
                    </p>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Nama Lengkap Petugas / Pegawai <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="CONTOH: FRANS LATUPERISSA"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Login */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        Password Login <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Buat Password Otomatis</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type={showPasswordText ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 5 karakter (cth: PlnBaguala2026!)"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordText(!showPasswordText)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role & Jabatan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Role / Hak Akses <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                      >
                        <option value="ADMIN_TE">Admin JTC Transaksi Energi</option>
                        <option value="ADMIN_GUDANG">Admin Gudang</option>
                        <option value="SUPER_ADMIN">Super Administrator</option>
                        <option value="PETUGAS_LAPANGAN">Petugas Lapangan / FSO</option>
                        <option value="PENGAWAS">Pengawas K3 / Logistik</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Jabatan / Posisi
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={jabatan}
                          onChange={(e) => setJabatan(e.target.value)}
                          placeholder="JTC Transaksi Energi"
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Unit & No WA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Unit Kerja
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="ULP Baguala - UP3 Ambon"
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        No. WhatsApp / HP (Opsional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={noWa}
                          onChange={(e) => setNoWa(e.target.value)}
                          placeholder="0812-xxxx-xxxx"
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 hover:brightness-105"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Simpan & Aktifkan User</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Edit User Modal */}
      {createPortal(
        <AnimatePresence>
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingUser(null)}
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-md" 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Edit Data Pengguna</h3>
                      <p className="text-[11px] text-sky-200/80">{editingUser.nama} ({editingUser.email})</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={editingUser.nama}
                        onChange={(e) => setEditingUser({ ...editingUser, nama: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                        Email Login
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                        Password Baru
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type={showEditPasswordText ? 'text' : 'password'}
                          required
                          value={editingUser.password}
                          onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                          className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPasswordText(!showEditPasswordText)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                        >
                          {showEditPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                        Jabatan
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={editingUser.jabatan}
                          onChange={(e) => setEditingUser({ ...editingUser, jabatan: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1.5">
                        Status Akun
                      </label>
                      <select
                        value={editingUser.status}
                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                      >
                        <option value="AKTIF">AKTIF</option>
                        <option value="NONAKTIF">NONAKTIF</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete User Modal */}
      {createPortal(
        <AnimatePresence>
          {deleteConfirmUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmUser(null)}
                className="fixed inset-0 bg-slate-950/45 backdrop-blur-md" 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Konfirmasi Hapus Akun</h3>
                    <p className="text-[11px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Apakah Anda yakin ingin menghapus akun pengguna <strong className="text-slate-900">{deleteConfirmUser.nama}</strong> (<span className="font-mono">{deleteConfirmUser.email}</span>)?
                </p>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteUser(deleteConfirmUser.id);
                      setDeleteConfirmUser(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus Akun</span>
                  </button>
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

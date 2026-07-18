import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  UserPlus,
  Trash,
  Check,
  X,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Mail,
  Calendar,
  AlertCircle,
  Activity,
  Sliders,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
import { roleOptions } from '../data/mockData';

interface UserManagementProps {
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (id: string) => void;
  onAddUser: (user: Omit<User, 'id' | 'joinDate' | 'lastActive'>) => void;
}

export default function UserManagement({
  users,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
}: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Form states for creating a new user
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Editor');
  const [newUserStatus, setNewUserStatus] = useState<UserStatus>('Aktif');
  const [formError, setFormError] = useState('');

  // Editing direct permissions popover
  const [editingPermissionsUserId, setEditingPermissionsUserId] = useState<string | null>(null);

  // Filter and Search logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'Semua' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'Semua' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Form submit handler
  const handleCreateUserSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setFormError('Nama dan Email wajib diisi.');
      return;
    }
    if (!newUserEmail.includes('@')) {
      setFormError('Format email tidak valid.');
      return;
    }

    // Default permissions based on role
    const permissions = roleOptions.find((r) => r.role === newUserRole)?.permissions || ['read_data'];

    // Random avatar
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: newUserStatus,
      avatar: randomAvatar,
      permissions,
    });

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Editor');
    setNewUserStatus('Aktif');
    setFormError('');
    setIsAddingUser(false);
  };

  // Change user role and auto-update permissions
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (userToUpdate) {
      const defaultPerms = roleOptions.find((r) => r.role === newRole)?.permissions || ['read_data'];
      onUpdateUser({
        ...userToUpdate,
        role: newRole,
        permissions: defaultPerms,
      });
    }
  };

  // Change user status
  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (userToUpdate) {
      onUpdateUser({
        ...userToUpdate,
        status: newStatus,
      });
    }
  };

  // Toggle dynamic permission
  const handleTogglePermission = (userId: string, permission: string) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (userToUpdate) {
      const currentPerms = [...userToUpdate.permissions];
      const hasPerm = currentPerms.includes(permission);
      const newPerms = hasPerm
        ? currentPerms.filter((p) => p !== permission)
        : [...currentPerms, permission];

      onUpdateUser({
        ...userToUpdate,
        permissions: newPerms,
      });
    }
  };

  // Role badges colors
  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40';
      case 'Admin':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40';
      case 'Editor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40';
      case 'Viewer':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700/60';
    }
  };

  // Status badge colors
  const getStatusBadgeClass = (status: UserStatus) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Nonaktif':
        return 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400';
      case 'Ditangguhkan':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
    }
  };

  // Human friendly descriptions of permissions
  const permissionLabels: Record<string, string> = {
    all_access: 'Akses Penuh',
    read_data: 'Baca Data',
    write_data: 'Tulis Data',
    delete_data: 'Hapus Data',
    manage_users: 'Kelola Admin',
  };

  return (
    <div id="users-card" className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-50 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-500" />
            Manajemen Hak Akses Pengguna
          </h2>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
            Kelola peran, izin akses modular, dan status keaktifan tim Anda.
          </p>
        </div>

        <button
          onClick={() => setIsAddingUser(true)}
          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-sm shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-neutral-600" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 rounded-xl focus:outline-hidden focus:border-indigo-500/80 dark:focus:border-indigo-500/80 transition-colors placeholder:text-gray-400 text-gray-700 dark:text-neutral-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 rounded-xl px-3 py-1">
          <Filter className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-600 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 shrink-0">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
          >
            <option value="Semua" className="dark:bg-neutral-900">Semua Role</option>
            <option value="Super Admin" className="dark:bg-neutral-900 font-semibold">Super Admin</option>
            <option value="Admin" className="dark:bg-neutral-900">Admin</option>
            <option value="Editor" className="dark:bg-neutral-900">Editor</option>
            <option value="Viewer" className="dark:bg-neutral-900">Viewer</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 rounded-xl px-3 py-1">
          <Sliders className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-600 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-400 dark:text-neutral-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
          >
            <option value="Semua" className="dark:bg-neutral-900">Semua Status</option>
            <option value="Aktif" className="dark:bg-neutral-900">Aktif</option>
            <option value="Nonaktif" className="dark:bg-neutral-900">Nonaktif</option>
            <option value="Ditangguhkan" className="dark:bg-neutral-900">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Add User Modal Dialog Panel */}
      <AnimatePresence>
        {isAddingUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-5 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/20 dark:bg-indigo-950/5 rounded-2xl"
          >
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center">
              <UserPlus className="w-4 h-4 mr-1.5" /> Registrasi Pengguna Baru
            </h3>
            
            <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-neutral-400 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Andi Wijaya"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-700 dark:text-neutral-300 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-neutral-400 mb-1">
                  Email Korporat
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-700 dark:text-neutral-300 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-neutral-400 mb-1">
                  Hak Peran (Role)
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl cursor-pointer"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>

            {formError && (
              <div className="mt-3 text-xs text-rose-600 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> {formError}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Area */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
              <th className="pb-3 pt-1">Nama Pengguna</th>
              <th className="pb-3 pt-1">Peran (Role)</th>
              <th className="pb-3 pt-1">Status</th>
              <th className="pb-3 pt-1">Izin Akses Khusus (Permissions)</th>
              <th className="pb-3 pt-1 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-neutral-800/40">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-400 dark:text-neutral-500">
                  Tidak ada pengguna ditemukan yang cocok dengan kriteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-neutral-50/20 dark:hover:bg-neutral-950/20 transition-colors">
                  {/* Name column */}
                  <td className="py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-neutral-800"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                            user.status === 'Aktif'
                              ? 'bg-emerald-500'
                              : user.status === 'Nonaktif'
                              ? 'bg-gray-400'
                              : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-neutral-500 flex items-center mt-0.5">
                          <Mail className="w-2.5 h-2.5 mr-1" /> {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role Selection Dropdown */}
                  <td className="py-3.5">
                    <div className="flex items-center">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-hidden ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="py-3.5">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-sm bg-transparent cursor-pointer focus:outline-hidden ${getStatusBadgeClass(
                        user.status
                      )}`}
                    >
                      <option value="Aktif" className="dark:bg-neutral-900 text-emerald-600">Aktif</option>
                      <option value="Nonaktif" className="dark:bg-neutral-900 text-gray-500">Nonaktif</option>
                      <option value="Ditangguhkan" className="dark:bg-neutral-900 text-rose-600">Ditangguhkan</option>
                    </select>
                  </td>

                  {/* Custom modular permissions list */}
                  <td className="py-3.5 max-w-[240px]">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center text-[9px] bg-indigo-50/50 text-indigo-600/90 dark:bg-indigo-950/20 dark:text-indigo-400/90 px-1.5 py-0.5 rounded-sm border border-indigo-100/30"
                        >
                          {permissionLabels[p] || p}
                        </span>
                      ))}

                      {/* Customize button */}
                      <button
                        onClick={() =>
                          setEditingPermissionsUserId(
                            editingPermissionsUserId === user.id ? null : user.id
                          )
                        }
                        className="text-[9px] text-gray-400 hover:text-indigo-600 cursor-pointer flex items-center font-medium bg-gray-50 hover:bg-indigo-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-1.5 py-0.5 rounded-sm border border-transparent transition-all"
                      >
                        {editingPermissionsUserId === user.id ? 'Tutup' : 'Sesuaikan...'}
                      </button>
                    </div>

                    {/* Popover to customize permissions */}
                    <AnimatePresence>
                      {editingPermissionsUserId === user.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-20 mt-2 p-3 bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-xl shadow-lg w-52 text-left"
                        >
                          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <Activity className="w-3 h-3 mr-1 text-indigo-500" />
                            Sesuaikan Izin Akses
                          </h5>
                          <div className="space-y-1.5">
                            {Object.keys(permissionLabels).map((p) => {
                              const isChecked = user.permissions.includes(p);
                              return (
                                <label
                                  key={p}
                                  className="flex items-center text-[10px] text-gray-600 dark:text-neutral-400 cursor-pointer hover:text-indigo-600"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(user.id, p)}
                                    className="mr-1.5 rounded-xs border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  {permissionLabels[p]}
                                </label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>

                  {/* Actions column */}
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus akun ${user.name}?`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Hapus Pengguna"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer stats count */}
      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-50 dark:border-neutral-800/50">
        <span>Total: <strong>{users.length} Admin terdaftar</strong></span>
        <span>Filter: <strong>{filteredUsers.length} ditampilkan</strong></span>
      </div>
    </div>
  );
}

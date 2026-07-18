import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Moon,
  Sun,
  Bell,
  Settings,
  Shield,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  Award,
  LogOut,
  Sliders,
  Terminal,
} from 'lucide-react';

import { User, ActivityLog, StatCard } from './types';
import { initialStats, initialUsers, initialLogs } from './data/mockData';

// Component imports
import BentoStats from './components/BentoStats';
import SalesChart from './components/SalesChart';
import UserManagement from './components/UserManagement';
import ActivityLogs from './components/ActivityLogs';
import TopProducts from './components/TopProducts';

export default function App() {
  // Reactive States
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [stats, setStats] = useState<StatCard[]>(initialStats);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  
  // Navigation sidebar toggle on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview');

  // Interactive notification state
  const [notifications, setNotifications] = useState<string[]>([
    'Transaksi baru berhasil #TX-99843 dari Sistem Pembayaran',
    'Dewi Lestari baru saja masuk ke sistem admin',
    'Gagal melakukan otentikasi API Key di server cadangan',
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Apply dark mode theme class to HTML node
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handler to simulate refreshing single stat card with animation
  const handleRefreshStat = (id: string) => {
    setStats((prevStats) => {
      return prevStats.map((stat) => {
        if (stat.id === id) {
          // Parse numerical value
          let numVal = parseFloat(stat.value.replace(/[^0-9,-]/g, '').replace(',', '.'));
          if (isNaN(numVal)) numVal = 500;

          // Introduce a slight randomized fluctuation (+/- 1.5% to 5%)
          const percentChange = (Math.random() * 6 - 3) / 100;
          const newVal = numVal * (1 + percentChange);
          
          let formattedVal = '';
          if (stat.title.includes('Pendapatan')) {
            formattedVal = `Rp ${new Intl.NumberFormat('id-ID', {
              maximumFractionDigits: 0,
            }).format(Math.round(newVal))}`;
          } else if (stat.title.includes('Rasio')) {
            formattedVal = `${newVal.toFixed(2).replace('.', ',')}%`;
          } else {
            formattedVal = Math.round(newVal).toLocaleString('id-ID');
          }

          const newChange = stat.change + parseFloat((percentChange * 100).toFixed(1));

          return {
            ...stat,
            value: formattedVal,
            change: parseFloat(newChange.toFixed(1)),
            trend: (percentChange >= 0 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
            timeframe: 'baru saja dihitung',
          };
        }
        return stat;
      });
    });

    // Push notification to user
    handleAddNotification(`Metrik '${stats.find((s) => s.id === id)?.title}' berhasil dihitung ulang secara real-time.`);
  };

  // User list event handlers
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prevUsers) => prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    
    // Add transaction log
    const logTime = new Date().toTimeString().split(' ')[0];
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: logTime,
      user: {
        name: 'Super Admin',
        email: 'budi.santoso@admin.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      action: `Mengubah hak akses / status pengguna: ${updatedUser.name}`,
      category: 'security',
      status: 'warning',
      ip: '127.0.0.1',
      details: `Role: ${updatedUser.role} • Status: ${updatedUser.status}`,
    };
    handleAddNewLog(newLog);
  };

  const handleDeleteUser = (id: string) => {
    const deletedUser = users.find((u) => u.id === id);
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));

    // Add security log
    if (deletedUser) {
      const logTime = new Date().toTimeString().split(' ')[0];
      const newLog: ActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp: logTime,
        user: {
          name: 'Super Admin',
          email: 'budi.santoso@admin.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
        action: `Menghapus administrator: ${deletedUser.name}`,
        category: 'security',
        status: 'error',
        ip: '127.0.0.1',
        details: `Email: ${deletedUser.email} (Dihapus permanen)`,
      };
      handleAddNewLog(newLog);
    }
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'joinDate' | 'lastActive'>) => {
    const createdUser: User = {
      ...newUser,
      id: `USR-0${users.length + 1}`,
      joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastActive: 'Baru saja',
    };
    setUsers((prevUsers) => [createdUser, ...prevUsers]);

    // Add transaction log
    const logTime = new Date().toTimeString().split(' ')[0];
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: logTime,
      user: {
        name: 'Super Admin',
        email: 'budi.santoso@admin.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      action: `Mendaftarkan administrator baru: ${createdUser.name}`,
      category: 'security',
      status: 'success',
      ip: '127.0.0.1',
      details: `Role awal: ${createdUser.role} • Email: ${createdUser.email}`,
    };
    handleAddNewLog(newLog);
  };

  // Activity log stream handlers
  const handleAddNewLog = (newLog: ActivityLog) => {
    setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 49)]); // Keep last 50 logs for performance
    
    // Add to interactive top notification if it is high priority
    if (newLog.status === 'error' || newLog.status === 'warning') {
      handleAddNotification(`[${newLog.status.toUpperCase()}] ${newLog.action}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    handleAddNotification('Semua logs audit berhasil dibersihkan dari memori.');
  };

  const handleAddNotification = (text: string) => {
    setNotifications((prev) => [text, ...prev.slice(0, 9)]);
  };

  return (
    <div className={`min-h-screen font-sans flex text-gray-900 dark:text-neutral-100 bg-gray-50/50 dark:bg-neutral-950 transition-colors duration-300`}>
      
      {/* 1. SIDEBAR NAVIGATION - Responsive (Desktop sidebar, mobile overlay drawer) */}
      <aside
        id="sidebar-navigation"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-neutral-900 border-r border-gray-100 dark:border-neutral-800 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand / Workspace */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 dark:border-neutral-800/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                  Core Admin
                </h1>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
                  V2.0.4 • Active
                </span>
              </div>
            </div>

            {/* Mobile close menu */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats Summary in Sidebar */}
          <div className="mx-4 my-4 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100/50 dark:border-neutral-800/40 hidden md:block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Status Sistem
              </span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-semibold text-gray-700 dark:text-neutral-300">
                All Node Online
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-2 space-y-1">
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Ringkasan Bisnis</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Hak Akses Tim</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('logs');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'logs'
                  ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4.5 h-4.5" />
              <span>Log Aktivitas</span>
            </button>
          </nav>
        </div>

        {/* Footer Admin User profile in Sidebar */}
        <div className="p-4 border-t border-gray-50 dark:border-neutral-800/60 bg-gray-50/30 dark:bg-neutral-900/40">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt="Avatar Admin"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/20"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Budi Santoso
              </h4>
              <span className="text-[10px] text-gray-400 truncate block">
                Super Admin
              </span>
            </div>
            <button
              onClick={() => {
                if (confirm('Keluar dari sesi demonstrasi template admin?')) {
                  alert('Sesi demo disimulasikan selesai.');
                }
              }}
              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer transition-colors"
              title="Selesai Sesi"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Background Dim Backdrop on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. MAIN HUB CONTENT PANEL */}
      <main className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        
        {/* Top Floating Dashboard Navbar */}
        <header className="h-16 border-b border-gray-100 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          {/* Left panel: Burger + Greeting */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-gray-100 hover:bg-gray-100 text-gray-600 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                <span>Halo, Budi Santoso</span>
                <Sparkles className="w-4 h-4 ml-1.5 text-indigo-500 animate-bounce" />
              </h2>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                Pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • Sesi Admin aktif dengan enkripsi aman
              </p>
            </div>
          </div>

          {/* Right panel: Controls, Theme, Notifications */}
          <div className="flex items-center space-x-2.5">
            
            {/* Quick Refresh Stats Trigger */}
            <button
              onClick={() => {
                // Refresh all stat cards
                stats.forEach((s) => handleRefreshStat(s.id));
              }}
              className="p-2 text-gray-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 transition-all cursor-pointer"
              title="Hitung ulang semua metrik"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Dark/Light mode toggle switch */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 transition-all cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Notification drop indicator with drop menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800 transition-all relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Popover overlay trigger to close */}
                    <div onClick={() => setShowNotifications(false)} className="fixed inset-0 z-10" />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl p-4 z-20"
                    >
                      <div className="flex justify-between items-center pb-2.5 mb-2 border-b border-gray-50 dark:border-neutral-800">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          Pemberitahuan ({notifications.length})
                        </h3>
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                        >
                          Hapus Semua
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-center text-gray-400 py-6">
                            Tidak ada pemberitahuan baru.
                          </p>
                        ) : (
                          notifications.map((notif, index) => (
                            <div
                              key={index}
                              className="p-2 text-[11px] leading-relaxed text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-start space-x-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <p className="flex-1">{notif}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick avatar wrapper */}
            <div className="h-8 w-8 rounded-full bg-indigo-500 overflow-hidden border border-indigo-500/10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="Budi Santoso avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* 3. CORE VIEW LAYOUT (The Bento Grid Panels) */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Quick tab navigator for mobile views/easy access focus */}
          <div className="flex sm:hidden overflow-x-auto bg-white dark:bg-neutral-900 p-1 rounded-xl border border-gray-100 dark:border-neutral-800 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-400'
              }`}
            >
              Ringkasan Bisnis
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 ${
                activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-400'
              }`}
            >
              Hak Akses Tim
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 ${
                activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-400'
              }`}
            >
              Audit Logs
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* 3A. OVERVIEW TAB: Bento grid featuring BentoStats, SalesChart, TopProducts */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 4 Bento statistic cards */}
                <BentoStats stats={stats} onRefreshStat={handleRefreshStat} />

                {/* Main Bento Row: Sales performance chart + Best Sellers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* SalesChart: occupies 2/3 of space */}
                  <div className="lg:col-span-2">
                    <SalesChart />
                  </div>

                  {/* Best selling products: occupies 1/3 of space */}
                  <div className="lg:col-span-1">
                    <TopProducts />
                  </div>
                </div>

                {/* Sub Bento Row: Inline mini modules for User Access & Live Logs preview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {/* User administration module preview */}
                    <UserManagement
                      users={users}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                      onAddUser={handleAddUser}
                    />
                  </div>
                  
                  <div className="lg:col-span-1">
                    {/* Live logs stream preview */}
                    <ActivityLogs
                      logs={logs}
                      onAddLog={handleAddNewLog}
                      onClearLogs={handleClearLogs}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3B. USERS FOCUS VIEW */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <UserManagement
                  users={users}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUser={handleAddUser}
                />
              </motion.div>
            )}

            {/* 3C. SECURITY AUDIT LOGS FOCUS VIEW */}
            {activeTab === 'logs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ActivityLogs
                  logs={logs}
                  onAddLog={handleAddNewLog}
                  onClearLogs={handleClearLogs}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Footer Credits */}
        <footer className="py-6 px-6 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center text-xs text-gray-400 dark:text-neutral-500">
          <p>© 2026 Dashboard Admin Modern • Didesain dengan estetika Bento-Grid minimalis oleh AI Coding Agent.</p>
        </footer>
      </main>
    </div>
  );
}

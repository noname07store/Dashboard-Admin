import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Play,
  Pause,
  Trash,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Server,
  Lock,
  DollarSign,
  User,
  ExternalLink,
  Download,
} from 'lucide-react';
import { ActivityLog, LogCategory, LogStatus } from '../types';
import { systemLogActions, systemUsersMock } from '../data/mockData';

interface ActivityLogsProps {
  logs: ActivityLog[];
  onAddLog: (log: ActivityLog) => void;
  onClearLogs: () => void;
}

export default function ActivityLogs({ logs, onAddLog, onClearLogs }: ActivityLogsProps) {
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [search, setSearch] = useState('');
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Background Simulator: Adds a mock transaction or admin activity every 4-6 seconds
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick random action
      const actionTemplate = systemLogActions[Math.floor(Math.random() * systemLogActions.length)];
      // Pick random user
      const userTemplate = systemUsersMock[Math.floor(Math.random() * systemUsersMock.length)];

      const date = new Date();
      const timeStr = date.toTimeString().split(' ')[0];

      // Random details based on action
      let details = '';
      if (actionTemplate.category === 'transaction') {
        const randAmount = Math.floor(Math.random() * 2500000) + 150000;
        const formattedAmount = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(randAmount);
        details = `Nilai: ${formattedAmount} via Gopay/QRIS`;
      } else if (actionTemplate.category === 'security') {
        const ips = ['112.9.83.1', '210.38.10.98', '195.42.5.15', '36.88.2.14'];
        details = `Target IP: ${ips[Math.floor(Math.random() * ips.length)]}`;
      } else {
        details = 'Sesi web admin diperbarui';
      }

      const randomIp = `182.11.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      const newLog: ActivityLog = {
        id: `LOG-${Date.now()}`,
        timestamp: timeStr,
        user: {
          name: userTemplate.name,
          email: userTemplate.email,
          avatar: userTemplate.avatar,
        },
        action: actionTemplate.action,
        category: actionTemplate.category,
        status: actionTemplate.status,
        ip: randomIp,
        details: details,
      };

      onAddLog(newLog);
    }, 5000);

    return () => clearInterval(interval);
  }, [isSimulating, onAddLog]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesCategory = filterCategory === 'Semua' || log.category === filterCategory;
    const matchesStatus = filterStatus === 'Semua' || log.status === filterStatus;
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.name.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.includes(search);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Get severity color and icon
  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'info':
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  // Get category badge color and icon
  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case 'system':
        return <Server className="w-3.5 h-3.5 mr-1" />;
      case 'security':
        return <Lock className="w-3.5 h-3.5 mr-1" />;
      case 'transaction':
        return <DollarSign className="w-3.5 h-3.5 mr-1" />;
      case 'user':
        return <User className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const getCategoryLabel = (category: LogCategory) => {
    switch (category) {
      case 'system':
        return 'Sistem';
      case 'security':
        return 'Keamanan';
      case 'transaction':
        return 'Transaksi';
      case 'user':
        return 'Pengguna';
    }
  };

  const handleSimulateOne = () => {
    const actionTemplate = systemLogActions[Math.floor(Math.random() * systemLogActions.length)];
    const userTemplate = systemUsersMock[Math.floor(Math.random() * systemUsersMock.length)];
    const timeStr = new Date().toTimeString().split(' ')[0];

    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: timeStr,
      user: {
        name: userTemplate.name,
        email: userTemplate.email,
        avatar: userTemplate.avatar,
      },
      action: actionTemplate.action + ' (Manual Trigger)',
      category: actionTemplate.category,
      status: actionTemplate.status,
      ip: '127.0.0.1',
      details: 'Dipicu oleh tombol simulasi instan',
    };
    onAddLog(newLog);
  };

  return (
    <div id="logs-card" className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col h-full">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-50 dark:border-neutral-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-rose-500 animate-pulse" />
              Logs Aktivitas Real-Time
            </h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
            Aliran audit transaksi dan sistem keamanan web Anda secara instan.
          </p>
        </div>

        {/* Live Controller Options */}
        <div className="flex items-center space-x-2">
          {/* Simulation status button */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isSimulating
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700'
            }`}
            title={isSimulating ? 'Pause simulasi' : 'Resume simulasi'}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Simulasi Berjalan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Simulasi Jeda</span>
              </>
            )}
          </button>

          {/* Trigger single log manually */}
          <button
            onClick={handleSimulateOne}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-300 text-xs font-medium cursor-pointer"
            title="Tambah 1 Log Acak Instan"
          >
            + Log
          </button>

          {/* Clear button */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg border border-gray-200 hover:border-rose-200 hover:text-rose-600 dark:border-neutral-800 dark:hover:border-rose-950/40 dark:text-neutral-400 transition-all cursor-pointer"
            title="Bersihkan Semua Logs"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Searching & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 rounded-xl focus:outline-hidden text-gray-700 dark:text-neutral-300"
          />
        </div>

        {/* Filter Category */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 rounded-xl px-3 py-2 text-gray-700 dark:text-neutral-300 cursor-pointer focus:outline-hidden"
        >
          <option value="Semua">Kategori: Semua</option>
          <option value="system">Sistem</option>
          <option value="security">Keamanan</option>
          <option value="transaction">Transaksi</option>
          <option value="user">Pengguna</option>
        </select>

        {/* Filter Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80 rounded-xl px-3 py-2 text-gray-700 dark:text-neutral-300 cursor-pointer focus:outline-hidden"
        >
          <option value="Semua">Status: Semua</option>
          <option value="success">Success (Sukses)</option>
          <option value="warning">Warning (Peringatan)</option>
          <option value="error">Error (Kritis)</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Logs Event Streams Container */}
      <div
        ref={containerRef}
        className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {filteredLogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center text-xs text-gray-400 dark:text-neutral-500"
            >
              Tidak ada log aktivitas terdeteksi.
            </motion.div>
          ) : (
            filteredLogs.map((log) => {
              return (
                <motion.div
                  key={log.id}
                  layoutId={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  className={`p-3 rounded-xl border border-gray-100/50 dark:border-neutral-800/30 bg-neutral-50/40 dark:bg-neutral-950/10 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-neutral-800/20 cursor-pointer transition-all flex flex-col`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      {/* Status indicator icon */}
                      <div className="mt-0.5">{getStatusIcon(log.status)}</div>

                      <div>
                        {/* Event action description */}
                        <p className="text-xs font-semibold text-gray-900 dark:text-neutral-100">
                          {log.action}
                        </p>

                        <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                          {/* Actor image or system title */}
                          <span className="text-[10px] text-gray-400 dark:text-neutral-500 flex items-center">
                            {log.user.avatar ? (
                              <img
                                src={log.user.avatar}
                                alt={log.user.name}
                                className="w-3.5 h-3.5 rounded-full object-cover mr-1 shrink-0"
                              />
                            ) : null}
                            {log.user.name}
                          </span>

                          <span className="text-[10px] text-gray-300 dark:text-neutral-600">•</span>

                          {/* IP Address */}
                          <span className="text-[9px] font-mono text-gray-400 bg-gray-100 dark:bg-neutral-800 dark:text-neutral-400 px-1 rounded-sm">
                            {log.ip}
                          </span>

                          <span className="text-[10px] text-gray-300 dark:text-neutral-600">•</span>

                          {/* Category Badge */}
                          <span className="text-[9px] font-medium text-indigo-600/90 dark:text-indigo-400 flex items-center">
                            {getCategoryIcon(log.category)}
                            {getCategoryLabel(log.category)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clock Timestamp */}
                    <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500">
                      {log.timestamp}
                    </span>
                  </div>

                  {/* Expanded detail description */}
                  {selectedLog?.id === log.id && log.details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800 text-[10px] text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-950 p-2 rounded-lg"
                    >
                      <strong className="block text-[9px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 mb-0.5">
                        Detail Aktivitas:
                      </strong>
                      {log.details}
                      <span className="block text-[9px] text-gray-400 dark:text-neutral-500 mt-1">
                        Sistem otentikasi log ID: {log.id} • IP: {log.ip}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Bottom informational bar */}
      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-50 dark:border-neutral-800/50">
        <span>Kecepatan stream: <strong>5s / log</strong></span>
        <span>Filter: <strong>{filteredLogs.length} logs</strong></span>
      </div>
    </div>
  );
}

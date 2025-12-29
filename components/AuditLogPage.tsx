import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../types';
import { 
    AlertTriangleIcon, 
    BlacklistIcon, 
    WifiIcon, 
    UsersIcon, 
    CalendarPlusIcon, 
    ArrowUpIcon, 
    ArrowDownIcon,
    SearchIcon,
    ShieldIcon // Pastikan icon ini ada atau ganti dengan icon lain
} from './icons';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import Pagination from './Pagination';

interface AuditLogPageProps {
  auditLog: AuditLogEntry[];
}

const ITEMS_PER_PAGE = 10; // Dikurangi sedikit agar tabel tidak terlalu panjang
type SortKey = 'timestamp' | 'action' | 'details';
type SortDirection = 'asc' | 'desc';

// --- CONFIGURATION & STYLING ---

// Helper untuk mendapatkan konfigurasi tampilan berdasarkan tipe aksi
const getActionConfig = (action: string) => {
  const configs: { [key: string]: { icon: React.ReactNode; color: string; label: string } } = {
    'PERINGATAN KEAMANAN': { 
        icon: <AlertTriangleIcon className="w-4 h-4" />, 
        color: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
        label: 'Security Alert'
    },
    'MANAJEMEN DAFTAR HITAM': { 
        icon: <BlacklistIcon className="w-4 h-4" />, 
        color: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
        label: 'Blacklist'
    },
    'SINKRONISASI OFFLINE': { 
        icon: <WifiIcon className="w-4 h-4" />, 
        color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
        label: 'System Sync'
    },
    'KEBIJAKAN RETENSI': { 
        icon: <AlertTriangleIcon className="w-4 h-4" />, 
        color: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
        label: 'Retention'
    },
    'AUTO CHECKOUT': { 
        icon: <ArrowDownIcon className="w-4 h-4" />, 
        color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
        label: 'Auto System'
    },
    'MANAJEMEN PENGGUNA': { 
        icon: <UsersIcon className="w-4 h-4" />, 
        color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
        label: 'User Mgmt'
    },
    'MANAJEMEN ACARA': { 
        icon: <CalendarPlusIcon className="w-4 h-4" />, 
        color: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
        label: 'Event Mgmt'
    },
  };

  return configs[action] || { 
    icon: <ShieldIcon className="w-4 h-4" />, 
    color: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-300',
    label: action 
  };
};

// --- SUB-COMPONENTS ---

const AuditLogRow = React.memo<{ log: AuditLogEntry }>(({ log }) => {
    const config = getActionConfig(log.action);
    
    // Format tanggal menjadi lebih rapi (2 baris: Tanggal & Jam)
    const dateObj = new Date(log.timestamp);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <tr className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dateStr}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{timeStr}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm ${config.color}`}>
                    {config.icon}
                    <span>{log.action}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {log.details}
                </p>
            </td>
        </tr>
    );
});

// --- MAIN COMPONENT ---

const AuditLogPage: React.FC<AuditLogPageProps> = ({ auditLog }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'timestamp', direction: 'desc'});
  
  // 1. Filter Logic
  const filteredLog = useMemo(() => {
    if (!searchQuery) return auditLog;
    const lowerQuery = searchQuery.toLowerCase();
    return auditLog.filter(log => 
        log.action.toLowerCase().includes(lowerQuery) || 
        log.details.toLowerCase().includes(lowerQuery)
    );
  }, [auditLog, searchQuery]);

  // 2. Sort Logic
  const sortedLog = useMemo(() => {
    let sortableItems = [...filteredLog];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];
        if (sortConfig.key === 'timestamp') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredLog, sortConfig]);

  // 3. Pagination Logic
  const paginatedLog = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedLog.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedLog, currentPage]);

  const tableBodyRef = useStaggerAnimation('tr', [paginatedLog]);
  
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey; label: string }> = ({ sortKey, label }) => {
    const isSorted = sortConfig?.key === sortKey;
    const Icon = sortConfig?.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
    return (
        <th 
            scope="col" 
            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors select-none group" 
            onClick={() => requestSort(sortKey)}
        >
            <div className="flex items-center gap-1.5">
                {label}
                <span className={`transition-opacity duration-200 ${isSorted ? 'opacity-100 text-emerald-500' : 'opacity-0 group-hover:opacity-50'}`}>
                    <Icon className="w-3.5 h-3.5"/>
                </span>
            </div>
        </th>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <ShieldIcon className="w-7 h-7 text-emerald-600" />
                Log Audit Sistem
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Rekaman jejak aktivitas keamanan dan sistem yang tidak dapat diubah.
            </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <SearchIcon className="w-4 h-4" />
            </div>
            <input 
                type="text" 
                placeholder="Cari aktivitas..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm"
            />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-grow">
            <table className="min-w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                <SortableHeader sortKey="timestamp" label="Waktu" />
                <SortableHeader sortKey="action" label="Jenis Aktivitas" />
                <SortableHeader sortKey="details" label="Detail Keterangan" />
                </tr>
            </thead>
            <tbody ref={tableBodyRef as React.RefObject<HTMLTableSectionElement>} className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedLog.map((log) => (
                <AuditLogRow key={log.id} log={log} />
                ))}
            </tbody>
            </table>
        </div>

        {/* Empty State */}
        {filteredLog.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada data ditemukan</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
                    {searchQuery ? `Tidak ada hasil pencarian untuk "${searchQuery}"` : "Belum ada aktivitas yang tercatat dalam sistem."}
                </p>
            </div>
        )}

        {/* Footer / Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">
                Menampilkan {filteredLog.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLog.length)} dari {filteredLog.length} entri
            </span>
            
            {filteredLog.length > ITEMS_PER_PAGE && (
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredLog.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
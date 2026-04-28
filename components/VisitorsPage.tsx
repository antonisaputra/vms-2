import React, { useState, useMemo, useEffect } from 'react';
import { Visit, VisitStatus, Page } from '../types';
import { SearchIcon, DownloadIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import TableSkeleton from './TableSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from './Pagination';
import { useData } from '../context/DataContext';

interface VisitorsPageProps {
  onManualCheckin: () => void;
  onOpenVisitDetail: (visit: Visit) => void;
  onNavigate: (page: Page) => void;
}

const ITEMS_PER_PAGE = 10;

type SortKey = 'visitor.fullName' | 'host.name' | 'checkInTime' | 'status';
type SortDirection = 'asc' | 'desc';

const statusClassMap: { [key in VisitStatus]: string } = {
  [VisitStatus.OnSite]: 'status-onsite',
  [VisitStatus.Expected]: 'status-expected',
  [VisitStatus.CheckedOut]: 'status-checkedout',
};

const VisitCard: React.FC<{ visit: Visit; onOpenVisitDetail: (visit: Visit) => void; onCheckoutClick: (e: React.MouseEvent, visit: Visit) => void;}> = ({ visit, onOpenVisitDetail, onCheckoutClick }) => (
    <div onClick={() => onOpenVisitDetail(visit)} className="bg-card p-4 rounded-lg shadow-custom mb-4 cursor-pointer hover:shadow-lg transition-shadow border border-border">
        <div className="flex items-start justify-between">
            <div className="flex items-center">
                <img className="h-12 w-12 rounded-full object-cover bg-secondary" src={visit.visitor.photoUrl} alt="" />
                <div className="ml-4">
                    <p className="text-md font-bold text-card-foreground">{visit.visitor.fullName}</p>
                    <p className="text-sm text-muted-foreground">{visit.visitor.company}</p>
                </div>
            </div>
            <span className={`status-badge ${statusClassMap[visit.status]}`}>
                {visit.status}
            </span>
        </div>
        <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Tujuan: <span className="font-medium text-card-foreground">{visit.host ? visit.host.name : visit.destination}</span></p>
            <p className="text-sm text-muted-foreground">Maksud: <span className="font-medium text-card-foreground">{visit.purpose}</span></p>
            <p className="text-sm text-muted-foreground">Check-in: <span className="font-medium text-card-foreground">{new Date(visit.checkInTime).toLocaleString('id-ID')}</span></p>
        </div>
        {visit.status === VisitStatus.OnSite && (
            <div className="mt-3 text-right">
                <button onClick={(e) => onCheckoutClick(e, visit)} className="text-sm font-semibold text-destructive hover:brightness-125">
                    Check-out
                </button>
            </div>
        )}
    </div>
);


const VisitorsPage: React.FC<VisitorsPageProps> = ({ onManualCheckin, onOpenVisitDetail, onNavigate }) => {
  const { visits, isLoadingVisits, checkoutVisitor, runAutoCheckout } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisitStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'checkInTime', direction: 'desc'});
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [isFiltering, setIsFiltering] = useState(false);
  const [displayedVisits, setDisplayedVisits] = useState<Visit[]>([]);

  // PERBAIKAN: Menambahkan pengecekan ( || '') agar tidak error toLowerCase
  const sortedAndFilteredVisits = useMemo(() => {
    let filtered = visits.filter(visit => {
      const search = (debouncedSearchTerm || '').toLowerCase();
      
      const matchesSearch = 
        (visit.visitor.fullName || '').toLowerCase().includes(search) ||
        (visit.host?.name || '').toLowerCase().includes(search) ||
        (visit.destination || '').toLowerCase().includes(search) ||
        (visit.visitor.company || '').toLowerCase().includes(search);
      
      const matchesFilter = statusFilter === 'All' || visit.status === statusFilter;

      return matchesSearch && matchesFilter;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'visitor.fullName') {
            aValue = (a.visitor.fullName || '');
            bValue = (b.visitor.fullName || '');
        } else if (sortConfig.key === 'host.name') {
            aValue = a.host?.name || a.destination || '';
            bValue = b.host?.name || b.destination || '';
        } else if (sortConfig.key === 'checkInTime') {
            aValue = new Date(a.checkInTime).getTime();
            bValue = new Date(b.checkInTime).getTime();
        } else { // status
            aValue = a.status;
            bValue = b.status;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [visits, debouncedSearchTerm, statusFilter, sortConfig]);
  
  const paginatedVisits = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return sortedAndFilteredVisits.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredVisits, currentPage]);
  
  useEffect(() => {
    if (!isLoadingVisits) {
        setIsFiltering(true);
        const timer = setTimeout(() => {
            setDisplayedVisits(paginatedVisits);
            setIsFiltering(false);
        }, 100); 

        return () => clearTimeout(timer);
    }
  }, [paginatedVisits, isLoadingVisits]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const tableBodyRef = useStaggerAnimation('tr', [displayedVisits]);
  const cardListRef = useStaggerAnimation('.visit-card', [displayedVisits]);

  const handleCheckoutClick = (e: React.MouseEvent, visit: Visit) => {
    e.stopPropagation(); 
    if (window.confirm(`Anda yakin ingin melakukan check-out untuk ${visit.visitor.fullName}?`)) {
        checkoutVisitor(visit.id);
    }
  };

  const handleExport = () => {
    const headers = ["Nama Tamu", "Perusahaan", "Host/Tujuan", "Tujuan", "Waktu Check-in", "Waktu Check-out", "Status", "Acara"];
    const rows = sortedAndFilteredVisits.map(v => [
        `"${v.visitor.fullName}"`, `"${v.visitor.company}"`, `"${v.host ? v.host.name : v.destination}"`, `"${v.purpose}"`,
        `"${new Date(v.checkInTime).toLocaleString('id-ID')}"`, `"${v.checkOutTime ? new Date(v.checkOutTime).toLocaleString('id-ID') : ''}"`,
        `"${v.status}"`, `"${v.eventInfo ? v.eventInfo.eventName : ''}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_tamu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode }> = ({ sortKey, children }) => {
    const isSorted = sortConfig?.key === sortKey;
    const Icon = sortConfig?.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer bg-secondary hover:bg-muted transition-colors" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
                {children}
                {isSorted && <Icon className="w-4 h-4 ml-2"/>}
            </div>
        </th>
    );
  };

  const showSkeleton = isLoadingVisits || isFiltering;

  return (
    <div className="bg-card p-4 sm:p-8 rounded-lg shadow-custom border border-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-card-foreground">Log Kunjungan Tamu</h1>
            <p className="text-muted-foreground">Kelola dan pantau semua aktivitas tamu.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button onClick={runAutoCheckout} className="btn btn-secondary w-full sm:w-auto rounded-xl">
                Auto Check-out
            </button>
            <button onClick={() => onNavigate(Page.Preregister)} className="btn btn-primary w-full sm:w-auto text-center rounded-xl">
                Pra-Registrasi
            </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative group flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            </div>
            <input
                type="text"
                placeholder="Cari nama, host, perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-xl leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 sm:text-sm shadow-sm"
            />
        </div>
        <div className="flex space-x-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
                 <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as VisitStatus | 'All')}
                  className="w-full md:w-48 rounded-xl border-border focus:ring-primary/30 focus:border-primary py-2.5 bg-background text-foreground border px-3 appearance-none"
                >
                  <option value="All">Semua Status</option>
                  <option value={VisitStatus.OnSite}>On-Site</option>
                  <option value={VisitStatus.Expected}>Diharapkan</option>
                  <option value={VisitStatus.CheckedOut}>Sudah Check-out</option>
                </select>
            </div>

            <button onClick={handleExport} className="btn btn-secondary inline-flex items-center justify-center rounded-xl py-2.5 px-4 flex-shrink-0">
                <DownloadIcon className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Ekspor</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto hidden md:block border border-border rounded-xl">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <SortableHeader sortKey="visitor.fullName">Tamu</SortableHeader>
              <SortableHeader sortKey="host.name">Host/Tujuan</SortableHeader>
              <SortableHeader sortKey="checkInTime">Waktu Check-in</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-secondary">Aksi</th>
            </tr>
          </thead>
          {showSkeleton ? (
            <TableSkeleton />
          ) : (
          <tbody ref={tableBodyRef as React.RefObject<HTMLTableSectionElement>} className="divide-y divide-border bg-card">
            {displayedVisits.map((visit) => (
                <tr key={visit.id} onClick={() => onOpenVisitDetail(visit)} className="hover:bg-secondary/50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover bg-secondary" src={visit.visitor.photoUrl} alt="" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-card-foreground">{visit.visitor.fullName}</div>
                            <div className="text-sm text-muted-foreground">{visit.visitor.company}</div>
                        </div>
                        </div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {visit.eventInfo ? (
                           <span className="font-semibold text-purple-600 dark:text-purple-400">{visit.eventInfo.eventName}</span>
                        ) : (
                           visit.host ? visit.host.name : <span className="italic">{visit.destination}</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(visit.checkInTime).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${statusClassMap[visit.status]}`}>
                          {visit.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {visit.status === VisitStatus.OnSite && (
                        <button onClick={(e) => handleCheckoutClick(e, visit)} className="text-destructive hover:brightness-125">
                            Check-out
                        </button>
                        )}
                    </td>
                </tr>
            ))}
          </tbody>
          )}
        </table>
      </div>
      
      <div ref={cardListRef} className="md:hidden mt-4">
          {showSkeleton ? (
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-card p-4 rounded-lg shadow-custom mb-4 animate-pulse border border-border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-secondary"></div>
                            <div className="ml-4 space-y-2">
                                <div className="h-4 w-32 bg-secondary rounded"></div>
                                <div className="h-3 w-24 bg-secondary rounded"></div>
                            </div>
                        </div>
                         <div className="h-6 w-20 bg-secondary rounded-full"></div>
                    </div>
                </div>
             ))
          ) : (
            displayedVisits.map(visit => (
                <div className="visit-card" key={visit.id}>
                    <VisitCard 
                        visit={visit} 
                        onOpenVisitDetail={onOpenVisitDetail}
                        onCheckoutClick={handleCheckoutClick}
                    />
                </div>
            ))
          )}
      </div>

      {!showSkeleton && sortedAndFilteredVisits.length === 0 && (
        <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data tamu yang cocok.</p>
        </div>
      )}
      
      {sortedAndFilteredVisits.length > ITEMS_PER_PAGE && (
        <Pagination 
            currentPage={currentPage}
            totalItems={sortedAndFilteredVisits.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default VisitorsPage;
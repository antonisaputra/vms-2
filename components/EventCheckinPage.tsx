import React, { useState, useMemo, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader'; // <--- IMPORT LIBRARY
import { Event, Visit, VisitStatus } from '../types';
import { 
    SearchIcon, 
    UserCheckIcon, 
    ArrowRightIcon, 
    QrCodeIcon, 
    UsersIcon, 
    CheckCircleIcon,
    ClockIcon,
    MailIcon,
    FilterIcon
} from './icons';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import { gsap } from 'gsap';
import { useData } from '../context/DataContext';

// Inline Icon untuk tombol Close (X)
const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Inline Icon untuk Switch Camera
const SwitchCameraIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

interface EventCheckinPageProps {
  event: Event;
  visits: Visit[]; 
  onCheckIn: (visitId: string) => Promise<any>;
  onBack: () => void;
}

// --- KOMPONEN KARTU PESERTA (SAMA SEPERTI SEBELUMNYA) ---
const ParticipantCard = React.memo<{ 
    p: Visit; 
    onCheckIn: (id: string) => Promise<any>; 
    setFeedback: (feedback: any) => void; 
}>(({ p, onCheckIn, setFeedback }) => {
    
    const isCheckedIn = p.status === VisitStatus.OnSite;
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckInClick = async () => {
        setIsLoading(true);
        try {
            const res = await onCheckIn(p.id);
            if (!res || res.success === false) {
                setFeedback({ type: 'error', message: res?.message || 'Gagal check-in' });
            } else {
                setFeedback({ type: 'success', message: `${p.visitor.fullName} berhasil check-in.` });
            }
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.message || 'Terjadi kesalahan sistem' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`participant-card relative overflow-hidden transition-all duration-500 ease-out border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 group 
            ${isCheckedIn 
                ? 'bg-emerald-50/80 border-emerald-500 shadow-md shadow-emerald-100 scale-[1.01]' 
                : 'bg-white border-gray-100 hover:border-emerald-300 hover:shadow-md'
            }`}>
            {isCheckedIn && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors duration-300
                ${isCheckedIn 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                }`}>
                {isCheckedIn ? <CheckCircleIcon className="w-6 h-6"/> : p.visitor.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow text-center sm:text-left min-w-0">
                <h4 className={`font-bold truncate transition-colors ${isCheckedIn ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {p.visitor.fullName}
                </h4>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs mt-1">
                    <span className={`flex items-center gap-1 truncate ${isCheckedIn ? 'text-emerald-700' : 'text-gray-500'}`}>
                        <MailIcon className="w-3 h-3" />
                        {p.visitor.email}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-mono">
                        {p.checkinCode}
                    </span>
                </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
                {isCheckedIn ? (
                    <div className="flex flex-col items-end justify-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white text-emerald-600 border border-emerald-200 shadow-sm">
                            <UserCheckIcon className="w-4 h-4"/>
                            TERVERIFIKASI
                        </span>
                        {p.checkInTime && (
                            <span className="text-[10px] text-emerald-700 mt-1.5 font-bold flex items-center gap-1 bg-emerald-100/50 px-2 py-1 rounded-md">
                                <ClockIcon className="w-3 h-3" />
                                Masuk: {new Date(p.checkInTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={handleCheckInClick}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-gray-200 hover:shadow-emerald-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                             <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span>Check In</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
});


// --- STAT CARD ---
const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; colorClass: string }> = ({ label, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);


// --- HALAMAN UTAMA ---
const EventCheckinPage: React.FC<EventCheckinPageProps> = ({ event, visits, onCheckIn, onBack }) => {
  const [checkinCode, setCheckinCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // STATE BARU: Untuk Scanner
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const processingRef = useRef(false); // Kunci agar scanner tidak double-trigger
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked-in' | 'pending'>('all');
  
  const headerRef = useRef<HTMLDivElement>(null);
  const { refreshData } = useData();

  // Animasi Header
  useEffect(() => {
      if (headerRef.current) {
          gsap.fromTo(headerRef.current.children, 
              { opacity: 0, y: -20 }, 
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
          );
      }
  }, []);

  // Polling Refresh Data Otomatis
  useEffect(() => {
      if (!refreshData) return;
      
      const interval = setInterval(() => {
          refreshData();
      }, 10000); // Sinkronisasi setiap 10 detik
      
      return () => clearInterval(interval);
  }, [refreshData]);

  const eventParticipants = useMemo(() => {
    return visits
      .filter(v => (v.eventId === event.id || v.eventInfo?.eventId === event.id))
      .sort((a, b) => a.visitor.fullName.localeCompare(b.visitor.fullName));
  }, [visits, event.id]);

  const checkedInCount = useMemo(() => eventParticipants.filter(p => p.status === VisitStatus.OnSite).length, [eventParticipants]);
  const totalCount = eventParticipants.length;
  const attendanceRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  const filteredParticipants = useMemo(() => {
    return eventParticipants.filter(p => {
      const matchesSearch = p.visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.checkinCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (filterStatus === 'checked-in') {
          matchesStatus = p.status === VisitStatus.OnSite;
      } else if (filterStatus === 'pending') {
          matchesStatus = p.status !== VisitStatus.OnSite;
      }
      
      return matchesSearch && matchesStatus;
    });
  }, [eventParticipants, searchTerm, filterStatus]);
  
  const listContainerRef = useStaggerAnimation('.participant-card', [filteredParticipants]);
  
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // --- REFACTOR LOGIC CHECK-IN ---
  // Logic ini dipisahkan agar bisa dipanggil oleh Form Submit maupun QR Scanner
  const processCheckInByCode = async (code: string) => {
    if (!code || processingRef.current) return; // Cegah eksekusi ganda
    
    processingRef.current = true;
    setIsValidating(true);

    // Bersihkan spasi kosong di awal/akhir
    const cleanCode = code.trim().toUpperCase();

    const participant = eventParticipants.find(p => p.checkinCode?.trim().toUpperCase() === cleanCode);

    if (participant) {
        if(participant.status === VisitStatus.OnSite) {
            setFeedback({ type: 'error', message: `${participant.visitor.fullName} sudah check-in sebelumnya.` });
        } else {
            // Tutup scanner jika berhasil ditemukan (opsional, bisa dibiarkan terbuka untuk scan massal)
            setIsScannerOpen(false); 
            
            try {
                const result = await onCheckIn(participant.id);
                if (!result || result.success === false) {
                    setFeedback({ type: 'error', message: result?.message || `Gagal melakukan check-in.` });
                } else {
                    setFeedback({ type: 'success', message: `Selamat datang, ${participant.visitor.fullName}!` });
                }
            } catch (error: any) {
                setFeedback({ type: 'error', message: error?.message || 'Terjadi kesalahan sistem' });
            }
        }
    } else {
      setFeedback({ type: 'error', message: `Kode "${cleanCode}" tidak ditemukan.` });
    }
    // Reset input manual
    setCheckinCode('');
    setIsValidating(false);
    
    // Jeda 1.5 detik sebelum bisa scan kode lain (anti spam/double request)
    setTimeout(() => {
        processingRef.current = false;
    }, 1500);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processCheckInByCode(checkinCode);
  };

  const handleScanResult = (result: any, error: any) => {
    if (!!result) {
        // Debounce atau pastikan kode valid sebelum memproses
        processCheckInByCode(result?.text);
    }
    if (!!error) {
        console.info(error);
    }
  };

  const eventDate = event.date instanceof Date ? event.date : new Date(event.date);

  return (
    <div className="min-h-[85vh] flex flex-col space-y-6">
      
      {/* HEADER (Sama seperti sebelumnya) */}
      <div ref={headerRef} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* ... (Isi header tetap sama) ... */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
            <button onClick={onBack} className="group flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center mr-3 transition-colors">
                    <ArrowRightIcon className="w-4 h-4 transform rotate-180 text-gray-500 group-hover:text-emerald-600" />
                </div>
                Kembali ke Daftar Acara
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <ClockIcon className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium">{eventDate.toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                        </span>
                    </div>
                </div>
                {/* Stats Header */}
                <div className="w-full md:w-72 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-gray-500 font-medium">Kehadiran Live</span>
                        <div className="text-right">
                             <span className="text-2xl font-bold text-emerald-600">{attendanceRate}%</span>
                             <span className="text-xs text-gray-400 block">Rate</span>
                        </div>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${attendanceRate}%` }}
                        ></div>
                    </div>
                    <p className="text-xs mt-2 text-gray-500 flex justify-between">
                        <span>Check-in: <strong>{checkedInCount}</strong></span>
                        <span>Total: <strong>{totalCount}</strong></span>
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
        
        {/* SIDEBAR KIRI (Input & Stats) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-100/50">
                <div className="mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 text-emerald-600">
                         <QrCodeIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Scanner Tamu</h2>
                    <p className="text-sm text-gray-500">Gunakan kamera atau input kode tiket.</p>
                </div>

                {/* --- TOMBOL BUKA SCANNER --- */}
                <button 
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full mb-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {/* Ganti dengan <CameraIcon /> jika ada */}
                    <QrCodeIcon className="w-5 h-5 text-white" /> 
                    <span>Scan QR Code</span>
                </button>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">ATAU MANUAL</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <form onSubmit={handleCodeSubmit} className="mt-2">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="KODE TIKET..."
                            value={checkinCode}
                            onChange={e => setCheckinCode(e.target.value.toUpperCase())}
                            className="w-full text-center py-4 text-xl font-mono font-bold tracking-[0.2em] uppercase rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 focus:bg-white text-gray-900 focus:border-emerald-500 focus:ring-0 transition-all outline-none placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!checkinCode || isValidating}
                        className="w-full mt-4 py-3.5 bg-gray-900 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isValidating ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>Memvalidasi...</span>
                            </>
                        ) : (
                            <>
                                <span>Validasi Kode</span>
                                <ArrowRightIcon className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {feedback && (
                    <div className={`mt-4 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in duration-300 ${
                        feedback.type === 'success' 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                        <div className={`mt-0.5 p-1 rounded-full ${feedback.type === 'success' ? 'bg-white/20' : 'bg-red-100'}`}>
                            {feedback.type === 'success' ? <CheckCircleIcon className="w-4 h-4 text-white"/> : <div className="w-4 h-4 font-bold text-center leading-4">!</div>}
                        </div>
                        <div className="text-sm font-medium leading-tight">{feedback.message}</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    label="Hadir" 
                    value={checkedInCount} 
                    icon={<UserCheckIcon className="w-6 h-6 text-emerald-600" />}
                    colorClass="bg-emerald-100"
                />
                <StatCard 
                    label="Belum" 
                    value={totalCount - checkedInCount} 
                    icon={<UsersIcon className="w-6 h-6 text-gray-400" />}
                    colorClass="bg-gray-100"
                />
            </div>
        </div>

        {/* KONTEN UTAMA (Daftar Peserta) */}
        <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-h-[600px]">
                {/* Search Header (Sama) */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-20 rounded-t-3xl">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Daftar Tamu
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">{filteredParticipants.length}</span>
                        </h2>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live Update Aktif
                        </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative group w-full sm:w-44">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FilterIcon className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value as any)}
                                className="block w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="checked-in">Sudah Hadir</option>
                                <option value="pending">Belum Hadir</option>
                            </select>
                        </div>
                        <div className="relative group w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau kode tiket..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div ref={listContainerRef} className="p-6 space-y-3 bg-gray-50/50 flex-grow">
                    {filteredParticipants.length > 0 ? (
                        filteredParticipants.map(p => (
                           <ParticipantCard 
                                key={p.id} 
                                p={p} 
                                onCheckIn={onCheckIn} 
                                setFeedback={setFeedback} 
                           />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <SearchIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <p>Tidak ada peserta yang ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- MODAL OVERLAY UNTUK SCANNER --- */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <QrCodeIcon className="w-5 h-5"/> Scan QR Code
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')} className="p-1 hover:bg-gray-700 rounded-full transition-colors" title="Ubah Kamera">
                            <SwitchCameraIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsScannerOpen(false)} className="p-1 hover:bg-gray-700 rounded-full transition-colors" title="Tutup">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                <div className="relative aspect-square bg-black">
                     <QrReader
                        onResult={handleScanResult}
                        constraints={{ facingMode: facingMode }}
                        className={`w-full h-full ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
                        containerStyle={{ width: '100%', height: '100%' }}
                    />
                    {/* Overlay Scan Frame */}
                    <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-emerald-500 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1"></div>
                        </div>
                    </div>
                </div>

                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                    Arahkan kamera ke QR Code pada tiket tamu.
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default EventCheckinPage;
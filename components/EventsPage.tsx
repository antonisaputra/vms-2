import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { useData } from '../context/DataContext';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import Modal from './Modal';
import { Event } from '../types';
import { 
    CalendarPlusIcon, 
    CopyIcon, 
    SearchIcon, 
    CalendarIcon, 
    UsersIcon, 
    ArrowRightIcon,
    CheckCircleIcon 
} from './icons'; 

interface EventsPageProps {
  onOpenRegistration: (event: Event) => void;
  onManageCheckin: (event: Event) => void;
  onShowToast: (message: string) => void;
}

// --- UTILITIES ---

const formatDateSafe = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Tanggal Tidak Valid";
    return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const getMonthAndDay = (date: Date | string) => {
    const validDate = new Date(date);
    const isValid = !isNaN(validDate.getTime());
    return {
        month: isValid ? validDate.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '-',
        day: isValid ? validDate.getDate() : '?'
    };
};

// --- SUB-COMPONENTS ---

const DateBadge: React.FC<{ date: Date | string }> = React.memo(({ date }) => {
    const { month, day } = getMonthAndDay(date);
    
    return (
        <div className="flex flex-col items-center overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-16 h-16 shadow-sm shrink-0 group-hover:shadow-md group-hover:border-emerald-200 transition-all duration-300">
            <div className="w-full h-5 bg-emerald-500 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white tracking-widest">{month}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 leading-none">{day}</span>
            </div>
        </div>
    );
});

const EventCardSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm animate-pulse flex items-center gap-5">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl shrink-0"></div>
        <div className="flex-grow space-y-2.5">
            <div className="h-5 w-1/3 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-1/4 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="hidden sm:block h-10 w-32 bg-gray-200 rounded-xl"></div>
    </div>
);

const EventCardItem: React.FC<{ 
    event: Event; 
    registrantCount: number; 
    onManageCheckin: (e: Event) => void; 
    onShowToast: (msg: string) => void;
}> = React.memo(({ event, registrantCount, onManageCheckin, onShowToast }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = useCallback(() => {
        const link = `${window.location.origin}/register/${event.id}`;
        navigator.clipboard.writeText(link).then(() => {
            setIsCopied(true);
            onShowToast("Tautan registrasi berhasil disalin!");
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(() => {
            onShowToast("Gagal menyalin tautan.");
        });
    }, [event.id, onShowToast]);

    return (
        <div className="event-card group relative bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center relative z-10">
                {/* Bagian Kiri: Tanggal & Info */}
                <div className="flex items-center gap-5 flex-grow w-full">
                    <DateBadge date={event.date} />
                    
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {event.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                                {formatDateSafe(event.date)}
                            </span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-600 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                <UsersIcon className="w-3 h-3" />
                                {registrantCount} Pendaftar
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bagian Kanan: Aksi */}
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-gray-50">
                    <button 
                        onClick={handleCopyLink}
                        className={`
                            flex-1 sm:flex-none h-10 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border
                            ${isCopied 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
                            }
                        `}
                        title="Salin Link Registrasi"
                    >
                        {isCopied ? <CheckCircleIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        <span className="sm:hidden lg:inline">{isCopied ? 'Tersalin' : 'Link'}</span>
                    </button>

                    <button 
                        onClick={() => onManageCheckin(event)} 
                        className="flex-[2] sm:flex-none h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200/50 flex items-center justify-center gap-2"
                    >
                        Check-in <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
});

const CreateEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (eventData: Omit<Event, 'id' | 'registrationLink'>) => Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ name: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;
    
    setIsSubmitting(true);
    try {
        await onCreate({ name: formData.name, date: new Date(formData.date) });
        setFormData({ name: '', date: '' });
        onClose();
    } catch (error) {
        alert("Gagal menyimpan acara.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        <div className="p-8">
            <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                    <CalendarPlusIcon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Acara Baru</h2>
                <p className="text-gray-500 text-sm text-center">Isi detail di bawah untuk menjadwalkan acara.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Acara</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        placeholder="Contoh: Seminar Nasional Teknologi"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Pelaksanaan</label>
                    <input 
                        type="date" 
                        value={formData.date} 
                        onChange={e => setFormData({...formData, date: e.target.value})} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    />
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Acara'}
                    </button>
                </div>
            </form>
        </div>
    </Modal>
  );
};

// --- MAIN PAGE ---

const EventsPage: React.FC<EventsPageProps> = ({ onManageCheckin, onShowToast }) => {
  const { events, isLoadingEvents, visits, createEvent } = useData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef<HTMLDivElement>(null);

  // Animasi Header saat mount
  useEffect(() => {
      if (!headerRef.current) return;
      gsap.fromTo(headerRef.current.children, 
          { opacity: 0, y: -20 }, 
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
  }, []);

  // Filter Event & Hitung Pendaftar
  const getRegistrantCount = useCallback((eventId: string) => {
    if (!visits) return 0;
    return visits.filter(v => (v.eventId || v.eventInfo?.eventId) === eventId).length;
  }, [visits]);

  const filteredEvents = useMemo(() => {
      if (!events) return [];
      if (!searchQuery) return events;
      return events.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [events, searchQuery]);

  // Animasi List Card
  const eventsContainerRef = useStaggerAnimation('.event-card', [filteredEvents, isLoadingEvents]);

  return (
    <div className="space-y-8 min-h-[80vh] p-1">
        {/* --- HEADER SECTION --- */}
        <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                        Manajemen Acara
                    </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg leading-relaxed ml-5">
                    Buat jadwal baru, salin tautan pendaftaran, dan kelola check-in peserta dalam satu tempat.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative group w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                        <SearchIcon className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari nama acara..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm"
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setModalOpen(true)} 
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <CalendarPlusIcon className="w-5 h-5" /> 
                    <span>Buat Acara</span>
                </button>
            </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div ref={eventsContainerRef} className="grid grid-cols-1 gap-4">
            {isLoadingEvents ? (
                Array.from({length: 3}).map((_, i) => <EventCardSkeleton key={i} />)
            ) : filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                    <EventCardItem 
                        key={event.id}
                        event={event}
                        registrantCount={getRegistrantCount(event.id)}
                        onManageCheckin={onManageCheckin}
                        onShowToast={onShowToast}
                    />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                        <CalendarPlusIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tidak ada acara ditemukan</h3>
                    <p className="text-gray-500 text-sm mt-1 mb-6 text-center max-w-xs">
                        {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada acara yang dijadwalkan."}
                    </p>
                    {!searchQuery && (
                        <button onClick={() => setModalOpen(true)} className="text-emerald-600 font-medium hover:underline text-sm">
                            + Buat acara pertama Anda
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* --- MODALS --- */}
        <CreateEventModal 
            isOpen={isModalOpen} 
            onClose={() => setModalOpen(false)} 
            onCreate={createEvent} 
        />
    </div>
  );
};

export default EventsPage;
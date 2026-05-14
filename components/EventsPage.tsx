import React, { useState, useMemo, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { gsap } from 'gsap';
import { useData } from '../context/DataContext';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import Modal from './Modal';
import { Event, Visit } from '../types';
import * as api from '../services/api';
import {
    CalendarPlusIcon,
    CopyIcon,
    SearchIcon,
    CalendarIcon,
    UsersIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from './icons';

// --- SUB-KOMPONEN ATOMIK UNTUK REFRESH DATA SPESIFIK ---

interface EventsPageProps {
    onOpenRegistration: (event: Event) => void;
    onManageCheckin: (event: Event) => void;
    onShowToast: (message: string) => void;
}

const LiveVisitsContext = createContext<Visit[] | null>(null);

/**
 * RegistrantCounter mengambil data 'visits' langsung dari Context.
 * Karena komponen ini sangat kecil, re-render hanya terjadi pada angka ini saja.
 */
const RegistrantCounter: React.FC<{ eventId: string }> = ({ eventId }) => {
    const { visits } = useData();
    const liveVisits = useContext(LiveVisitsContext);

    // Menghitung jumlah pendaftar hanya jika 'visits' atau 'eventId' berubah
    const count = useMemo(() => {
        const sourceVisits = liveVisits || visits;
        if (!sourceVisits) return 0;
        return sourceVisits.filter(v => (v.eventId === eventId || v.eventInfo?.eventId === eventId)).length;
    }, [visits, liveVisits, eventId]);

    return (
        <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-600 text-xs font-medium text-emerald-700 dark:text-emerald-400 tabular-nums transition-all duration-300">
            <UsersIcon className="w-3 h-3" />
            <span className="animate-pulse-subtle">{count} Pendaftar</span>
        </span>
    );
};

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
        <div className="flex flex-col items-center overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-16 h-16 shadow-sm shrink-0">
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

// Menggunakan React.memo agar seluruh kartu tidak re-render kecuali props 'event' berubah
const EventCardItem: React.FC<{
    event: Event;
    onManageCheckin: (e: Event) => void;
    onShowToast: (msg: string) => void;
}> = React.memo(({ event, onManageCheckin, onShowToast }) => {
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
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center relative z-10">
                <div className="flex items-center gap-5 flex-grow w-full">
                    <DateBadge date={event.date} />
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                            {event.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                                {formatDateSafe(event.date)}
                            </span>
                            <span className="hidden sm:inline text-gray-300">•</span>
                            
                            {/* Komponen terpisah ini yang akan ter-refresh datanya */}
                            <RegistrantCounter eventId={event.id} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-none border-gray-50">
                    <button
                        onClick={handleCopyLink}
                        className={`flex-1 sm:flex-none h-10 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border ${isCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >
                        {isCopied ? <CheckCircleIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        <span className="sm:hidden lg:inline">{isCopied ? 'Tersalin' : 'Link'}</span>
                    </button>

                    <button
                        onClick={() => onManageCheckin(event)}
                        className="flex-[2] sm:flex-none h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200 hover:shadow-lg flex items-center justify-center gap-2"
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
    onCreate: (eventData: any) => Promise<void>;
    onRefresh: () => void;
}> = ({ isOpen, onClose, onCreate, onRefresh }) => {
    const [formData, setFormData] = useState({ name: '', date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.date) return;

        setIsSubmitting(true);
        try {
            await onCreate({ name: formData.name, date: formData.date });
            setFormData({ name: '', date: '' });
            onRefresh(); 
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
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Acara</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 outline-none"
                            placeholder="Contoh: Seminar Teknologi"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Pelaksanaan</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 outline-none"
                        />
                    </div>

                    <div className="pt-4 grid grid-cols-2 gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border text-gray-600 font-medium" disabled={isSubmitting}>Batal</button>
                        <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700" disabled={isSubmitting}>
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
    const { events, isLoadingEvents, refreshData, createEvent } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [liveVisits, setLiveVisits] = useState<Visit[] | null>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // Polling Data pendaftaran setiap 10 detik agar terasa realtime bagi admin[cite: 2]
    useEffect(() => {
        if (!refreshData) return;
        refreshData(); 
        
        const fetchVisitsOnly = async () => {
            try {
                const visitsData = await api.getVisitsApi();
                setLiveVisits(visitsData);
            } catch (error) {
                console.error("Gagal mengambil data pendaftar:", error);
            }
        };

        const interval = setInterval(fetchVisitsOnly, 10000); 
        return () => clearInterval(interval);
    }, [refreshData]);

    useEffect(() => {
        if (!headerRef.current) return;
        gsap.fromTo(headerRef.current.children,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
        );
    }, []);

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        const query = searchQuery.toLowerCase();
        return events.filter(e => e.name.toLowerCase().includes(query));
    }, [events, searchQuery]);

    const eventsContainerRef = useStaggerAnimation('.event-card', [filteredEvents.length, isLoadingEvents, searchQuery]);

    return (
        <div className="space-y-8 min-h-[80vh] p-1">
            <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Manajemen Acara</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg ml-5">Data pendaftar diperbarui secara otomatis setiap 10 detik.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama acara..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                        <CalendarPlusIcon className="w-5 h-5" />
                        <span>Buat Acara</span>
                    </button>
                </div>
            </div>

            <div ref={eventsContainerRef} className="grid grid-cols-1 gap-4">
                <LiveVisitsContext.Provider value={liveVisits}>
                {isLoadingEvents ? (
                    Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <EventCardItem
                            key={event.id}
                            event={event}
                            onManageCheckin={onManageCheckin}
                            onShowToast={onShowToast}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Belum ada acara</h3>
                    </div>
                )}
                </LiveVisitsContext.Provider>
            </div>

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={createEvent}
                onRefresh={() => refreshData && refreshData()}
            />
        </div>
    );
};

export default EventsPage;
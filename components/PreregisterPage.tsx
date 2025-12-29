import React, { useState, useEffect } from 'react';
import { Visit, VisitStatus, Host } from '../types';
import SuccessLottie from './SuccessLottie';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import * as api from '../services/api'; // <--- IMPORT API SERVICE
import { 
    UserCheckIcon, 
    IdCardIcon, 
    MailIcon, 
    CalendarIcon, 
    CalendarPlusIcon,
    ArrowRightIcon
} from './icons';

// --- INLINE ICONS ---
const PhoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const BuildingIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="12" y1="22" x2="12" y2="22.01"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
);
const UserGroupIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

interface PreregisterPageProps {
  onSuccessNotification: (visit: Visit) => void;
  initialData?: any;
}

type VisitType = 'host' | 'destination';

const PreregisterPage: React.FC<PreregisterPageProps> = ({ onSuccessNotification, initialData }) => {
    // Kita tetap gunakan preregisterGuest dari context untuk aksi simpan
    const { preregisterGuest } = useData(); 
    
    const [visitType, setVisitType] = useState<VisitType>('host');
    const [formData, setFormData] = useState({
        fullName: '', company: '', email: '', phone: '',
        hostName: '', destination: '', purpose: 'Rapat', visitDate: '', visitTime: '',
    });
    
    // State untuk fitur autocomplete host
    const [hostSuggestions, setHostSuggestions] = useState<Host[]>([]);
    const [isSearchingHost, setIsSearchingHost] = useState(false); // Indikator loading pencarian
    
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<Visit | null>(null);

    // CSS Animation Styles
    const animationStyles = `
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-in { animation: fadeInScale 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 20px; }
    `;

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({...prev, ...initialData}));
        }
    }, [initialData]);

    // --- LOGIKA PENCARIAN LIVE DARI DATABASE (DEBOUNCE) ---
    useEffect(() => {
        // Hanya jalan jika tipe kunjungan adalah 'host' dan user sudah mengetik minimal 2 karakter
        if (visitType === 'host' && formData.hostName.length >= 2) {
            
            // Set timeout untuk menunda request (Debounce) agar tidak spam server
            const delayDebounceFn = setTimeout(async () => {
                setIsSearchingHost(true);
                try {
                    // Panggil API untuk mengambil data terbaru dari database
                    const allHosts = await api.getHostsApi();
                    
                    // Filter di sisi client (atau backend jika ada endpoint search khusus)
                    const filtered = allHosts.filter(h => 
                        h.name.toLowerCase().includes(formData.hostName.toLowerCase())
                    );
                    setHostSuggestions(filtered);
                } catch (err) {
                    console.error("Gagal mencari host:", err);
                } finally {
                    setIsSearchingHost(false);
                }
            }, 500); // Tunggu 500ms setelah user berhenti mengetik

            return () => clearTimeout(delayDebounceFn);
        } else {
            setHostSuggestions([]);
        }
    }, [formData.hostName, visitType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fungsi saat mengetik nama host (hanya update state form)
    const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, hostName: e.target.value });
        // Logika pencarian dipindah ke useEffect di atas
    };
    
    // Fungsi saat user memilih nama dari dropdown
    const handleSelectHost = (host: Host) => {
        setFormData(prev => ({ ...prev, hostName: host.name }));
        setHostSuggestions([]); // Tutup dropdown
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // 1. Validasi Input Dasar
        if (!formData.fullName || !formData.email || !formData.phone) {
            setError('Nama, Email, dan Telepon wajib diisi.');
            return;
        }

        let visitData: Partial<Visit> = {};

        // 2. Validasi Host / Tujuan (Cek ulang ke database untuk memastikan host valid)
        if (visitType === 'host') {
            try {
                // Ambil data terbaru untuk validasi final
                const hosts = await api.getHostsApi();
                const selectedHost = hosts.find(h => h.name.toLowerCase().trim() === formData.hostName.toLowerCase().trim());
                
                if (!selectedHost) {
                    setError(`Host "${formData.hostName}" tidak ditemukan di database. Mohon pilih dari saran yang muncul.`);
                    return;
                }
                visitData.host = selectedHost;
            } catch (err) {
                setError("Gagal memvalidasi data host. Periksa koneksi internet.");
                return;
            }
        } else {
            if (!formData.destination) {
                 setError('Tujuan Unit/Lokasi wajib diisi.');
                 return;
            }
            visitData.destination = formData.destination;
        }

        // 3. Validasi Tanggal
        if (!formData.visitDate || !formData.visitTime) {
            setError('Tanggal dan Waktu kunjungan wajib diisi.');
            return;
        }

        try {
            const visitDateTime = new Date(`${formData.visitDate}T${formData.visitTime}`);
            
            // Panggil fungsi simpan dari context
            const newVisit = preregisterGuest({
                visitor: { 
                    fullName: formData.fullName, 
                    company: formData.company, 
                    email: formData.email, 
                    phone: formData.phone,
                    photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`
                },
                purpose: formData.purpose, 
                visitTime: visitDateTime,
                status: VisitStatus.Expected,
                ...visitData
            } as any);
            
            setSuccessData(newVisit);
            onSuccessNotification(newVisit);

            // Reset Form
            setFormData({
                fullName: '', company: '', email: '', phone: '',
                hostName: '', destination: '', purpose: 'Rapat', visitDate: '', visitTime: ''
            });

        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan saat menyimpan data.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans flex justify-center">
            <style>{animationStyles}</style>
            
            <div className="w-full max-w-6xl animate-in">
                {/* Main Card Container with Split Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 dark:border-gray-700">
                    
                    {/* LEFT PANEL: Visual & Info (GREEN THEME) */}
                    <div className="lg:w-1/3 bg-gradient-to-br from-emerald-600 to-green-700 p-8 md:p-12 text-white relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400 opacity-20 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                                    <CalendarPlusIcon className="w-4 h-4" />
                                    <span>VMS System</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Pra-Registrasi Tamu</h1>
                                <p className="text-emerald-100 text-lg leading-relaxed">
                                    Permudah proses kedatangan dengan mendaftarkan tamu Anda sebelum mereka tiba di lokasi.
                                </p>
                            </div>

                            <div className="mt-12 space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <MailIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-emerald-50">Undangan otomatis dikirim via Email ke tamu.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <IdCardIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-emerald-50">Tamu mendapatkan QR Code untuk akses cepat.</p>
                                </div>
                            </div>

                            <div className="mt-12 text-sm text-emerald-200 opacity-70">
                                &copy; {new Date().getFullYear()} Universitas Hamzanwadi
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Form */}
                    <div className="lg:w-2/3 p-8 md:p-12">
                        {error && (
                            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-in">
                                <div className="flex-shrink-0 text-red-500">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Section 1: Data Diri */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center mr-3 text-sm">01</span>
                                    Informasi Tamu
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Nama Lengkap</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <UserCheckIcon className="h-5 w-5" />
                                            </div>
                                            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} 
                                                className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3"
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Instansi / Perusahaan</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <BuildingIcon className="h-5 w-5" />
                                            </div>
                                            <input type="text" name="company" required value={formData.company} onChange={handleChange} 
                                                className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3"
                                                placeholder="Contoh: PT Teknologi Maju"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Alamat Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <MailIcon className="h-5 w-5" />
                                            </div>
                                            <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                                                className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3"
                                                placeholder="nama@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">No. WhatsApp / Telepon</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <PhoneIcon className="h-5 w-5" />
                                            </div>
                                            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} 
                                                className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3"
                                                placeholder="0812..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* Section 2: Detail Kunjungan */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 flex items-center justify-center mr-3 text-sm">02</span>
                                    Detail Kunjungan
                                </h2>

                                {/* Custom Radio Cards (GREEN THEME) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div 
                                        onClick={() => setVisitType('host')}
                                        className={`cursor-pointer border rounded-2xl p-4 flex items-center transition-all ${visitType === 'host' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${visitType === 'host' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                            <UserCheckIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${visitType === 'host' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>Bertemu Host</p>
                                            <p className="text-xs text-gray-500">Janji temu dengan staf/dosen</p>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setVisitType('destination')}
                                        className={`cursor-pointer border rounded-2xl p-4 flex items-center transition-all ${visitType === 'destination' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${visitType === 'destination' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                            <BuildingIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${visitType === 'destination' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>Lokasi Umum</p>
                                            <p className="text-xs text-gray-500">Perpustakaan, Lab, Gedung</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* INPUT HOST DENGAN AUTOCOMPLETE DAN FETCH API */}
                                    <div className="md:col-span-2 relative group">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                                            {visitType === 'host' ? 'Cari Nama Host' : 'Nama Lokasi / Unit'}
                                        </label>
                                        <div className="relative">
                                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                {visitType === 'host' ? <UserGroupIcon className="h-5 w-5"/> : <BuildingIcon className="h-5 w-5"/>}
                                            </div>
                                            {visitType === 'host' ? (
                                                <div className="relative w-full">
                                                    <input 
                                                        type="text" name="hostName" value={formData.hostName} onChange={handleHostChange} autoComplete="off"
                                                        className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3 pr-10"
                                                        placeholder="Ketik nama dosen atau staf..."
                                                        onBlur={() => setTimeout(() => setHostSuggestions([]), 200)}
                                                    />
                                                    {isSearchingHost && (
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" name="destination" value={formData.destination} onChange={handleChange}
                                                    className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-green-500 focus:border-green-500 dark:text-white transition-all py-3"
                                                    placeholder="Contoh: Gedung Rektorat Lt. 2"
                                                />
                                            )}
                                        </div>
                                        
                                        {/* List Saran Host */}
                                        {visitType === 'host' && hostSuggestions.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95">
                                                <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {hostSuggestions.map(host => (
                                                        <li 
                                                            key={host.id} 
                                                            onMouseDown={() => handleSelectHost(host)} 
                                                            className="px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700/50 last:border-0 flex items-center justify-between group transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                                                    {host.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 dark:text-white group-hover:text-emerald-600">{host.name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{host.department} &bull; {host.position}</p>
                                                                </div>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">
                                                                <ArrowRightIcon className="w-4 h-4" />
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Keperluan</label>
                                            <select name="purpose" value={formData.purpose} onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3 px-4 appearance-none"
                                            >
                                                <option>Rapat</option>
                                                <option>Vendor</option>
                                                <option>Tamu Undangan</option>
                                                <option>Riset / Studi</option>
                                                <option>Lainnya</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Tanggal</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                    <CalendarIcon className="h-5 w-5" />
                                                </div>
                                                <input type="date" name="visitDate" required value={formData.visitDate} onChange={handleChange} 
                                                    className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Jam</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                    <ClockIcon className="h-5 w-5" />
                                                </div>
                                                <input type="time" name="visitTime" required value={formData.visitTime} onChange={handleChange} 
                                                    className="pl-10 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all py-3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" 
                                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transform transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                    Daftarkan Tamu & Kirim QR Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Success Modal - Style Updated (GREEN THEME) */}
            {successData && (
                <Modal isOpen={!!successData} onClose={() => setSuccessData(null)} maxWidth="max-w-lg">
                    <div className="p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                             <SuccessLottie />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registrasi Berhasil!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Tamu atas nama <span className="font-bold text-gray-800 dark:text-gray-200">{successData.visitor.fullName}</span> telah terdaftar dalam sistem.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                            
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">KODE AKSES</p>
                            <p className="text-4xl font-mono font-bold text-gray-800 dark:text-white tracking-widest mb-4 group-hover:scale-110 transition-transform duration-300">
                                {successData.checkinCode}
                            </p>
                            
                            <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${successData.checkinCode}`} 
                                    alt="QR Code"
                                    className="w-32 h-32 rounded-lg"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                Kode ini juga telah dikirim ke email: <br/>
                                <span className="text-emerald-600 font-medium">{successData.visitor.email}</span>
                            </p>
                        </div>

                        <button 
                            onClick={() => setSuccessData(null)} 
                            className="mt-8 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            Tutup & Buat Baru
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PreregisterPage;
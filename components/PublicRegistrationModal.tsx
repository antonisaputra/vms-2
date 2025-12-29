import React, { useState } from 'react';
import { Event, Visit, Visitor } from '../types';
import SuccessLottie from './SuccessLottie';
import Modal from './Modal';
import { 
    UserIcon, 
    MailIcon, 
    BuildingIcon, 
    CalendarIcon, 
    CheckCircleIcon 
} from './icons'; 

interface PublicRegistrationModalProps {
  event: Event;
  onClose: () => void;
  // PERBAIKAN 1: Tambahkan Promise<Visit> karena ini async
  onRegister: (event: Event, visitorData: Omit<Visitor, 'id' | 'photoUrl' | 'phone' | 'idNumber'>) => Promise<Visit>;
}

const PublicRegistrationModal: React.FC<PublicRegistrationModalProps> = ({ event, onClose, onRegister }) => {
  const [formData, setFormData] = useState({ fullName: '', company: '', email: '' });
  const [successData, setSuccessData] = useState<Visit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;
    
    setIsSubmitting(true);
    
    try {
        // PERBAIKAN 2: Tambahkan 'await' di sini!
        // Kita harus menunggu server membalas sebelum menyimpan data ke state
        const newVisit = await onRegister(event, formData);
        
        setSuccessData(newVisit);
    } catch (error) {
        console.error("Registrasi gagal", error);
        alert("Gagal mendaftar. Silakan coba lagi.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Format Tanggal
  const dateObj = new Date(event.date);
  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
  const dayDate = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long' });
  const year = dateObj.getFullYear();

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-4xl">
        <div className="flex flex-col md:flex-row overflow-hidden min-h-[500px]">
            
            {/* BAGIAN KIRI: BANNER ACARA */}
            <div className="md:w-2/5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-6 border border-white/10">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Undangan Terbuka</span>
                    </div>
                    <h2 className="text-3xl font-bold leading-tight mb-2">{event.name}</h2>
                    <p className="text-emerald-100 text-sm opacity-90">Silakan lengkapi data diri Anda untuk mendapatkan akses masuk.</p>
                </div>

                <div className="relative z-10 mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold mb-1">Waktu Pelaksanaan</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold">{dayDate}</span>
                            <div className="flex flex-col text-sm leading-tight pb-1">
                                <span className="font-semibold">{monthName} {year}</span>
                                <span className="opacity-80">{dayName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAGIAN KANAN: FORM / SUKSES */}
            <div className="md:w-3/5 bg-white dark:bg-gray-800 p-8 flex flex-col justify-center">
                
                {successData ? (
                    // TAMPILAN SUKSES
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <SuccessLottie /> 
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Registrasi Berhasil!</h3>
                        <p className="text-gray-500 text-sm mb-8">
                            Tiket masuk untuk <span className="font-bold">{successData.visitor.fullName}</span> telah dibuat.
                        </p>

                        {/* TICKET CARD */}
                        <div className="relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm mx-auto max-w-sm">
                            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-r border-gray-200 dark:border-gray-700"></div>
                            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-l border-gray-200 dark:border-gray-700"></div>
                            
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">KODE AKSES</p>
                            <p className="text-3xl font-mono font-bold text-gray-800 dark:text-white tracking-widest mb-4">{successData.checkinCode}</p>
                            
                            <div className="bg-white p-2 rounded-xl inline-block shadow-sm border border-gray-100">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${successData.checkinCode}`} 
                                    alt="QR Code"
                                    className="w-32 h-32 rounded-lg"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={onClose} 
                            className="mt-8 w-full btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 py-3"
                        >
                            Selesai
                        </button>
                    </div>
                ) : (
                    // TAMPILAN FORM
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Formulir Pendaftaran</h3>
                            <p className="text-sm text-gray-500">Isi data dengan benar untuk keperluan sertifikat & akses.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Nama Lengkap</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.fullName} 
                                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                        required 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                        placeholder="Nama sesuai KTP"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Alamat Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                        <MailIcon className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})} 
                                        required 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                        placeholder="email@contoh.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Instansi / Perusahaan</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                        <BuildingIcon className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.company} 
                                        onChange={e => setFormData({...formData, company: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                        placeholder="Contoh: Universitas Hamzanwadi"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 py-3 font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <span>Daftar Sekarang</span>
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800 py-2 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default PublicRegistrationModal;
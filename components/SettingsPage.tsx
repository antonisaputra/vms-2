import React, { useState } from 'react';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import { 
  SettingsIcon, 
  Trash2Icon, 
  AlertTriangleIcon, 
  ClockIcon, 
  ChevronDownIcon,
  ShieldAlertIcon 
} from './icons';

interface SettingsPageProps {
  onPurgeData: (retentionMonths: number) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onPurgeData }) => {
  const [retentionPeriod, setRetentionPeriod] = useState<number>(6);
  
  // Menggunakan hook animasi agar elemen muncul bertahap
  const containerRef = useStaggerAnimation('.stagger-item');

  const handlePurgeClick = () => {
    if (retentionPeriod <= 0) return;
    
    // Menggunakan confirm bawaan browser sesuai request logika asli
    if (window.confirm(`ANDA YAKIN INGIN MENGHAPUS DATA KUNJUNGAN?\n\nSemua data tamu yang sudah check-out lebih dari ${retentionPeriod} bulan yang lalu akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.`)) {
      onPurgeData(retentionPeriod);
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto pb-10">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8 stagger-item">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan Sistem</h1>
                <p className="text-muted-foreground text-sm">Kelola konfigurasi sistem dan kebijakan kepatuhan data.</p>
            </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 p-1 rounded-2xl shadow-sm stagger-item">
            <div className="p-6 md:p-8">
                
                {/* Section Title */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                        <ShieldAlertIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Kebijakan Retensi Data (UU PDP)</h2>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            Atur periode penyimpanan data tamu yang sudah check-out. Sistem akan secara otomatis mengidentifikasi data yang lebih lama dari periode yang dipilih untuk dihapus demi mematuhi peraturan privasi data.
                        </p>
                    </div>
                </div>

                {/* Control Input Section */}
                <div className="bg-card border border-border/60 rounded-xl p-5 mb-8">
                    <label htmlFor="retentionPeriod" className="block text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                        Hapus data yang lebih lama dari:
                    </label>
                    <div className="relative max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <ClockIcon className="w-5 h-5" />
                        </div>
                        <select
                            id="retentionPeriod"
                            value={retentionPeriod}
                            onChange={(e) => setRetentionPeriod(Number(e.target.value))}
                            className="appearance-none block w-full pl-10 pr-10 py-3 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none cursor-pointer"
                        >
                            <option value={0}>Jangan Pernah Hapus (Simpan Selamanya)</option>
                            <option value={6}>6 Bulan</option>
                            <option value={12}>1 Tahun (12 Bulan)</option>
                            <option value={24}>2 Tahun (24 Bulan)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                            <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-5 md:p-6 relative overflow-hidden group">
                    {/* Decorative Background */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200/20 dark:bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-2">
                            <AlertTriangleIcon className="w-5 h-5" />
                            Zona Berbahaya
                        </h3>
                        <p className="text-sm text-red-600/80 dark:text-red-300/80 mb-6 max-w-2xl">
                            Menjalankan proses ini akan menghapus data tamu lama secara <strong>permanen</strong> dari database. 
                            Pastikan Anda telah melakukan backup (cadangan data) sebelum melanjutkan, karena tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <button
                                onClick={handlePurgeClick}
                                disabled={retentionPeriod <= 0}
                                className={`
                                    btn inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm
                                    ${retentionPeriod > 0 
                                        ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/20 hover:scale-[1.02]' 
                                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'}
                                `}
                            >
                                <Trash2Icon className="w-4 h-4 mr-2" />
                                Jalankan Penghapusan Data
                            </button>
                            
                            {retentionPeriod <= 0 && (
                                <span className="text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/50">
                                    Opsi "Jangan Pernah Hapus" dipilih.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default SettingsPage;
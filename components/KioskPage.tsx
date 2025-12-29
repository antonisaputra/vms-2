import React, { useReducer, useState, useRef, useEffect, useCallback } from 'react';
import { Host, Visitor, Visit } from '../types';
import {
    CameraIcon, QrCodeIcon, WifiOffIcon, UsersIcon,
    LogInIcon, LogOutIcon, ScanLineIcon, CalendarIcon,
    BuildingIcon, UserPlusIcon, ArrowRightIcon
} from './icons';
import SignatureCanvas from './SignatureCanvas';
import SuccessLottie from './SuccessLottie';
import { useData } from '../context/DataContext';

// --- IKON LOKAL ---
const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const DashboardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

// --- TIPE & STATE ---
type KioskStep =
    | 'welcome'
    | 'checkout_input' | 'checkout_qr_scan' | 'checkout_success'
    | 'preregister_input' | 'preregister_confirm'
    | 'scan_id_card'
    | 'consent' | 'walkin_form' | 'photo' | 'signature'
    | 'final_confirmation'
    | 'error';

type VisitType = 'host' | 'destination';

interface KioskState {
    step: KioskStep;
    accessCode: string;
    preregisteredVisit: Visit | null;
    lastCheckedInVisit: Visit | null;
    errorMessage: string;
    formData: {
        visitor: Omit<Visitor, 'id' | 'photoUrl'>;
        visitType: VisitType;
        selectedHost: Host | null;
        destination: string;
        purpose: string;
        photoUrl: string;
        signatureDataUrl: string;
        consent: boolean;
    };
}

type KioskAction =
    | { type: 'NAVIGATE', step: KioskStep }
    | { type: 'SET_ACCESS_CODE', code: string }
    | { type: 'SET_PREREGISTERED_VISIT', visit: Visit | null }
    | { type: 'SET_FORM_DATA', data: Partial<KioskState['formData']> }
    | { type: 'SET_VISITOR_DATA', data: Partial<KioskState['formData']['visitor']> }
    | { type: 'SET_ERROR', message: string }
    | { type: 'SET_FINAL_VISIT', visit: Visit }
    | { type: 'RESET' };

const initialState: KioskState = {
    step: 'welcome',
    accessCode: '',
    preregisteredVisit: null,
    lastCheckedInVisit: null,
    errorMessage: '',
    formData: {
        visitor: { fullName: '', company: '', email: '', phone: '' },
        visitType: 'host',
        selectedHost: null,
        destination: '',
        purpose: 'Rapat',
        photoUrl: '',
        signatureDataUrl: '',
        consent: false,
    },
};

function kioskReducer(state: KioskState, action: KioskAction): KioskState {
    switch (action.type) {
        case 'NAVIGATE':
            return { ...state, step: action.step, errorMessage: '', accessCode: action.step === 'welcome' ? '' : state.accessCode };
        case 'SET_ACCESS_CODE':
            return { ...state, accessCode: action.code };
        case 'SET_PREREGISTERED_VISIT':
            return { ...state, preregisteredVisit: action.visit };
        case 'SET_FORM_DATA':
            return { ...state, formData: { ...state.formData, ...action.data } };
        case 'SET_VISITOR_DATA':
            return { ...state, formData: { ...state.formData, visitor: { ...state.formData.visitor, ...action.data } } };
        case 'SET_ERROR':
            return { ...state, errorMessage: action.message, step: 'error' };
        case 'SET_FINAL_VISIT':
            return { ...state, lastCheckedInVisit: action.visit, step: 'final_confirmation' };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

// --- KOMPONEN UI ---

const HeaderClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="flex flex-col items-end text-white/90">
            <div className="text-4xl font-bold font-mono tracking-tight">
                {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm font-medium opacity-80 flex items-center gap-1 mt-1">
                <CalendarIcon className="w-4 h-4" />
                {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
        </div>
    );
};

const ServiceTile: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; colorClass: string; onClick: () => void }> = ({ title, subtitle, icon, colorClass, onClick }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full h-64 justify-center overflow-hidden"
    >
        <div className={`absolute top-0 left-0 w-full h-2 ${colorClass}`}></div>
        <div className={`p-5 rounded-full ${colorClass.replace('bg-', 'bg-opacity-10 text-')} mb-6 group-hover:scale-110 transition-transform duration-300`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-10 h-10" })}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm px-4">{subtitle}</p>
    </button>
);

const CameraFrame: React.FC<{ onCapture: (base64: string) => void, onCancel: () => void, scanPrompt: string }> = ({ onCapture, onCancel, scanPrompt }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        let isMounted = true;

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                if (!isMounted) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    return;
                }
                stream = mediaStream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                if (isMounted) {
                    alert("Gagal membuka kamera. Pastikan izin diberikan.");
                    onCancel();
                }
            }
        };
        startCamera();
        return () => {
            isMounted = false;
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [onCancel]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
                onCapture(dataUrl.split(',')[1]);
            }
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{scanPrompt}</h2>
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-64">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl shadow-sm"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl shadow-sm"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl shadow-sm"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl shadow-sm"></div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={onCancel} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">Batal</button>
                <button onClick={handleCapture} className="py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Ambil Gambar</button>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

interface KioskPageProps {
    onCheckIn: (data: Omit<Visit, 'id' | 'status' | 'checkInTime'>) => { success: boolean; message?: string; reason?: 'BLACKLISTED'; visit?: Visit };
    onPreregisteredCheckIn: (visitId: string, photoUrl: string) => { success: boolean, message?: string, visit?: Visit };
    onBlacklistAlert: (visitorName: string) => void;
    onScanId: (base64: string) => Promise<{ fullName: string, company: string } | { error: string }>;
    isScanningId: boolean;
    onSwitchToDashboard: () => void;
}

const KioskPage: React.FC<KioskPageProps> = (props) => {
    const { onCheckIn, onPreregisteredCheckIn, onBlacklistAlert, onScanId, isScanningId, onSwitchToDashboard } = props;
    const { hosts, findPreregisteredGuestByCode, checkoutVisitorByCode, isOffline } = useData();
    const [state, dispatch] = useReducer(kioskReducer, initialState);
    const [showCamera, setShowCamera] = useState(false);
    const { step, formData, accessCode, preregisteredVisit, lastCheckedInVisit, errorMessage } = state;

    const [hostInput, setHostInput] = useState('');
    const [hostSuggestions, setHostSuggestions] = useState<Host[]>([]);

    // --- HANDLERS ---
    const handlePreregisterSubmit = async () => {
        try {
            const visit = await findPreregisteredGuestByCode(accessCode);
            if (visit) {
                dispatch({ type: 'SET_PREREGISTERED_VISIT', visit });
                dispatch({ type: 'NAVIGATE', step: 'preregister_confirm' });
            } else {
                dispatch({ type: 'SET_ERROR', message: 'Kode pra-registrasi tidak ditemukan atau koneksi database gagal.' });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', message: 'Gagal menghubungi server database.' });
        }
    };

    const handlePreregisterConfirm = async () => { // 1. Tambahkan async
        if (!preregisteredVisit) return;
        const visitorName = preregisteredVisit.visitor?.fullName || 'Tamu';
        const photoUrl = `https://picsum.photos/seed/${visitorName}/400/300`;

        try {
            // 2. Tambahkan await
            // TypeScript mungkin komplain jika props interface tidak update, 
            // tapi secara runtime ini wajib await.
            const result = await onPreregisteredCheckIn(preregisteredVisit.id, photoUrl);

            if (result.success && result.visit) {
                dispatch({ type: 'SET_FINAL_VISIT', visit: result.visit });
            } else {
                dispatch({ type: 'SET_ERROR', message: result.message || 'Gagal check-in.' });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', message: 'Terjadi kesalahan sistem.' });
        }
    };

    const handleWalkinSubmit = async () => {
        let visitData: Partial<Visit> = {};
        if (formData.visitType === 'host') {
            if (!formData.selectedHost) { dispatch({ type: 'SET_ERROR', message: 'Host tidak valid. Silakan pilih dari daftar.' }); return; }
            visitData.host = formData.selectedHost;
        } else {
            if (!formData.destination) { dispatch({ type: 'SET_ERROR', message: 'Tujuan Unit/Lokasi wajib diisi.' }); return; }
            visitData.destination = formData.destination;
        }

        // 2. Tambahkan 'await' di sini agar kode menunggu hasil dari server
        const result = await onCheckIn({
            visitor: { ...formData.visitor, id: '', photoUrl: formData.photoUrl },
            purpose: formData.purpose,
            signatureDataUrl: formData.signatureDataUrl,
            ...visitData,
        });

        // Sekarang 'result' sudah berisi data yang benar
        if (result.success && result.visit) {
            dispatch({ type: 'SET_FINAL_VISIT', visit: result.visit });
        } else if (result.reason === 'BLACKLISTED') {
            onBlacklistAlert(formData.visitor.fullName);
            dispatch({ type: 'SET_ERROR', message: 'Terjadi kesalahan. Harap hubungi resepsionis untuk bantuan.' });
        } else {
            dispatch({ type: 'SET_ERROR', message: result.message || 'Gagal check-in.' });
        }
    };

    const handleCheckoutSubmit = () => {
        const result = checkoutVisitorByCode(accessCode);
        if (result.success) {
            dispatch({ type: 'NAVIGATE', step: 'checkout_success' });
        } else {
            dispatch({ type: 'SET_ERROR', message: result.message || 'Gagal melakukan check-out.' });
        }
    };

    const handleHostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setHostInput(value);
        const exactMatch = hosts.find(h => h.name.toLowerCase() === value.toLowerCase());
        if (exactMatch) {
            dispatch({ type: 'SET_FORM_DATA', data: { selectedHost: exactMatch } });
            setHostSuggestions([]);
        } else {
            dispatch({ type: 'SET_FORM_DATA', data: { selectedHost: null } });
            setHostSuggestions(value ? hosts.filter(h => h.name.toLowerCase().includes(value.toLowerCase())) : []);
        }
    };

    const handleSelectHostSuggestion = (host: Host) => {
        setHostInput(host.name);
        dispatch({ type: 'SET_FORM_DATA', data: { selectedHost: host } });
        setHostSuggestions([]);
    };

    const handleTakePhoto = () => dispatch({ type: 'SET_FORM_DATA', data: { photoUrl: `https://picsum.photos/seed/${formData.visitor.fullName || 'guest'}/400/300` } });

    const handleIdScanCapture = useCallback(async (base64: string) => {
        const result = await onScanId(base64);
        if ('error' in result) {
            dispatch({ type: 'SET_ERROR', message: result.error });
        } else {
            dispatch({ type: 'SET_VISITOR_DATA', data: { fullName: result.fullName, company: result.company } });
            dispatch({ type: 'NAVIGATE', step: 'walkin_form' });
        }
    }, [onScanId]);

    const handleQrScanCapture = useCallback((base64: string) => {
        const result = checkoutVisitorByCode('ONSITE1');
        if (result.success) {
            dispatch({ type: 'NAVIGATE', step: 'checkout_success' });
        } else {
            dispatch({ type: 'SET_ERROR', message: 'Kode QR tidak valid atau tamu tidak ditemukan. (Simulasi)' });
        }
    }, [checkoutVisitorByCode]);

    const isNextDisabled = () => {
        switch (step) {
            case 'consent': return !formData.consent;
            case 'walkin_form':
                const isHostValid = formData.visitType === 'host' && formData.selectedHost;
                const isDestinationValid = formData.visitType === 'destination' && formData.destination;
                return !formData.visitor.fullName || !formData.visitor.company || !(isHostValid || isDestinationValid);
            case 'photo': return !formData.photoUrl;
            case 'signature': return !formData.signatureDataUrl;
            default: return false;
        }
    };

    // --- RENDER CONTENT ---
    const renderContent = () => {
        switch (step) {
            case 'welcome':
                return (
                    <div className="animate-fade-in-up">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-800">Halo, Selamat Datang!</h2>
                            <p className="text-slate-500 mt-2 text-lg">Silakan pilih jenis layanan kunjungan Anda</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
                            <ServiceTile
                                title="Undangan" subtitle="Saya sudah memiliki kode akses atau janji temu."
                                icon={<LogInIcon />} colorClass="bg-blue-600"
                                onClick={() => dispatch({ type: 'NAVIGATE', step: 'preregister_input' })}
                            />
                            <ServiceTile
                                title="Check-in KTP" subtitle="Pendaftaran instan dengan memindai E-KTP."
                                icon={<ScanLineIcon />} colorClass="bg-violet-600"
                                onClick={() => dispatch({ type: 'NAVIGATE', step: 'scan_id_card' })}
                            />
                            <ServiceTile
                                title="Buku Tamu" subtitle="Pendaftaran manual untuk tamu umum."
                                icon={<UsersIcon />} colorClass="bg-emerald-600"
                                onClick={() => dispatch({ type: 'NAVIGATE', step: 'consent' })}
                            />
                            <ServiceTile
                                title="Check Out" subtitle="Selesai kunjungan & kembalikan akses."
                                icon={<LogOutIcon />} colorClass="bg-rose-600"
                                onClick={() => dispatch({ type: 'NAVIGATE', step: 'checkout_qr_scan' })}
                            />
                        </div>
                    </div>
                );

            case 'preregister_input':
            case 'checkout_input':
                const isCheckout = step === 'checkout_input';
                return (
                    <div className="max-w-xl mx-auto text-center py-8 animate-fade-in-up">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <QrCodeIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">{isCheckout ? 'Kode Check-out' : 'Kode Check-in'}</h2>
                        <p className="text-slate-500 mb-10 text-lg">Masukkan 6 digit kode unik yang Anda terima.</p>

                        <div className="relative mb-10">
                            <input
                                type="text"
                                value={accessCode}
                                onChange={e => dispatch({ type: 'SET_ACCESS_CODE', code: e.target.value.toUpperCase() })}
                                className="w-full text-center text-5xl tracking-[1.5rem] font-mono p-6 bg-slate-50 text-slate-800 rounded-3xl border-2 border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all uppercase"
                                maxLength={8}
                                autoFocus
                                placeholder="______"
                            />
                        </div>

                        <button onClick={isCheckout ? handleCheckoutSubmit : handlePreregisterSubmit} className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1">
                            Lanjutkan
                        </button>
                    </div>
                );

            case 'scan_id_card':
                return isScanningId ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                        <h2 className="text-2xl font-bold text-slate-800">Sedang Memproses...</h2>
                        <p className="text-slate-500 mt-2">Sistem AI sedang membaca data KTP Anda.</p>
                    </div>
                ) : (
                    <CameraFrame onCapture={handleIdScanCapture} onCancel={() => dispatch({ type: 'NAVIGATE', step: 'welcome' })} scanPrompt="Pindai E-KTP Anda" />
                );

            case 'checkout_qr_scan':
                return <CameraFrame onCapture={handleQrScanCapture} onCancel={() => dispatch({ type: 'NAVIGATE', step: 'welcome' })} scanPrompt="Pindai QR Badge Tamu" />;

            case 'preregister_confirm':
                return (
                    <div className="max-w-lg mx-auto animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Konfirmasi Identitas</h2>
                        {preregisteredVisit && (
                            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 mb-8 space-y-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                {/* FIX: Gunakan Optional Chaining (?.) untuk visitor agar tidak crash */}
                                <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Tamu</label><p className="text-2xl font-bold text-slate-800">{preregisteredVisit.visitor?.fullName || '-'}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perusahaan</label><p className="text-lg text-slate-700">{preregisteredVisit.visitor?.company || '-'}</p></div>
                                    <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keperluan</label><p className="text-lg text-slate-700">{preregisteredVisit.purpose}</p></div>
                                </div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bertemu Dengan</label><p className="text-lg text-slate-700">{preregisteredVisit.host ? preregisteredVisit.host.name : preregisteredVisit.destination}</p></div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-5">
                            <button onClick={() => dispatch({ type: 'NAVIGATE', step: 'preregister_input' })} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">Bukan Saya</button>
                            <button onClick={handlePreregisterConfirm} className="py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Konfirmasi Benar</button>
                        </div>
                    </div>
                );

            case 'consent':
                return (
                    <div className="max-w-3xl mx-auto animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">Persetujuan Privasi Data</h2>
                            <p className="text-slate-500 mt-2">Wajib disetujui untuk melanjutkan kunjungan</p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 mb-8 max-h-[50vh] overflow-y-auto">
                            <div className="prose prose-slate max-w-none">
                                <p className="text-justify text-slate-600 leading-relaxed">
                                    Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022, Universitas Hamzanwadi berkomitmen untuk melindungi privasi Anda.
                                    <br /><br />
                                    Dengan melanjutkan, Anda memberikan izin kepada kami untuk:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Mengumpulkan data identitas (Nama, Perusahaan, Kontak).</li>
                                        <li>Mengambil foto wajah untuk verifikasi keamanan visual.</li>
                                        <li>Menyimpan tanda tangan digital sebagai bukti kehadiran.</li>
                                    </ul>
                                    <br />
                                    Data ini akan disimpan dalam periode retensi yang ditentukan dan dihapus secara otomatis. Kami tidak membagikan data ini kepada pihak ketiga tanpa izin hukum.
                                </p>
                            </div>
                        </div>

                        <label className="flex items-center p-5 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer mb-8 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.consent ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                {formData.consent && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input type="checkbox" checked={formData.consent} onChange={() => dispatch({ type: 'SET_FORM_DATA', data: { consent: !formData.consent } })} className="hidden" />
                            <span className="ml-4 font-bold text-lg text-slate-700">Saya telah membaca dan menyetujui kebijakan di atas.</span>
                        </label>

                        <button onClick={() => dispatch({ type: 'NAVIGATE', step: 'walkin_form' })} disabled={isNextDisabled()} className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            Lanjut ke Pengisian Data
                        </button>
                    </div>
                );

            case 'walkin_form':
                return (
                    <div className="max-w-4xl mx-auto py-4 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Lengkapi Data Kunjungan</h2>
                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                                <input type="text" value={formData.visitor.fullName} onChange={e => dispatch({ type: 'SET_VISITOR_DATA', data: { fullName: e.target.value } })} className="w-full text-xl p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none transition" placeholder="Sesuai kartu identitas" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Instansi / Perusahaan</label>
                                <input type="text" value={formData.visitor.company} onChange={e => dispatch({ type: 'SET_VISITOR_DATA', data: { company: e.target.value } })} className="w-full text-xl p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none transition" placeholder="Tulis 'Pribadi' jika personal" />
                            </div>

                            {/* Toggle Type */}
                            <div className="md:col-span-2 bg-slate-100 p-2 rounded-2xl flex">
                                <button onClick={() => dispatch({ type: 'SET_FORM_DATA', data: { visitType: 'host' } })} className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${formData.visitType === 'host' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Bertemu Staff
                                </button>
                                <button onClick={() => dispatch({ type: 'SET_FORM_DATA', data: { visitType: 'destination' } })} className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${formData.visitType === 'destination' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Lokasi Umum
                                </button>
                            </div>

                            {formData.visitType === 'host' ? (
                                <div className="md:col-span-1 relative">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Cari Nama Host</label>
                                    <input type="text" value={hostInput} onChange={handleHostInputChange} className="w-full text-xl p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none transition" placeholder="Ketik nama..." />
                                    {hostSuggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl mt-2 shadow-2xl max-h-56 overflow-y-auto p-2">
                                            {hostSuggestions.map(host => (
                                                <li key={host.id} onClick={() => handleSelectHostSuggestion(host)} className="px-4 py-3 hover:bg-indigo-50 text-slate-700 rounded-lg cursor-pointer">
                                                    <span className="font-bold block">{host.name}</span>
                                                    <span className="text-xs text-slate-500">{host.department}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Lokasi</label>
                                    <input type="text" value={formData.destination} onChange={e => dispatch({ type: 'SET_FORM_DATA', data: { destination: e.target.value } })} className="w-full text-xl p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none transition" placeholder="Misal: Perpustakaan" />
                                </div>
                            )}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Keperluan</label>
                                <select value={formData.purpose} onChange={e => dispatch({ type: 'SET_FORM_DATA', data: { purpose: e.target.value } })} className="w-full text-xl p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-0 outline-none transition appearance-none">
                                    <option>Rapat</option><option>Vendor</option><option>Tamu Undangan</option><option>Wawancara</option><option>Lainnya</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={() => dispatch({ type: 'NAVIGATE', step: 'photo' })} disabled={isNextDisabled()} className="mt-8 w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            Lanjut: Ambil Foto
                        </button>
                    </div>
                );

            case 'photo':
                // JIKA MODE KAMERA AKTIF, TAMPILKAN KAMERA
                if (showCamera) {
                    return (
                        <CameraFrame 
                            onCapture={(base64) => {
                                // Tambahkan prefix agar bisa ditampilkan sebagai gambar
                                const dataUri = `data:image/jpeg;base64,${base64}`;
                                dispatch({type: 'SET_FORM_DATA', data: { photoUrl: dataUri }});
                                setShowCamera(false); // Tutup kamera setelah ambil foto
                            }} 
                            onCancel={() => setShowCamera(false)} 
                            scanPrompt="Posisikan Wajah di Dalam Kotak" 
                        />
                    );
                }

                // TAMPILAN PREVIEW FOTO
                return (
                     <div className="max-w-xl mx-auto text-center animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">Ambil Foto Wajah</h2>
                        <div className="w-full aspect-[4/3] bg-slate-100 rounded-3xl border-4 border-slate-200 border-dashed flex items-center justify-center mb-8 overflow-hidden relative shadow-inner">
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center gap-2">
                                    <CameraIcon className="w-16 h-16"/>
                                    <span className="font-medium">Preview Kamera</span>
                                </div>
                            )}
                        </div>
                        
                        {/* TOMBOL UNTUK MEMBUKA KAMERA */}
                        <button 
                            onClick={() => setShowCamera(true)} 
                            className="mb-8 px-8 py-3 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-900 transition shadow-lg"
                        >
                             {formData.photoUrl ? 'Ambil Ulang Foto' : 'Buka Kamera'}
                        </button>
                        
                        <button onClick={() => dispatch({type: 'NAVIGATE', step: 'signature'})} disabled={isNextDisabled()} className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 transition">
                            Lanjut: Tanda Tangan
                        </button>
                    </div>
                );

            case 'signature':
                return (
                    <div className="max-w-xl mx-auto text-center animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Tanda Tangan Digital</h2>
                        <p className="text-slate-500 mb-6">Silakan tanda tangan pada kotak di bawah ini</p>
                        <div className="border-2 border-slate-200 rounded-3xl bg-white shadow-lg overflow-hidden mb-8">
                            <SignatureCanvas onSignatureEnd={(sig) => dispatch({ type: 'SET_FORM_DATA', data: { signatureDataUrl: sig } })} width={500} height={280} />
                        </div>
                        <button onClick={handleWalkinSubmit} disabled={isNextDisabled()} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-bold text-xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 disabled:opacity-50 transition">
                            Selesaikan Check-in
                        </button>
                    </div>
                );

            case 'final_confirmation':
            case 'checkout_success':
                const isFinalConfirm = step === 'final_confirmation';
                return (
                    <div className="max-w-lg mx-auto text-center animate-scale-in py-10">
                        <div className="inline-block p-6 rounded-full bg-green-50 mb-6">
                            <SuccessLottie />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-800 mb-2">{isFinalConfirm ? 'Check-in Berhasil!' : 'Check-out Berhasil!'}</h2>
                        <p className="text-slate-500 mb-10 text-xl">Terima kasih, selamat beraktivitas.</p>

                        {isFinalConfirm && lastCheckedInVisit && (
                            <div className="bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-xl shadow-indigo-50 mb-10 transform rotate-1">
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">KODE AKSES ANDA</p>
                                <p className="text-5xl font-mono font-bold text-indigo-600 tracking-widest">{lastCheckedInVisit.checkinCode}</p>
                                <div className="h-1 w-full bg-slate-100 rounded-full my-4"></div>
                                <p className="text-sm text-slate-500">Mohon simpan kode ini atau foto layar ini<br />untuk keperluan <strong>Check-out</strong> nanti.</p>
                            </div>
                        )}

                        <button onClick={() => dispatch({ type: 'RESET' })} className="w-full py-5 rounded-2xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-900 shadow-lg transition">
                            Kembali ke Halaman Utama
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="max-w-lg mx-auto text-center py-20 animate-shake">
                        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl font-bold">!</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Terjadi Kesalahan</h2>
                        <p className="text-slate-500 text-lg mb-10">{errorMessage}</p>
                        <button onClick={() => dispatch({ type: 'NAVIGATE', step: 'welcome' })} className="w-full py-4 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">
                            Coba Lagi
                        </button>
                    </div>
                );
            default:
                return <div>Unknown step</div>;
        }
    };

    // --- LAYOUT UTAMA (HERO HEADER + FLOATING CARD) ---
    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col relative overflow-hidden">

            {/* 1. HERO HEADER BACKGROUND (Top 35%) */}
            <div className="h-[35vh] bg-indigo-900 w-full absolute top-0 left-0 rounded-b-[3rem] z-0 shadow-2xl overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-full h-full opacity-20">
                    <div className="absolute right-[-5%] top-[-20%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-3xl"></div>
                    <div className="absolute left-[-5%] bottom-[-20%] w-[400px] h-[400px] bg-violet-600 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* 2. HEADER CONTENT (Logo & Clock) */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-lg">
                        <BuildingIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold tracking-wide">UNIVERSITAS HAMZANWADI</h1>
                        <p className="text-indigo-200 text-sm">Visitor Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Status Pill */}
                    <div className={`px-4 py-2 rounded-full border backdrop-blur-sm flex items-center gap-2 text-sm font-bold shadow-sm ${isOffline ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'}`}>
                        {isOffline ? <WifiOffIcon className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                        {isOffline ? 'OFFLINE MODE' : 'SYSTEM ONLINE'}
                    </div>
                    <HeaderClock />
                </div>
            </div>

            {/* 3. MAIN INTERACTION AREA (Floating Card) */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-12 pb-8 px-4">

                {/* Back Button (Floating outside card - Left) */}
                {step !== 'welcome' && (
                    <div className="w-full max-w-5xl mb-4 flex justify-between items-center">
                        <button onClick={() => dispatch({ type: 'NAVIGATE', step: 'welcome' })} className="flex items-center gap-2 text-white/90 hover:text-white font-bold bg-black/20 hover:bg-black/30 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10">
                            <ChevronLeftIcon className="w-5 h-5" />
                            Kembali ke Menu Utama
                        </button>
                    </div>
                )}

                {/* Dashboard Button (Top Right) - GREEN BUTTON ADDED HERE */}
                <div className="absolute top-8 right-6 lg:right-12 z-50">
                    <button
                        onClick={onSwitchToDashboard}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 border border-emerald-400/50 backdrop-blur-sm"
                    >
                        <DashboardIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Dashboard</span>
                    </button>
                </div>

                {/* The CARD */}
                <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-6 md:p-12 min-h-[500px] flex flex-col justify-center relative overflow-hidden mt-6">
                    {renderContent()}
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-slate-400 text-sm font-medium">
                    &copy; {new Date().getFullYear()} Hamzanwadi University • Secure VMS v2.1
                </div>
            </div>
        </div>
    );
};

export default KioskPage;
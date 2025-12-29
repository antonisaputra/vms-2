import React, { useState, useCallback } from 'react';
import { Host, Visitor, Visit } from '../types';
import SignatureCanvas from './SignatureCanvas';
import SuccessLottie from './SuccessLottie';
import Modal from './Modal';
import { CameraIcon } from './icons';
import { useData } from '../context/DataContext';

interface ManualCheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckIn: (data: Omit<Visit, 'id' | 'status' | 'checkInTime'>) => { success: boolean; message?: string; reason?: 'BLACKLISTED'; visit?: Visit };
    onBlacklistAlert: (visitorName: string) => void;
}

type VisitType = 'host' | 'destination';

type FormData = {
    visitor: Omit<Visitor, 'id' | 'photoUrl'>;
    visitType: VisitType;
    hostName: string;
    destination: string;
    purpose: string;
    photoUrl: string;
    signatureDataUrl: string;
    consent: boolean;
};

const ManualCheckinModal: React.FC<ManualCheckinModalProps> = ({ isOpen, onClose, onCheckIn, onBlacklistAlert }) => {
    const { hosts } = useData();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        visitor: { fullName: '', company: '', email: '', phone: '' },
        visitType: 'host',
        hostName: '',
        destination: '', 
        purpose: 'Rapat', 
        photoUrl: '', 
        signatureDataUrl: '', 
        consent: false,
    });
    const [hostSuggestions, setHostSuggestions] = useState<Host[]>([]);
    const [error, setError] = useState<string>('');

    const resetForm = useCallback(() => {
        setStep(1);
        setError('');
        setFormData({
            visitor: { fullName: '', company: '', email: '', phone: '' },
            visitType: 'host',
            hostName: '', 
            destination: '',
            purpose: 'Rapat', 
            photoUrl: '', 
            signatureDataUrl: '', 
            consent: false,
        });
    }, []);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleVisitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, visitor: { ...prev.visitor, [e.target.name]: e.target.value } }));
    };

    const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, hostName: value }));
        if (value.length > 2) {
            setHostSuggestions(hosts.filter(h => h.name.toLowerCase().includes(value.toLowerCase())));
        } else {
            setHostSuggestions([]);
        }
    };
    
    const handleSelectHost = (host: Host) => {
        setFormData(prev => ({...prev, hostName: host.name}));
        setHostSuggestions([]);
    };

    const handleTakePhoto = () => {
        setFormData(prev => ({ ...prev, photoUrl: `https://picsum.photos/seed/${prev.visitor.fullName || 'guest'}/400/300` }));
    };

    const handleSubmit = () => {
        setError('');
        let visitData: Partial<Visit> = {};
        if (formData.visitType === 'host') {
            const selectedHost = hosts.find(h => h.name === formData.hostName);
            if (!selectedHost) {
                setError('Host yang dituju tidak valid. Harap pilih dari daftar.');
                return;
            }
            visitData.host = selectedHost;
        } else {
            if (!formData.destination) {
                setError('Tujuan Unit/Lokasi wajib diisi.');
                return;
            }
            visitData.destination = formData.destination;
        }


        const newVisitor: Visitor = { id: '', ...formData.visitor, photoUrl: formData.photoUrl };
        
        const result = onCheckIn({
            visitor: newVisitor, 
            purpose: formData.purpose, 
            signatureDataUrl: formData.signatureDataUrl,
            ...visitData,
        });

        if (result.success) {
            handleNext(); // Go to confirmation screen
        } else {
            if (result.reason === 'BLACKLISTED') {
                onBlacklistAlert(newVisitor.fullName);
                setError(`PERINGATAN: ${newVisitor.fullName} ada di daftar hitam. Proses dihentikan.`);
            } else {
                setError(result.message || 'Gagal melakukan check-in.');
            }
        }
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1: // Consent
                return (
                    <div>
                        <h3 className="text-lg font-medium leading-6">Persetujuan UU PDP</h3>
                        <div className="mt-4 p-4 bg-secondary rounded-lg max-h-60 overflow-y-auto">
                            <p className="text-sm text-muted-foreground">
                                Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022, kami memproses data pribadi Anda untuk tujuan keamanan dan administrasi kunjungan di lingkungan Universitas Hamzanwadi. Data yang kami kumpulkan meliputi nama, perusahaan, kontak, foto, dan tanda tangan digital. Data ini akan disimpan secara aman dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
                            </p>
                        </div>
                        <div className="mt-6 flex items-start">
                            <div className="flex items-center h-5">
                                <input id="consent" name="consent" type="checkbox" checked={formData.consent} onChange={(e) => setFormData(p => ({...p, consent: e.target.checked}))} className="focus:ring-primary h-4 w-4 text-primary border-border rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="consent" className="font-medium">Saya telah membaca, memahami, dan menyetujui pemrosesan data pribadi saya.</label>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Guest Data
                return (
                    <div>
                        <h3 className="text-lg font-medium leading-6">Input Data Tamu</h3>
                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="fullName">Nama Lengkap</label>
                                <input type="text" name="fullName" id="fullName" value={formData.visitor.fullName} onChange={handleVisitorChange} />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="company">Perusahaan/Instansi</label>
                                <input type="text" name="company" id="company" value={formData.visitor.company} onChange={handleVisitorChange} />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input type="email" name="email" id="email" value={formData.visitor.email} onChange={handleVisitorChange} />
                            </div>
                            <div>
                                <label htmlFor="phone">No. Telepon</label>
                                <input type="tel" name="phone" id="phone" value={formData.visitor.phone} onChange={handleVisitorChange} />
                            </div>
                        </div>
                    </div>
                );
            case 3: // Photo
                return (
                    <div>
                        <h3 className="text-lg font-medium leading-6">Pengambilan Foto</h3>
                        <div className="mt-4 flex flex-col items-center justify-center bg-secondary rounded-lg h-64">
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Foto Tamu" className="w-auto h-full object-cover rounded-lg" />
                            ) : (
                                <CameraIcon className="w-24 h-24 text-muted-foreground"/>
                            )}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <button onClick={handleTakePhoto} className="btn btn-primary inline-flex items-center">
                                <CameraIcon className="-ml-1 mr-2 h-5 w-5" />
                                {formData.photoUrl ? 'Ambil Ulang Foto' : 'Ambil Foto'}
                            </button>
                        </div>
                    </div>
                );
            case 4: // Visit Details
                return (
                     <div>
                        <h3 className="text-lg font-medium leading-6">Detail Kunjungan</h3>
                        <div className="mt-4 space-y-6">
                            <div>
                                <label>Jenis Tujuan</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center"><input type="radio" name="visitType" value="host" checked={formData.visitType === 'host'} onChange={() => setFormData(p => ({ ...p, visitType: 'host' }))} className="mr-2" /> Bertemu Seseorang</label>
                                    <label className="flex items-center"><input type="radio" name="visitType" value="destination" checked={formData.visitType === 'destination'} onChange={() => setFormData(p => ({ ...p, visitType: 'destination' }))} className="mr-2" /> Mengunjungi Unit/Lokasi</label>
                                </div>
                            </div>
                            {formData.visitType === 'host' ? (
                                <div className="relative">
                                    <label htmlFor="hostName">Host yang Dituju</label>
                                    <input type="text" name="hostName" id="hostName" value={formData.hostName} onChange={handleHostChange} autoComplete="off"/>
                                    {hostSuggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-card border border-border rounded-md mt-1 max-h-40 overflow-y-auto">
                                            {hostSuggestions.map(host => (
                                                <li key={host.id} onClick={() => handleSelectHost(host)} className="px-3 py-2 cursor-pointer hover:bg-secondary">
                                                    <p className="font-medium">{host.name}</p>
                                                    <p className="text-sm text-muted-foreground">{host.department}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="destination">Tujuan Unit/Lokasi</label>
                                    <input type="text" name="destination" id="destination" value={formData.destination} onChange={(e) => setFormData(p => ({...p, destination: e.target.value}))} placeholder="Contoh: Perpustakaan"/>
                                </div>
                            )}
                             <div>
                                <label htmlFor="purpose">Tujuan Kunjungan</label>
                                <select id="purpose" name="purpose" value={formData.purpose} onChange={e => setFormData(p => ({...p, purpose: e.target.value}))}>
                                    <option>Rapat</option>
                                    <option>Vendor</option>
                                    <option>Tamu Undangan</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 5: // e-Signature
                return (
                    <div>
                        <h3 className="text-lg font-medium leading-6">Tanda Tangan Elektronik</h3>
                        <div className="mt-2 p-2 bg-secondary rounded-lg text-sm text-muted-foreground">
                            <p>Dengan menandatangani di bawah ini, Anda menyetujui Tata Tertib Kunjungan dan Kebijakan Privasi Universitas Hamzanwadi.</p>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <SignatureCanvas onSignatureEnd={(sig) => setFormData(p => ({...p, signatureDataUrl: sig}))} width={450} height={200} />
                        </div>
                    </div>
                );
             case 6: // Confirmation
                return (
                    <div className="text-center py-8">
                         <SuccessLottie />
                         <h3 className="mt-4 text-xl font-medium">Check-in Berhasil!</h3>
                         <p className="mt-2 text-muted-foreground">
                           Tamu <span className="font-bold text-foreground">{formData.visitor.fullName}</span> telah berhasil didaftarkan.
                         </p>
                         <p className="text-muted-foreground">Notifikasi telah dikirimkan ke tujuan.</p>
                         <div className="mt-6">
                             <button type="button" onClick={handleClose} className="w-full btn btn-primary">
                                Selesai
                             </button>
                         </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const isNextDisabled = () => {
        switch(step) {
            case 1: return !formData.consent;
            case 2: return !formData.visitor.fullName || !formData.visitor.company;
            case 3: return !formData.photoUrl;
            case 4: 
                const isHostValid = formData.visitType === 'host' && hosts.some(h => h.name === formData.hostName);
                const isDestinationValid = formData.visitType === 'destination' && formData.destination.trim() !== '';
                return !(isHostValid || isDestinationValid);
            case 5: return !formData.signatureDataUrl;
            default: return false;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={step < 6}>
            <div className="p-6">
                { step < 6 && <h2 className="text-xl font-semibold">Check-in Tamu Walk-In (Langkah {step} dari 5)</h2> }
                <div className="mt-4">
                   {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                   {renderStepContent()}
                </div>
            </div>

            { step < 6 && (
            <div className="bg-secondary px-6 py-4 flex justify-between items-center rounded-b-lg">
                {step > 1 ? (
                    <button type="button" onClick={handleBack} className="btn btn-secondary">
                        Kembali
                    </button>
                ) : <div/>}

                {step < 5 ? (
                    <button type="button" onClick={handleNext} disabled={isNextDisabled()} className="btn btn-primary disabled:bg-gray-400">
                        Lanjut
                    </button>
                ) : (
                     <button type="button" onClick={handleSubmit} disabled={isNextDisabled()} className="btn btn-primary disabled:bg-gray-400">
                        Selesaikan Check-in
                    </button>
                )}
            </div>
            )}
        </Modal>
    );
};

export default ManualCheckinModal;

import React, { useState, useEffect } from 'react';
import { ManagementMeeting } from '../types';
import Modal from './Modal';
import SignatureCanvas from './SignatureCanvas';

// --- INLINE ICONS ---
const ScanIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
);
const PenIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const KeyboardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M6 12h.001"/><path d="M10 12h.001"/><path d="M14 12h.001"/><path d="M18 12h.001"/><path d="M7 16h10"/></svg>
);

interface MeetingAttendanceModalProps {
  meeting: ManagementMeeting;
  onClose: () => void;
  onMarkAttendance: (meetingId: string, memberId: string, signatureDataUrl: string) => { success: boolean, memberName?: string, message?: string };
}

const MeetingAttendanceModal: React.FC<MeetingAttendanceModalProps> = ({ meeting, onClose, onMarkAttendance }) => {
  const [step, setStep] = useState<'scan' | 'sign' | 'success'>('scan');
  const [manualId, setManualId] = useState('');
  const [scannedMemberId, setScannedMemberId] = useState<string | null>(null);
  const [scannedMemberName, setScannedMemberName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const meetingDate = new Date(meeting.date);

  // Initialize HTML5 QR Scanner
  useEffect(() => {
      if (step === 'scan') {
          const onScanSuccess = (decodedText: string, decodedResult: any) => {
              handleIdentifyMember(decodedText);
          };

          if (!(window as any).Html5QrcodeScanner) {
              console.error("Html5QrcodeScanner library not found");
              return;
          }

          const html5QrcodeScanner = new (window as any).Html5QrcodeScanner(
              "reader",
              { fps: 10, qrbox: { width: 250, height: 250 } },
              false
          );
          
          html5QrcodeScanner.render(onScanSuccess, () => {});

          return () => {
              html5QrcodeScanner.clear().catch((error: any) => console.error("Failed to clear scanner", error));
          };
      }
  }, [step]);

  const handleIdentifyMember = (memberId: string) => {
      setScannedMemberId(memberId);
      setStep('sign');
      setErrorMessage('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!manualId) return;
    handleIdentifyMember(manualId);
  };

  const simulateScan = (memberId: string) => handleIdentifyMember(memberId);

  const handleSignatureComplete = (signatureData: string) => {
      if (!scannedMemberId || !signatureData) return;

      const result = onMarkAttendance(meeting.id, scannedMemberId, signatureData);
      if (result.success) {
          setScannedMemberName(result.memberName || 'Anggota');
          setStep('success');
      } else {
          setErrorMessage(result.message || 'Gagal menyimpan absensi.');
          setStep('scan');
      }
  };

  const resetProcess = () => {
      setStep('scan');
      setManualId('');
      setScannedMemberId(null);
      setScannedMemberName('');
      setErrorMessage('');
  };

  // --- STYLES FOR SCANNER ANIMATION ---
  const styles = `
    @keyframes scanline {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .scan-line {
      position: absolute;
      left: 0;
      width: 100%;
      height: 4px;
      background: #10b981;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.8);
      animation: scanline 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      z-index: 10;
    }
    .reader-container video {
        object-fit: cover;
        border-radius: 1rem;
    }
  `;

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-5xl">
        <style>{styles}</style>
        
        {/* Main Card */}
        <div className="h-[85vh] flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden relative">
            
            {/* Header: Compact & Informative */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm shrink-0">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-1">{meeting.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {meetingDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {meeting.location}
                        </span>
                    </div>
                </div>
                
                {/* Steps Indicator */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${step === 'scan' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-400'}`}>1. Scan</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${step === 'sign' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-400'}`}>2. Tanda Tangan</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${step === 'success' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-400'}`}>3. Selesai</div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-grow relative flex overflow-hidden">
                
                {/* 1. STEP: SCAN */}
                {step === 'scan' && (
                    <div className="w-full h-full flex flex-col md:flex-row p-6 gap-6 animate-in fade-in">
                        {/* Left: Camera Feed */}
                        <div className="flex-1 relative bg-black rounded-3xl overflow-hidden shadow-inner border border-gray-800 group">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                <p className="text-gray-500 animate-pulse text-sm">Menunggu izin kamera...</p>
                            </div>
                            
                            {/* Scanner Logic */}
                            <div id="reader" className="reader-container w-full h-full relative z-10"></div>
                            
                            {/* Overlay UI */}
                            <div className="scan-line pointer-events-none"></div>
                            <div className="absolute inset-0 border-[40px] border-black/50 z-20 pointer-events-none"></div>
                            <div className="absolute top-6 left-0 w-full text-center z-30 pointer-events-none">
                                <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                                    Arahkan QR Code ke dalam kotak
                                </span>
                            </div>

                            {errorMessage && (
                                <div className="absolute bottom-4 left-4 right-4 z-40">
                                    <div className="bg-red-500/90 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-md text-center">
                                        {errorMessage}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Manual Inputs */}
                        <div className="w-full md:w-80 flex flex-col gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <KeyboardIcon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm">Input Manual</h3>
                                </div>
                                <form onSubmit={handleManualSubmit}>
                                    <input 
                                        type="text" 
                                        placeholder="Ketik NIDN..." 
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                        value={manualId}
                                        onChange={e => setManualId(e.target.value)}
                                    />
                                    <button type="submit" className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                        Lanjut
                                    </button>
                                </form>
                            </div>

                            <div className="flex-grow bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 overflow-y-auto">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Simulasi Cepat</h3>
                                <div className="space-y-2">
                                    <button onClick={() => simulateScan('mem1')} className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/30 dark:hover:bg-gray-700 text-left transition-colors flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><UserIcon className="w-4 h-4"/></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Rektor</p>
                                            <p className="text-[10px] text-gray-500">NIDN: 123456</p>
                                        </div>
                                    </button>
                                    <button onClick={() => simulateScan('mem2')} className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/30 dark:hover:bg-gray-700 text-left transition-colors flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform"><UserIcon className="w-4 h-4"/></div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Wakil Rektor</p>
                                            <p className="text-[10px] text-gray-500">NIDN: 654321</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            <button onClick={onClose} className="py-3 text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                Batalkan Absensi
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. STEP: SIGN */}
                {step === 'sign' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                            <PenIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tanda Tangan Digital</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">Silakan bubuhkan tanda tangan Anda pada area di bawah ini sebagai konfirmasi kehadiran.</p>
                        
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                                <SignatureCanvas 
                                    onSignatureEnd={handleSignatureComplete} 
                                    width={600} 
                                    height={320} 
                                />
                                <div className="absolute bottom-3 left-0 w-full text-center pointer-events-none">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Area Tanda Tangan</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setStep('scan')} className="mt-8 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2">
                            <span>&larr;</span> Kembali Scan
                        </button>
                    </div>
                )}

                {/* 3. STEP: SUCCESS */}
                {step === 'success' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-bottom-10 duration-500">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                                <CheckIcon className="w-16 h-16 text-green-500" />
                            </div>
                        </div>
                        
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Terima Kasih!</h3>
                        
                        <div className="mt-6 mb-8 bg-gray-50 dark:bg-gray-800/50 px-8 py-6 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-sm w-full">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Selamat Datang</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1">{scannedMemberName}</p>
                            <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-4"></div>
                            <p className="text-xs text-gray-500">Absensi Anda telah tercatat pada {new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                        
                        <button onClick={resetProcess} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-8 rounded-xl shadow-xl hover:scale-105 transition-transform active:scale-95">
                            Lanjut Scan Berikutnya
                        </button>
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default MeetingAttendanceModal;
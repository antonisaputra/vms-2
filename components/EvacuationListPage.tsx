
import React, { useState } from 'react';
import { Visit } from '../types';
import Modal from './Modal';

interface EvacuationListPageProps {
    onSiteVisits: Visit[];
    onClose: () => void;
}

const EvacuationListPage: React.FC<EvacuationListPageProps> = ({ onSiteVisits, onClose }) => {
    const [safeList, setSafeList] = useState<Set<string>>(new Set());

    const toggleSafeStatus = (visitId: string) => {
        setSafeList(prev => {
            const newList = new Set(prev);
            if (newList.has(visitId)) {
                newList.delete(visitId);
            } else {
                newList.add(visitId);
            }
            return newList;
        });
    };

    const notYetAccountedFor = onSiteVisits.filter(v => !safeList.has(v.id));
    const accountedFor = onSiteVisits.filter(v => safeList.has(v.id));

    return (
        <Modal isOpen={true} onClose={onClose} maxWidth="max-w-7xl">
            <div className="p-4 sm:p-6 lg:p-8 bg-card">
                <div className="flex justify-between items-center pb-4 border-b-2 border-destructive">
                    <div>
                        <h1 className="text-3xl font-extrabold text-destructive">DAFTAR EVAKUASI DARURAT</h1>
                        <p className="text-muted-foreground">Daftar real-time semua tamu yang masih berada di dalam gedung.</p>
                    </div>
                    <button onClick={onClose} className="btn btn-secondary">
                        Tutup
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-between bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-md">
                    <div className="font-bold text-lg">
                        Total On-Site: {onSiteVisits.length} | Selamat: {safeList.size} | Belum Ditemukan: {onSiteVisits.length - safeList.size}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-hidden">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold mb-4 shrink-0">Belum Ditemukan ({notYetAccountedFor.length})</h2>
                        <div className="space-y-3 overflow-y-auto pr-2">
                            {notYetAccountedFor.map(visit => (
                                <div key={visit.id} className="bg-secondary p-4 rounded-lg border border-border flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img src={visit.visitor.photoUrl} alt={visit.visitor.fullName} className="w-16 h-16 rounded-md object-cover"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-lg">{visit.visitor.fullName}</p>
                                            <p className="text-muted-foreground">Tujuan: {visit.host ? visit.host.name : visit.destination}</p>
                                            <p className="text-sm text-muted-foreground">Check-in: {visit.checkInTime.toLocaleTimeString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSafeStatus(visit.id)} className="px-3 py-1.5 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 text-sm shrink-0">
                                        Tandai Selamat
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold mb-4 shrink-0">Telah Ditemukan ({accountedFor.length})</h2>
                        <div className="space-y-3 overflow-y-auto pr-2">
                            {accountedFor.map(visit => (
                                <div key={visit.id} className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center justify-between opacity-70">
                                    <div className="flex items-center">
                                        <img src={visit.visitor.photoUrl} alt={visit.visitor.fullName} className="w-12 h-12 rounded-md object-cover"/>
                                        <div className="ml-4">
                                            <p className="font-semibold line-through">{visit.visitor.fullName}</p>
                                            <p className="text-sm text-muted-foreground">Tujuan: {visit.host ? visit.host.name : visit.destination}</p>
                                        </div>
                                    </div>
                                     <button onClick={() => toggleSafeStatus(visit.id)} className="px-3 py-1.5 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 text-sm shrink-0">
                                        Batal
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EvacuationListPage;

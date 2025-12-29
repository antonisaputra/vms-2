
import React from 'react';
import { ManagementMember } from '../types';
import Modal from './Modal';
import Logo from './Logo';

interface NametagModalProps {
  members: ManagementMember[];
  onClose: () => void;
}

const NametagModal: React.FC<NametagModalProps> = ({ members, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center text-card-foreground no-print">Pratinjau Nametag ({members.length})</h2>
        <p className="text-center text-muted-foreground text-sm no-print">Siap untuk dicetak. Gunakan kertas A4 untuk hasil terbaik.</p>
        
        <div id="nametag-batch-print" className="printable-area mx-auto mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 justify-items-center">
                {members.map(member => (
                    <div key={member.id} className="w-[350px] h-[550px] border-2 border-gray-300 bg-white rounded-xl shadow-xl overflow-hidden relative flex flex-col mb-4 break-inside-avoid page-break-inside-avoid">
                        {/* Header */}
                        <div className="bg-green-700 p-4 text-center text-white flex flex-col items-center justify-center h-32">
                            <Logo className="scale-75 text-white fill-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-grow flex flex-col items-center p-4 text-center text-gray-900">
                            <div className="relative -mt-16 mb-4">
                                <img 
                                    src={member.photoUrl} 
                                    alt={member.fullName}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-200"
                                />
                            </div>

                            <h3 className="text-xl font-bold leading-tight mb-1">{member.fullName}</h3>
                            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">{member.position}</p>
                            
                            <div className="mt-4 text-sm space-y-1 text-gray-600">
                                <p><span className="font-bold">NIDN:</span> {member.nidn}</p>
                                <p>{member.studyProgram}</p>
                                <p className="text-xs">{member.faculty}</p>
                            </div>

                            <div className="mt-auto mb-4">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${member.id}`}
                                    alt="QR Code"
                                    className="rounded-lg border border-gray-200 p-1"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Scan untuk Absensi</p>
                            </div>
                        </div>
                        
                        {/* Footer Strip */}
                        <div className="bg-green-800 h-4 w-full"></div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-2 no-print">
          <button onClick={handlePrint} className="w-full btn btn-primary">
            Cetak Semua
          </button>
          <button onClick={onClose} className="w-full btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NametagModal;

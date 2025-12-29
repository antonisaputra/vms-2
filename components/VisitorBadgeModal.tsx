

import React from 'react';
import { Visit } from '../types';
import Modal from './Modal';
import Logo from './Logo';

interface VisitorBadgeModalProps {
  visit: Visit;
  onClose: () => void;
}

const VisitorBadgeModal: React.FC<VisitorBadgeModalProps> = ({ visit, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center text-card-foreground">Pratinjau Badge Pengunjung</h2>
        <p className="text-center text-muted-foreground text-sm">Badge siap untuk dicetak.</p>
        
        <div id="badge-to-print" className="printable-area mx-auto mt-6">
            <div className="w-[300px] h-[450px] border border-border bg-card rounded-xl shadow-lg p-4 flex flex-col items-center text-center mx-auto">
                <Logo className="h-16 justify-center scale-90" />
                <div className="w-full border-b-4 border-primary my-2"></div>
                
                <img 
                    src={visit.visitor.photoUrl} 
                    alt={visit.visitor.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-secondary mt-4"
                />

                <h3 className="mt-4 text-2xl font-bold text-foreground">{visit.visitor.fullName}</h3>
                <p className="text-md text-muted-foreground">{visit.visitor.company}</p>

                <div className="mt-4 text-left w-full text-sm space-y-2">
                    <p><span className="font-semibold">{visit.host ? 'Host:' : 'Tujuan:'}</span> {visit.host ? visit.host.name : visit.destination}</p>
                    <p><span className="font-semibold">Maksud:</span> {visit.purpose}</p>
                    <p><span className="font-semibold">Berlaku Hingga:</span> {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>
                
                <div className="mt-auto flex flex-col items-center">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${visit.checkinCode}`}
                        alt="QR Code Check-out"
                        className="rounded-md"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Pindai untuk Check-out</p>
                </div>
            </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-2 no-print">
          <button onClick={handlePrint} className="w-full btn btn-primary">
            Cetak Badge
          </button>
          <button onClick={onClose} className="w-full btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VisitorBadgeModal;

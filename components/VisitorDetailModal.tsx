

import React, { useState } from 'react';
import { Visit } from '../types';
import SignedDocumentModal from './SignedDocumentModal';
import Modal from './Modal';
import { FileCheckIcon } from './icons';

interface VisitorDetailModalProps {
  visit: Visit;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-md">{value || '-'}</p>
    </div>
);

const VisitorDetailModal: React.FC<VisitorDetailModalProps> = ({ visit, onClose }) => {
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);

  return (
    <>
      <Modal isOpen={true} onClose={onClose} maxWidth="max-w-3xl">
        <div className="p-6 bg-secondary">
            <h2 className="text-xl font-semibold">Detail Kunjungan</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-card">
            {/* Left Column: Photo & Signature */}
            <div className="md:col-span-1 flex flex-col items-center space-y-6">
                <div className="text-center">
                    <img src={visit.visitor.photoUrl} alt={visit.visitor.fullName} className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-card shadow-lg" />
                    <h3 className="mt-4 text-xl font-bold">{visit.visitor.fullName}</h3>
                    <p className="text-muted-foreground">{visit.visitor.company}</p>
                </div>
                <div className="w-full text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tanda Tangan Elektronik</p>
                    <div className="bg-secondary border rounded-md p-2 flex justify-center items-center h-32">
                        {visit.signatureDataUrl ? (
                            <img src={visit.signatureDataUrl} alt="Tanda Tangan" className="max-w-full max-h-full" />
                        ) : (
                            <p className="text-muted-foreground text-sm">Tidak ada tanda tangan.</p>
                        )}
                    </div>
                    {visit.signatureDataUrl && (
                        <button 
                          onClick={() => setDocumentModalOpen(true)}
                          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          <FileCheckIcon className="w-4 h-4 mr-2"/>
                          Lihat Dokumen yang Ditandatangani
                        </button>
                    )}
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="md:col-span-2 grid grid-cols-2 gap-x-8 gap-y-6">
                 <h4 className="col-span-2 text-lg font-semibold border-b border-border pb-2">Informasi Tamu</h4>
                 <DetailRow label="Email" value={visit.visitor.email} />
                 <DetailRow label="No. Telepon" value={visit.visitor.phone} />
                 <div />

                 <h4 className="col-span-2 text-lg font-semibold border-b border-border pb-2 mt-4">Informasi Kunjungan</h4>
                 <DetailRow label={visit.host ? "Host yang Dituju" : "Tujuan Unit/Lokasi"} value={visit.host ? visit.host.name : visit.destination} />
                 <DetailRow label={visit.host ? "Departemen Host" : ""} value={visit.host ? visit.host.department : ""} />
                 <DetailRow label="Maksud Kunjungan" value={visit.purpose} />
                 <DetailRow label="Status" value={visit.status} />
                 <DetailRow label="Waktu Check-in" value={visit.checkInTime.toLocaleString('id-ID')} />
                 <DetailRow label="Waktu Check-out" value={visit.checkOutTime?.toLocaleString('id-ID')} />
                 <DetailRow label="Kode Check-in" value={visit.checkinCode} />
            </div>
        </div>
      </Modal>

      {isDocumentModalOpen && (
        <SignedDocumentModal visit={visit} onClose={() => setDocumentModalOpen(false)} />
      )}
    </>
  );
};

export default VisitorDetailModal;

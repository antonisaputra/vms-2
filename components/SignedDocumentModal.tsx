

import React from 'react';
import { Visit } from '../types';
import Modal from './Modal';

interface SignedDocumentModalProps {
  visit: Visit;
  onClose: () => void;
}

const SignedDocumentModal: React.FC<SignedDocumentModalProps> = ({ visit, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-2xl">
        <div className="p-4 bg-secondary border-b border-border">
          <h2 className="text-lg font-semibold">Dokumen yang Ditandatangani</h2>
        </div>
        <div className="p-8 bg-card max-h-[70vh] overflow-y-auto">
          <h3 className="text-xl text-center font-bold">Persetujuan Tata Tertib Kunjungan</h3>
          <p className="text-center text-sm text-muted-foreground">Universitas Hamzanwadi</p>
          
          <div className="mt-8 border-t border-b border-border py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Nama Tamu:</p>
                <p>{visit.visitor.fullName}</p>
              </div>
              <div>
                <p className="font-semibold">Perusahaan/Instansi:</p>
                <p>{visit.visitor.company}</p>
              </div>
              <div>
                <p className="font-semibold">{visit.host ? 'Host yang Dituju:' : 'Tujuan Unit/Lokasi:'}</p>
                <p>{visit.host ? visit.host.name : visit.destination}</p>
              </div>
               <div>
                <p className="font-semibold">Waktu Penandatanganan:</p>
                <p>{visit.checkInTime.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm space-y-4">
            <p>
              Saya, yang data dirinya tercantum di atas, dengan ini menyatakan telah membaca, memahami, dan setuju untuk mematuhi seluruh tata tertib dan peraturan yang berlaku di lingkungan Universitas Hamzanwadi selama kunjungan saya.
            </p>
            <p>
              Saya juga mengonfirmasi bahwa saya telah memberikan persetujuan untuk pemrosesan data pribadi saya sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) yang berlaku, untuk tujuan keamanan dan administrasi kunjungan.
            </p>
          </div>

          <div className="mt-12">
            <p className="text-sm text-muted-foreground">Ditandatangani secara elektronik oleh:</p>
            <div className="mt-4 flex justify-start">
                {visit.signatureDataUrl && (
                    <img src={visit.signatureDataUrl} alt="Tanda Tangan Tamu" className="h-24 w-auto border-b-2 border-muted-foreground pb-1" />
                )}
            </div>
            <p className="mt-2 font-semibold">{visit.visitor.fullName}</p>
          </div>
        </div>
    </Modal>
  );
};

export default SignedDocumentModal;

import React, { useState } from 'react';
import Modal from './Modal';
import { PreregistrationDraft } from '../types';
import { MailIcon } from './icons';

interface InviteGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (draft: PreregistrationDraft) => void;
}

const InviteGuestModal: React.FC<InviteGuestModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [guestEmail, setGuestEmail] = useState('');
  const [meetingDetails, setMeetingDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail || !meetingDetails) return;
    onInvite({ guestEmail, meetingDetails });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
                <MailIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Undang Tamu</h2>
        </div>
        <p className="mt-2 text-muted-foreground">
            Sistem akan membuat pra-registrasi dan mengirimkan email undangan (simulasi) kepada tamu.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="guestEmail">Email Tamu</label>
            <input 
              type="email" 
              id="guestEmail" 
              value={guestEmail} 
              onChange={e => setGuestEmail(e.target.value)} 
              placeholder="contoh@perusahaan.com"
              required 
            />
          </div>
          <div>
            <label htmlFor="meetingDetails">Detail/Tujuan Pertemuan</label>
            <textarea 
              id="meetingDetails" 
              rows={3} 
              value={meetingDetails} 
              onChange={e => setMeetingDetails(e.target.value)} 
              placeholder="Contoh: Rapat Proyek Sinergi"
              required
            ></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Kirim Undangan
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default InviteGuestModal;

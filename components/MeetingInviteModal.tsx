import React, { useState, useMemo } from 'react';
import { ManagementMember, ManagementMeeting } from '../types';
import Modal from './Modal';
import { SearchIcon, MailIcon, CheckCircleIcon } from './icons';

interface MeetingInviteModalProps {
  meeting: ManagementMeeting;
  members: ManagementMember[];
  onClose: () => void;
  onInvite: (meetingId: string, memberIds: string[]) => void;
}

const MeetingInviteModal: React.FC<MeetingInviteModalProps> = ({ meeting, members, onClose, onInvite }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // Compute unique faculties for Quick Filters
  const faculties = useMemo(() => {
      const unique = new Set(members.map(m => m.faculty).filter(Boolean));
      return Array.from(unique).sort();
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(filteredMembers.map(m => m.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectByFaculty = (faculty: string) => {
      const facultyMembers = members.filter(m => m.faculty === faculty);
      const newSelected = new Set(selectedIds);
      facultyMembers.forEach(m => newSelected.add(m.id));
      setSelectedIds(newSelected);
  };

  const handleSendInvites = () => {
    if (selectedIds.size === 0) return;
    
    setIsSending(true);
    
    // Simulate API delay
    setTimeout(() => {
      onInvite(meeting.id, Array.from(selectedIds));
      setIsSending(false);
      setSuccess(true);
      
      // Auto close after success message
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Undangan Terkirim!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Undangan rapat telah berhasil dikirimkan (simulasi) ke {selectedIds.size} anggota manajemen.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex flex-col h-[85vh] max-h-[700px]">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card rounded-t-lg">
          <h2 className="text-xl font-bold text-card-foreground">Undang Peserta Rapat</h2>
          <p className="text-sm text-muted-foreground mt-1">Rapat: {meeting.title}</p>
        </div>

        {/* Search & Controls */}
        <div className="p-4 bg-secondary/30 border-b border-border">
          <div className="relative group mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-xl leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground/70 focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm transition-all duration-200 shadow-sm"
              placeholder="Cari nama, fakultas, atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
           {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center mr-1">Filter Cepat:</span>
            {faculties.map(fac => (
                <button 
                    key={fac}
                    onClick={() => handleSelectByFaculty(fac)}
                    className="px-2 py-1 bg-card border border-border rounded text-xs text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                >
                    + {fac}
                </button>
            ))}
          </div>

          <div className="mt-2 flex justify-between items-center">
            <button 
              onClick={handleSelectAll}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {selectedIds.size === filteredMembers.length && filteredMembers.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua Hasil Pencarian'}
            </button>
            <span className="text-sm text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded">
              {selectedIds.size} dipilih
            </span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-card">
          {filteredMembers.length > 0 ? (
            <div className="space-y-2">
              {filteredMembers.map(member => (
                <div 
                  key={member.id} 
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedIds.has(member.id) 
                      ? 'bg-primary/5 border-primary/30 shadow-sm' 
                      : 'bg-card border-border hover:bg-secondary'
                  }`}
                  onClick={() => handleToggleSelect(member.id)}
                >
                  <div className="flex-shrink-0 h-5 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(member.id)}
                      onChange={() => {}} // Handled by parent div click
                      className="focus:ring-primary h-4 w-4 text-primary border-border rounded pointer-events-none"
                    />
                  </div>
                  <div className="ml-3 flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover border border-border bg-secondary" src={member.photoUrl} alt="" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-card-foreground">{member.fullName}</p>
                      <p className="text-xs text-muted-foreground">{member.position} &bull; {member.faculty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Tidak ada anggota yang cocok dengan pencarian.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSending}
          >
            Batal
          </button>
          <button
            onClick={handleSendInvites}
            className="btn btn-primary flex items-center"
            disabled={selectedIds.size === 0 || isSending}
          >
            {isSending ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Mengirim...
              </>
            ) : (
              <>
                <MailIcon className="w-4 h-4 mr-2" />
                Kirim Undangan ({selectedIds.size})
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MeetingInviteModal;

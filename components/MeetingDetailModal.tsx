import React, { useState } from 'react';
import { ManagementMeeting, ManagementMember } from '../types';
import Modal from './Modal';
import Logo from './Logo';
import { DownloadIcon, Edit2Icon, Trash2Icon } from './icons';

interface MeetingDetailModalProps {
  meeting: ManagementMeeting;
  members: ManagementMember[]; 
  onClose: () => void;
  onUpdateMeeting?: (id: string, data: Partial<ManagementMeeting>) => void;
  onRemoveAttendance?: (meetingId: string, memberId: string) => void;
}

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ meeting, members, onClose, onUpdateMeeting, onRemoveAttendance }) => {
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [minutesText, setMinutesText] = useState(meeting.minutes || '');

  // --- FIX: Konversi String ke Date Object ---
  const meetingDate = new Date(meeting.date);

  const getMemberDetails = (memberId: string) => {
      return members.find(m => m.id === memberId);
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveMinutes = () => {
      if (onUpdateMeeting) {
          onUpdateMeeting(meeting.id, { minutes: minutesText });
      }
      setIsEditingMinutes(false);
  };

  const handleDeleteAttendance = (memberId: string, memberName: string) => {
      if (window.confirm(`Hapus kehadiran untuk ${memberName}?`)) {
          if (onRemoveAttendance) {
              onRemoveAttendance(meeting.id, memberId);
          }
      }
  };

  // Export to CSV for Excel
  const handleExportCSV = () => {
    const headers = ["No,NIDN,Nama Lengkap,Jabatan,Fakultas,Status,Waktu Hadir"];
    const rows = meeting.attendees.map((att, index) => {
        const member = getMemberDetails(att.memberId);
        if (!member) return "";
        const status = meeting.invitedMemberIds.includes(att.memberId) ? "Diundang" : "Walk-in";
        
        // FIX: Pastikan checkInTime juga dikonversi ke Date
        const checkInTime = new Date(att.checkInTime);
        
        return `${index + 1},"${member.nidn}","${member.fullName}","${member.position}","${member.faculty}","${status}","${checkInTime.toLocaleString('id-ID')}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daftar_Hadir_${meeting.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-5xl">
      <div className="p-6 max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        
        {/* Header Controls (Hidden on Print) */}
        <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-xl font-bold">Laporan Kehadiran & Notulensi</h2>
            <div className="flex gap-2">
                 <button onClick={handleExportCSV} className="btn btn-secondary">
                    <DownloadIcon className="w-4 h-4 mr-2"/> Excel/CSV
                </button>
                <button onClick={handlePrint} className="btn btn-primary">
                    Cetak Laporan (PDF)
                </button>
                <button onClick={onClose} className="btn btn-secondary">
                    Tutup
                </button>
            </div>
        </div>

        {/* Printable Area - MUST remain white in dark mode for "Paper" simulation */}
        <div className="printable-area bg-white text-gray-900 p-8 border border-gray-200 rounded-lg shadow-sm mx-auto">
            
            {/* Letterhead / Kop Surat Simulation */}
            <div className="flex items-center border-b-2 border-black pb-4 mb-6">
                <Logo className="h-16 w-16 text-black fill-black mr-4" />
                <div className="text-left text-black">
                    <h1 className="text-2xl font-bold uppercase text-black">Universitas Hamzanwadi</h1>
                    <p className="text-sm text-black">Jl. Prof. M. Yamin No.35, Pancor, Kec. Selong, Kabupaten Lombok Timur, Nusa Tenggara Bar. 83611</p>
                    <p className="text-sm text-black">Website: hamzanwadi.ac.id | Email: info@hamzanwadi.ac.id</p>
                </div>
            </div>

            <div className="text-center mb-8 text-black">
                <h2 className="text-xl font-bold uppercase underline">BERITA ACARA RAPAT</h2>
            </div>

            {/* Meeting Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-black">
                <div>
                    <p><span className="font-bold w-32 inline-block">Nama Kegiatan</span>: {meeting.title}</p>
                    <p><span className="font-bold w-32 inline-block">Hari, Tanggal</span>: {meetingDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p><span className="font-bold w-32 inline-block">Waktu</span>: {meetingDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA</p>
                </div>
                <div>
                     <p><span className="font-bold w-32 inline-block">Tempat</span>: {meeting.location}</p>
                     <p><span className="font-bold w-32 inline-block">Jumlah Hadir</span>: {meeting.attendees.length} Orang</p>
                </div>
            </div>

            {/* Attendance Table */}
            <h3 className="text-lg font-bold uppercase mb-2 text-black">I. Daftar Hadir</h3>
            <table className="w-full border-collapse border border-black text-sm mb-8 text-black">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 w-10 text-center font-bold">No</th>
                        <th className="border border-black p-2 text-left font-bold">Nama Lengkap & NIDN</th>
                        <th className="border border-black p-2 text-left font-bold">Jabatan / Fakultas</th>
                        <th className="border border-black p-2 w-24 text-center font-bold">Status</th>
                        <th className="border border-black p-2 w-28 text-center font-bold">Waktu Hadir</th>
                        <th className="border border-black p-2 w-32 text-center font-bold">Tanda Tangan</th>
                        {/* Action column hidden on print */}
                        <th className="border border-black p-2 w-10 text-center font-bold no-print">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {meeting.attendees.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="border border-black p-8 text-center italic text-gray-500">
                                Belum ada peserta yang hadir.
                            </td>
                        </tr>
                    ) : (
                        meeting.attendees.map((att, index) => {
                            const member = getMemberDetails(att.memberId);
                            const isInvited = meeting.invitedMemberIds.includes(att.memberId);
                            // FIX: Konversi checkInTime ke Date
                            const checkInTime = new Date(att.checkInTime);

                            return (
                                <tr key={index}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2">
                                        <p className="font-bold">{member?.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-gray-600">{member?.nidn || '-'}</p>
                                    </td>
                                    <td className="border border-black p-2">
                                        <p>{member?.position}</p>
                                        <p className="text-xs text-gray-600">{member?.faculty}</p>
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        {isInvited ? (
                                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-green-200">Diundang</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-yellow-200">Walk-in</span>
                                        )}
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        {checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        {att.signatureDataUrl ? (
                                            <img src={att.signatureDataUrl} alt="TTD" className="h-10 mx-auto" />
                                        ) : (
                                            <span className="text-xs italic text-gray-400">Manual</span>
                                        )}
                                    </td>
                                    <td className="border border-black p-2 text-center no-print">
                                        <button 
                                            onClick={() => handleDeleteAttendance(att.memberId, member?.fullName || 'Anggota')}
                                            className="text-red-600 hover:text-red-800"
                                            title="Hapus Kehadiran"
                                        >
                                            <Trash2Icon className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Meeting Minutes / Notulensi */}
            <div className="mb-8 text-black">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold uppercase">II. Notulensi Rapat</h3>
                    {onUpdateMeeting && (
                        <button 
                            onClick={() => setIsEditingMinutes(!isEditingMinutes)} 
                            className="no-print text-sm text-blue-600 flex items-center hover:underline"
                        >
                            <Edit2Icon className="w-4 h-4 mr-1" />
                            {isEditingMinutes ? 'Batal Edit' : 'Edit Notulensi'}
                        </button>
                    )}
                </div>
                
                {isEditingMinutes ? (
                    <div className="no-print">
                        <textarea 
                            className="w-full p-4 border border-gray-300 rounded-md min-h-[200px] mb-2 bg-white text-black"
                            value={minutesText}
                            onChange={(e) => setMinutesText(e.target.value)}
                            placeholder="Tulis hasil pembahasan rapat di sini..."
                        />
                        <button onClick={handleSaveMinutes} className="btn btn-primary btn-sm">Simpan Notulensi</button>
                    </div>
                ) : (
                    <div className="border border-black min-h-[150px] p-4 text-sm whitespace-pre-wrap text-black">
                        {meeting.minutes || (
                            <span className="italic text-gray-400">Belum ada notulensi yang dicatat.</span>
                        )}
                    </div>
                )}
                {/* Hidden plain text for printing when editing mode is off */}
                 <div className="hidden print:block border border-black min-h-[150px] p-4 text-sm whitespace-pre-wrap text-black">
                    {meeting.minutes || "Belum ada notulensi."}
                </div>
            </div>

            {/* Footer Signature Area for Admin */}
            <div className="mt-12 flex justify-end text-black">
                <div className="text-center w-64">
                    <p>Pancor, {meetingDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="mb-16">Notulis / Sekretaris,</p>
                    <p className="font-bold underline">( ........................................... )</p>
                </div>
            </div>

        </div>
      </div>
    </Modal>
  );
};

export default MeetingDetailModal;
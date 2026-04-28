import React, { useState, useEffect } from 'react';
import { ManagementMeeting, ManagementMember } from '../types';
import Modal from './Modal';
import Logo from '../assets/logo.png';
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

    // --- KRUSIAL: Ini yang mereset isi form/tabel saat data di database berubah ---
    useEffect(() => {
        // Jika data 'meeting' dari props berubah (karena setManagementMeetings di context),
        // maka isi form 'minutesText' dipaksa mengikuti data terbaru.
        setMinutesText(meeting.minutes || '');
    }, [meeting.minutes]); // Memantau perubahan spesifik pada kolom minutes

    const handleSaveMinutes = async () => {
        if (onUpdateMeeting) {
            try {
                // Menunggu proses simpan selesai
                await onUpdateMeeting(meeting.id, { minutes: minutesText });
                // Matikan mode edit
                setIsEditingMinutes(false);
            } catch (error) {
                alert("Gagal menyimpan data.");
            }
        }
    };
    
    const meetingDate = new Date(meeting.date);

    const getMemberDetails = (memberId: string) => {
        return members.find(m => m.id === memberId);
    };

    const handlePrint = () => {
        window.print();
    };


    const handleDeleteAttendance = (memberId: string, memberName: string) => {
        if (window.confirm(`Hapus kehadiran untuk ${memberName}?`)) {
            if (onRemoveAttendance) {
                onRemoveAttendance(meeting.id, memberId);
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ["No,NIDN,Nama Lengkap,Jabatan,Fakultas,Status,Waktu Hadir"];
        const rows = meeting.attendees.map((att, index) => {
            const member = getMemberDetails(att.memberId);
            if (!member) return "";
            const status = meeting.invitedMemberIds.includes(att.memberId) ? "Diundang" : "Walk-in";
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

                {/* Header Controls */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Laporan Kehadiran & Notulensi</h2>
                    <div className="flex gap-2">
                        <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                            <DownloadIcon className="w-4 h-4" /> Excel/CSV
                        </button>
                        <button onClick={handlePrint} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                            Cetak Laporan (PDF)
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>

                <div className="printable-area bg-white text-gray-900 p-8 border border-gray-200 rounded-lg shadow-sm mx-auto">

                    {/* Kop Surat */}
                    <div className="flex items-center border-b-2 border-black pb-4 mb-6">
                        <img src={Logo} alt="Logo" className="h-16 w-16 mr-4" />
                        <div className="text-left text-black">
                            <h1 className="text-2xl font-bold uppercase">Universitas Hamzanwadi</h1>
                            <p className="text-sm">Jl. Prof. M. Yamin No.35, Pancor, Kec. Selong, Kabupaten Lombok Timur, Nusa Tenggara Bar. 83611</p>
                            <p className="text-sm">Website: hamzanwadi.ac.id | Email: info@hamzanwadi.ac.id</p>
                        </div>
                    </div>

                    <div className="text-center mb-8 text-black">
                        <h2 className="text-xl font-bold uppercase underline">BERITA ACARA RAPAT</h2>
                    </div>

                    {/* Detail Rapat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-black">
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
                                <th className="border border-black p-2 w-10 text-center font-bold no-print">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meeting.attendees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="border border-black p-8 text-center italic text-gray-500">Belum ada peserta yang hadir.</td>
                                </tr>
                            ) : (
                                meeting.attendees.map((att, index) => {
                                    const member = getMemberDetails(att.memberId);
                                    const isInvited = meeting.invitedMemberIds.includes(att.memberId);
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
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${isInvited ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                                                    {isInvited ? 'Diundang' : 'Walk-in'}
                                                </span>
                                            </td>
                                            <td className="border border-black p-2 text-center">{checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="border border-black p-2 text-center">
                                                {att.signatureDataUrl ? <img src={att.signatureDataUrl} alt="TTD" className="h-10 mx-auto" /> : <span className="text-xs italic text-gray-400">Manual</span>}
                                            </td>
                                            <td className="border border-black p-2 text-center no-print">
                                                <button onClick={() => handleDeleteAttendance(att.memberId, member?.fullName || 'Anggota')} className="text-red-600 hover:text-red-800 transition-colors">
                                                    <Trash2Icon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Bagian Notulensi Rapat */}
                    <div className="mb-8 text-black">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold uppercase">II. Notulensi Rapat</h3>
                            {onUpdateMeeting && (
                                <button onClick={() => setIsEditingMinutes(!isEditingMinutes)} className="no-print text-sm text-blue-600 flex items-center hover:underline font-semibold">
                                    <Edit2Icon className="w-4 h-4 mr-1" />
                                    {isEditingMinutes ? 'Batal Edit' : 'Edit Notulensi'}
                                </button>
                            )}
                        </div>

                        {isEditingMinutes ? (
                            <div className="no-print space-y-3">
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-xl min-h-[250px] bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                                    value={minutesText}
                                    onChange={(e) => setMinutesText(e.target.value)}
                                    placeholder="Tulis hasil pembahasan rapat di sini..."
                                />
                                <button onClick={handleSaveMinutes} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                                    Simpan Notulensi
                                </button>
                            </div>
                        ) : (
                            /* Tampilan teks notulensi setelah simpan */
                            <div className="border border-black min-h-[150px] p-4 text-sm whitespace-pre-wrap text-black bg-white">
                                {meeting.minutes || <span className="italic text-gray-400">Belum ada notulensi yang dicatat.</span>}
                            </div>
                        )}

                        {/* Area tersembunyi khusus untuk Cetak PDF agar format tetap rapi */}
                        <div className="hidden print:block border border-black min-h-[150px] p-4 text-sm whitespace-pre-wrap text-black">
                            {meeting.minutes || "Belum ada notulensi."}
                        </div>
                    </div>

                    {/* Footer Tanda Tangan */}
                    <div className="mt-12 flex justify-end text-black">
                        <div className="text-center w-64">
                            <p>Pancor, {meetingDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="mb-20">Notulis / Sekretaris,</p>
                            <p className="font-bold underline">( ........................................... )</p>
                        </div>
                    </div>

                </div>
            </div>
        </Modal>
    );
};

export default MeetingDetailModal;
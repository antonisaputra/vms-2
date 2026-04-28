import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ManagementMember, ManagementMeeting } from '../types';
import {
    UserPlusIcon, IdCardIcon, CalendarPlusIcon, CheckCircleIcon, UsersIcon,
    DownloadIcon, FileTextIcon, FileCheckIcon, MailIcon, AnalyticsIcon,
    Edit2Icon, Trash2Icon, SearchIcon, MonitorIcon, CopyIcon
} from './icons';
import Modal from './Modal';
import NametagModal from './NametagModal';
import { useData } from '../context/DataContext';

declare const Chart: any;

// --- INLINE ICONS ---
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-enter {
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
`;

interface ManagementPageProps {
    onOpenAttendance: (meeting: ManagementMeeting) => void;
    onOpenReport: (meeting: ManagementMeeting) => void;
    onOpenInvite: (meeting: ManagementMeeting) => void;
    onOpenLiveBoard: (meeting: ManagementMeeting) => void;
}

// --- MODAL COMPONENTS ---

const MemberModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (m: Omit<ManagementMember, 'id'>) => void, memberToEdit?: ManagementMember | null }> = ({ isOpen, onClose, onSave, memberToEdit }) => {
    const [formData, setFormData] = useState({
        nidn: '', fullName: '', faculty: '', studyProgram: '', position: '', phone: '', email: ''
    });

    useEffect(() => {
        if (memberToEdit) {
            setFormData({
                nidn: memberToEdit.nidn || '',
                fullName: memberToEdit.fullName || '',
                faculty: memberToEdit.faculty || '',
                studyProgram: memberToEdit.studyProgram || '',
                position: memberToEdit.position || '',
                phone: memberToEdit.phone || '',
                email: memberToEdit.email || ''
            });
        } else {
            setFormData({ nidn: '', fullName: '', faculty: '', studyProgram: '', position: '', phone: '', email: '' });
        }
    }, [memberToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, photoUrl: memberToEdit ? memberToEdit.photoUrl : `https://picsum.photos/seed/${formData.nidn}/200` });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className={`p-3 rounded-xl ${memberToEdit ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {memberToEdit ? <Edit2Icon className="w-6 h-6" /> : <UserPlusIcon className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{memberToEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
                        <p className="text-sm text-gray-500">Lengkapi data diri anggota manajemen.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 group">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nama Lengkap & Gelar</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" placeholder="Contoh: Dr. Budi Santoso, M.Kom" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">NIDN</label>
                        <input type="text" name="nidn" value={formData.nidn} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Jabatan</label>
                        <input type="text" name="position" value={formData.position} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Fakultas</label>
                        <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Program Studi</label>
                        <input type="text" name="studyProgram" value={formData.studyProgram} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Nomor HP</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                    </div>

                    <div className="md:col-span-2 pt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors">Batal</button>
                        <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
                            {memberToEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const MeetingModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (m: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => void, meetingToEdit?: ManagementMeeting | null }> = ({ isOpen, onClose, onSave, meetingToEdit }) => {
    const [formData, setFormData] = useState({ title: '', date: '', time: '', location: '' });

    useEffect(() => {
        if (meetingToEdit) {
            const d = new Date(meetingToEdit.date);
            const dateStr = d.toISOString().split('T')[0];
            const timeStr = d.toTimeString().substring(0, 5);
            setFormData({
                title: meetingToEdit.title || '',
                location: meetingToEdit.location || '',
                date: dateStr,
                time: timeStr
            });
        } else {
            setFormData({ title: '', date: '', time: '', location: '' });
        }
    }, [meetingToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dateTime = new Date(`${formData.date}T${formData.time}`);
        onSave({ title: formData.title, location: formData.location, date: dateTime });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className={`p-3 rounded-xl ${meetingToEdit ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                        <CalendarPlusIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{meetingToEdit ? 'Edit Agenda Rapat' : 'Buat Agenda Baru'}</h2>
                        <p className="text-sm text-gray-500">Jadwalkan pertemuan atau acara penting.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Judul Rapat</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="Contoh: Rapat Koordinasi Bulanan" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Tanggal</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Jam</label>
                            <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Lokasi</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 transition-all outline-none" placeholder="Contoh: Ruang Sidang Utama" />
                    </div>
                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors">Batal</button>
                        <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5">Simpan Agenda</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// --- ANALYTICS COMPONENT ---
const ManagementAnalytics: React.FC<{ members: ManagementMember[], meetings: ManagementMeeting[] }> = ({ members, meetings }) => {
    const attendanceChartRef = useRef<HTMLCanvasElement>(null);
    const facultyChartRef = useRef<HTMLCanvasElement>(null);

    const analyticsData = useMemo(() => {
        const sortedMeetings = [...meetings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const meetingLabels = sortedMeetings.map(m => m.title.length > 20 ? m.title.substring(0, 20) + '...' : m.title);
        const attendeeCounts = sortedMeetings.map(m => m.attendees.length);
        const invitedCounts = sortedMeetings.map(m => m.invitedMemberIds.length);

        const facultyCounts: { [key: string]: number } = {};
        sortedMeetings.forEach(m => {
            m.attendees.forEach(a => {
                const member = members.find(mem => mem.id === a.memberId);
                if (member) {
                    facultyCounts[member.faculty] = (facultyCounts[member.faculty] || 0) + 1;
                }
            });
        });

        const topMembers = Object.entries(sortedMeetings.reduce((acc, m) => {
            m.attendees.forEach(a => acc[a.memberId] = (acc[a.memberId] || 0) + 1);
            return acc;
        }, {} as { [key: string]: number }))
            .map(([id, count]) => ({ member: members.find(m => m.id === id), count }))
            .filter(item => item.member !== undefined)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { meetingLabels, attendeeCounts, invitedCounts, facultyLabels: Object.keys(facultyCounts), facultyData: Object.values(facultyCounts), topMembers };
    }, [members, meetings]);

    useEffect(() => {
        if (!attendanceChartRef.current || !facultyChartRef.current || typeof Chart === 'undefined') return;

        const textColor = '#64748b';
        const charts: any[] = [];
        const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor } } } };

        charts.push(new Chart(attendanceChartRef.current.getContext('2d'), {
            type: 'line',
            data: {
                labels: analyticsData.meetingLabels,
                datasets: [
                    { label: 'Hadir', data: analyticsData.attendeeCounts, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
                    { label: 'Diundang', data: analyticsData.invitedCounts, borderColor: '#6366f1', borderDash: [5, 5], tension: 0.4 }
                ]
            },
            options
        }));

        charts.push(new Chart(facultyChartRef.current.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: analyticsData.facultyLabels,
                datasets: [{ data: analyticsData.facultyData, backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'] }]
            },
            options
        }));

        return () => charts.forEach(c => c.destroy());
    }, [analyticsData]);

    return (
        <div className="space-y-6 animate-enter">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> Tren Kehadiran
                    </h3>
                    <div className="h-64"><canvas ref={attendanceChartRef}></canvas></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span> Partisipasi Fakultas
                    </h3>
                    <div className="h-64"><canvas ref={facultyChartRef}></canvas></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Top 5 Anggota Teraktif</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                <th className="pb-3 pl-4">Anggota</th>
                                <th className="pb-3">Jabatan</th>
                                <th className="pb-3 text-center">Total Hadir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {analyticsData.topMembers.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <td className="py-4 pl-4 flex items-center gap-3">
                                        <span className="font-bold text-gray-300">#{idx + 1}</span>
                                        <img src={item.member?.photoUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                                        <span className="font-medium text-gray-900 dark:text-white">{item.member?.fullName}</span>
                                    </td>
                                    <td className="py-4 text-sm text-gray-500">{item.member?.position}</td>
                                    <td className="py-4 text-center">
                                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{item.count} Rapat</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const ManagementPage: React.FC<ManagementPageProps> = ({
    onOpenAttendance, onOpenReport, onOpenInvite, onOpenLiveBoard
}) => {
    const {
        managementMembers: members, isLoadingMembers, managementMeetings: meetings, isLoadingMeetings,
        addManagementMember, updateManagementMember, deleteManagementMember, importManagementMembers,
        createManagementMeeting, updateMeeting, deleteManagementMeeting, duplicateManagementMeeting,
    } = useData();

    const [activeTab, setActiveTab] = useState<'members' | 'meetings' | 'analytics'>('members');
    const [isMemberModalOpen, setMemberModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<ManagementMember | null>(null);
    const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
    const [meetingToEdit, setMeetingToEdit] = useState<ManagementMeeting | null>(null);

    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [meetingSearchTerm, setMeetingSearchTerm] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
    const [membersToPrint, setMembersToPrint] = useState<ManagementMember[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- FILTERS ---
    const filteredMembers = useMemo(() => {
        return (members || []).filter((member) => {
            const name = (member.fullName || '').toLowerCase();
            const email = (member.email || '').toLowerCase();
            const search = (memberSearchTerm || '').toLowerCase();
            return name.includes(search) || email.includes(search);
        });
    }, [members, memberSearchTerm]);
    
    const filteredMeetings = useMemo(() => (meetings || []).filter(m =>
        (m.title || '').toLowerCase().includes(meetingSearchTerm.toLowerCase()) || 
        (m.location || '').toLowerCase().includes(meetingSearchTerm.toLowerCase())
    ), [meetings, meetingSearchTerm]);

    // --- HANDLERS ---
    const handleEditMember = (member: ManagementMember) => {
        setMemberToEdit(member);
        setMemberModalOpen(true);
    };

    const handleSaveMember = (data: Omit<ManagementMember, 'id'>) => {
        if (memberToEdit && updateManagementMember) {
            updateManagementMember(memberToEdit.id, data);
        } else if (addManagementMember) {
            addManagementMember(data);
        }
    };

    const handleDeleteMember = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
            if (deleteManagementMember) deleteManagementMember(id);
        }
    }

    const handleSaveMeeting = (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => {
        if (meetingToEdit && updateMeeting) {
            updateMeeting(meetingToEdit.id, data);
        } else if (createManagementMeeting) {
            createManagementMeeting(data);
        }
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," + ["Nama Lengkap,NIDN,Jabatan,Nomor HP", ...members.map(m => `"${m.fullName}","${m.nidn}","${m.position}","${m.phone}"`)].join('\n');
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "data_manajemen.csv";
        link.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && importManagementMembers) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const text = event.target?.result as string;
                const lines = text.split('\n').slice(1).filter(l => l.trim()).map(l => {
                    const c = l.split(',').map(s => s.replace(/"/g, ''));
                    return { fullName: c[0], nidn: c[1], faculty: c[2], studyProgram: c[3], position: c[4], phone: c[5], email: c[6], photoUrl: c[7] || `https://picsum.photos/seed/${c[1]}/200` };
                });
                if (lines.length > 0) { await importManagementMembers(lines); alert(`Berhasil impor ${lines.length} data.`); }
            };
            reader.readAsText(file);
        }
    };

    const toggleMemberSelection = (id: string) => {
        const newSet = new Set(selectedMemberIds);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setSelectedMemberIds(newSet);
    };

    const handlePrintSelected = () => {
        if (selectedMemberIds.size > 0) setMembersToPrint(members.filter(m => selectedMemberIds.has(m.id)));
    };

    const totalMembers = members?.length || 0;
    const totalMeetings = meetings?.length || 0;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-8 font-sans">
            <style>{styles}</style>

            {/* 1. HERO HEADER */}
            <div className="relative rounded-3xl overflow-hidden p-8 mb-8 shadow-xl animate-enter bg-gradient-to-r from-emerald-700 to-teal-600">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Manajemen Kampus</h1>
                        <p className="text-emerald-100 opacity-90">Pusat kontrol agenda rapat, kehadiran, dan data anggota.</p>
                    </div>
                    <div className="flex gap-4 mt-6 md:mt-0">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 text-center border border-white/20">
                            <p className="text-xs text-emerald-200 uppercase font-bold">Anggota</p>
                            <p className="text-2xl font-bold text-white">{totalMembers}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 text-center border border-white/20">
                            <p className="text-xs text-emerald-200 uppercase font-bold">Rapat</p>
                            <p className="text-2xl font-bold text-white">{totalMeetings}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TABS & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-enter delay-100">
                <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex w-full md:w-auto">
                    {['members', 'meetings', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {tab === 'members' && <UsersIcon className="w-4 h-4" />}
                            {tab === 'meetings' && <CalendarPlusIcon className="w-4 h-4" />}
                            {tab === 'analytics' && <AnalyticsIcon className="w-4 h-4" />}
                            <span className="capitalize">{tab === 'analytics' ? 'Analitik' : tab === 'members' ? 'Data Anggota' : 'Agenda Rapat'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. MEMBERS CONTENT */}
            {activeTab === 'members' && (
                <div className="animate-enter delay-200">
                    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                        <div className="relative group w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input type="text" placeholder="Cari anggota..." value={memberSearchTerm} onChange={(e) => setMemberSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedMemberIds.size > 0 && (
                                <button onClick={handlePrintSelected} className="btn bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2">
                                    <IdCardIcon className="w-4 h-4" /> Cetak ({selectedMemberIds.size})
                                </button>
                            )}
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="btn bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-sm"><FileTextIcon className="w-4 h-4" /> Impor</button>
                            <button onClick={handleExportCSV} className="btn bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-sm"><DownloadIcon className="w-4 h-4" /> Ekspor</button>
                            <button onClick={() => { setMemberToEdit(null); setMemberModalOpen(true); }} className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"><UserPlusIcon className="w-4 h-4" /> Tambah</button>
                        </div>
                    </div>

                    {isLoadingMembers ? <div className="text-center py-12 text-gray-400">Memuat data...</div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMembers.map(member => (
                                <div key={member.id} className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-6 border ${selectedMemberIds.has(member.id) ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-100 dark:border-gray-700'} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                                    <div className="absolute top-4 left-4 z-10">
                                        <input type="checkbox" checked={selectedMemberIds.has(member.id)} onChange={() => toggleMemberSelection(member.id)} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300" />
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button onClick={() => handleEditMember(member)} className="p-1.5 bg-gray-100 rounded-full hover:text-emerald-600"><Edit2Icon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 bg-gray-100 rounded-full hover:text-red-600"><Trash2Icon className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex flex-col items-center text-center mt-2">
                                        <div className="p-1 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg group-hover:scale-105 transition-transform">
                                            <img src={member.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-white bg-gray-100" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{member.fullName}</h3>
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mt-2 mb-3">{member.position}</span>
                                        <div className="text-xs text-gray-500 w-full pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
                                            <p className="line-clamp-1">{member.studyProgram}</p>
                                            <p className="font-mono">{member.nidn}</p>
                                        </div>
                                        <button onClick={() => setMembersToPrint([member])} className="mt-4 w-full py-2 rounded-lg bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 text-xs font-bold transition-colors">Cetak Nametag</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 4. MEETINGS TAB */}
            {activeTab === 'meetings' && (
                <div className="animate-enter delay-200">
                    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                        <div className="relative group w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <input type="text" placeholder="Cari agenda rapat..." value={meetingSearchTerm} onChange={(e) => setMeetingSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                        </div>
                        <button onClick={() => { setMeetingToEdit(null); setMeetingModalOpen(true); }} className="btn bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20">
                            <CalendarPlusIcon className="w-4 h-4" /> Buat Agenda Baru
                        </button>
                    </div>

                    {isLoadingMeetings ? <div className="text-center py-12 text-gray-400">Memuat data...</div> : (
                        <div className="space-y-4">
                            {filteredMeetings.map(meeting => (
                                <div key={meeting.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${new Date(meeting.date) > new Date() ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pl-4">
                                        <div className="flex gap-5">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 text-center min-w-[80px] h-fit">
                                                <p className="text-xs font-bold text-red-500 uppercase tracking-wider">{new Date(meeting.date).toLocaleDateString('id-ID', { month: 'short' })}</p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none mt-1">{new Date(meeting.date).getDate()}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{meeting.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4 text-purple-500" /> {new Date(meeting.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                                    <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4 text-purple-500" /> {meeting.location}</span>
                                                </div>
                                                <div className="flex gap-3 mt-3 text-xs font-medium">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{meeting.invitedMemberIds.length} Diundang</span>
                                                    <span className="px-2 py-1 bg-green-100 rounded text-green-700">{meeting.attendees.length} Hadir</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <button onClick={() => onOpenInvite(meeting)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"><MailIcon className="w-4 h-4" /> Undang</button>
                                            <button onClick={() => onOpenLiveBoard(meeting)} className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"><MonitorIcon className="w-4 h-4" /> Live Board</button>
                                            <button onClick={() => onOpenReport(meeting)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"><FileCheckIcon className="w-4 h-4" /> Laporan</button>
                                            <button onClick={() => onOpenAttendance(meeting)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"><CheckCircleIcon className="w-4 h-4" /> Absensi</button>

                                            <div className="ml-2 pl-2 border-l border-gray-200 flex gap-1">
                                                <button onClick={() => duplicateManagementMeeting && duplicateManagementMeeting(meeting.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><CopyIcon className="w-4 h-4" /></button>
                                                <button onClick={() => { setMeetingToEdit(meeting); setMeetingModalOpen(true); }} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Edit2Icon className="w-4 h-4" /></button>
                                                <button onClick={() => { if (window.confirm('Hapus?')) deleteManagementMeeting(meeting.id) }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2Icon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 5. ANALYTICS TAB */}
            {activeTab === 'analytics' && members && meetings && <ManagementAnalytics members={members} meetings={meetings} />}

            {/* MODALS */}
            <MemberModal isOpen={isMemberModalOpen} onClose={() => setMemberModalOpen(false)} onSave={handleSaveMember} memberToEdit={memberToEdit} />
            <MeetingModal isOpen={isMeetingModalOpen} onClose={() => setMeetingModalOpen(false)} onSave={handleSaveMeeting} meetingToEdit={meetingToEdit} />
            {membersToPrint && <NametagModal members={membersToPrint} onClose={() => setMembersToPrint(null)} />}
        </div>
    );
};

export default ManagementPage;
import React, { useEffect, useState } from 'react';
import { ManagementMeeting, ManagementMember } from '../types';
import Logo from '../assets/logo.png';

// --- INLINE ICONS ---
const WifiIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const MaximizeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
);
const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const AlertCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

// --- COMPONENT ---

interface MeetingLiveBoardProps {
    meeting: ManagementMeeting;
    members: ManagementMember[];
    onClose: () => void;
}

const MeetingLiveBoard: React.FC<MeetingLiveBoardProps> = ({ meeting, members, onClose }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const attendees = meeting.attendees.map(a => a.memberId);
    const invited = meeting.invitedMemberIds;
    const presentCount = attendees.length;
    const totalInvited = invited.length;
    const attendancePercentage = totalInvited > 0 ? Math.round((presentCount / totalInvited) * 100) : 0;

    const notPresentList = invited
        .filter(id => !attendees.includes(id))
        .map(id => members.find(m => m.id === id))
        .filter(m => m !== undefined) as ManagementMember[];

    // Circular Progress Calculation
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (attendancePercentage / 100) * circumference;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#020617] text-white font-sans overflow-hidden flex flex-col h-screen w-screen selection:bg-emerald-500/30">
            
            {/* 1. BACKGROUND (Subtle Tech Grid) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-[0.03]"></div>
                {/* Decorative Glows */}
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[80px]"></div>
            </div>

            {/* 2. HEADER (Compact & Fixed Height) */}
            <header className="relative z-20 flex justify-between items-center px-6 h-16 border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        <img src={Logo} alt="Logo" className="h-6 w-auto text-black" />
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-1"></div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-none">LIVE <span className="text-emerald-500">BOARD</span></h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right flex items-center gap-3">
                        <p className="text-emerald-500/80 text-[10px] uppercase font-bold tracking-widest hidden sm:block">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-2xl font-bold font-mono leading-none tracking-tighter text-white">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    <div className="flex gap-2 pl-4 border-l border-white/10">
                        <button onClick={toggleFullscreen} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all" title="Fullscreen">
                            <MaximizeIcon className="w-4 h-4 text-slate-400" />
                        </button>
                        <button onClick={onClose} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all" title="Keluar">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* 3. MAIN CONTENT (Fixed Layout) */}
            <main className="relative z-10 flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
                
                {/* --- LEFT PANEL: MEETING INFO & STATS (Width: 35%) --- */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
                    
                    {/* Meeting Card (Top) */}
                    <div className="relative bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl shrink-0 flex flex-col justify-center min-h-[140px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Sedang Berlangsung
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-white leading-snug mb-3 line-clamp-2">
                            {meeting.title}
                        </h2>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                                <MapPinIcon className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="truncate">{meeting.location}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                                <WifiIcon className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="truncate">Pass: <span className="text-white font-mono">kampus123</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card (Bottom - Fills remaining height) */}
                    <div className="flex-1 bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-xl overflow-hidden min-h-0">
                        {/* Circular Progress */}
                        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                <circle cx="50%" cy="50%" r={radius} stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                <circle 
                                    cx="50%" cy="50%" r={radius} 
                                    stroke="#10b981" 
                                    strokeWidth="8" 
                                    fill="transparent" 
                                    strokeDasharray={circumference} 
                                    strokeDashoffset={strokeDashoffset} 
                                    strokeLinecap="round" 
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white tracking-tight">{attendancePercentage}<span className="text-xl text-emerald-500">%</span></span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Kehadiran</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-emerald-400 leading-none">{presentCount}</span>
                                <span className="text-[10px] text-emerald-500/70 uppercase font-bold tracking-wider">Hadir</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-white leading-none">{totalInvited}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: ABSENTEES (Width: 65%) --- */}
                <div className="col-span-12 lg:col-span-8 h-full flex flex-col min-h-0">
                    <div className="flex-1 bg-slate-900/40 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                        
                        {/* List Header */}
                        <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0 h-14">
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon className="w-4 h-4 text-orange-500" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Menunggu Kehadiran</h3>
                                <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white font-mono">{notPresentList.length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>

                        {/* List Content (Scrollable) */}
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
                            {notPresentList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {notPresentList.map((m) => (
                                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 p-[1px] group-hover:bg-emerald-500 transition-colors">
                                                    <img 
                                                        src={m.photoUrl} 
                                                        alt={m.fullName} 
                                                        className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all bg-slate-900" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">{m.fullName}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] px-1.5 py-px rounded bg-white/5 text-slate-400 uppercase font-bold tracking-wide truncate max-w-[100px]">{m.position}</span>
                                                    <span className="text-[9px] text-slate-600 truncate">{m.faculty}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                                        <UsersIcon className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Semua Hadir</h3>
                                    <p className="text-xs text-slate-400 mt-1">Rapat siap dimulai.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Ticker (Fixed Height) */}
                        <div className="h-10 bg-[#020617] border-t border-white/10 relative overflow-hidden shrink-0 flex items-center">
                            <div className="whitespace-nowrap animate-marquee flex gap-12 text-[10px] font-mono font-medium text-emerald-500/80 tracking-widest uppercase">
                                <span>+++ Selamat Datang di Rapat Manajemen Universitas Hamzanwadi +++</span>
                                <span>Mohon Menonaktifkan Nada Dering Ponsel +++</span>
                                <span>Silakan Scan QR Code Untuk Presensi +++</span>
                                <span>Jaga Ketertiban +++</span>
                            </div>
                            {/* Fade Edge */}
                            <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none"></div>
                            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Styles */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default MeetingLiveBoard;
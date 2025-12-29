import React, { useState, useEffect, useRef } from 'react';
import { Visit, VisitStatus, UserRole, CalendarEvent, Page, ManagementMeeting, ActivityLog } from '../types';
import { UserCheckIcon, CalendarIcon, AlertTriangleIcon, LogInIcon, LogOutIcon, PreregisterIcon, CalendarPlusIcon, BlacklistIcon, IdCardIcon, AnalyticsIcon, MonitorIcon, CheckCircleIcon, ArrowRightIcon } from './icons';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import { useData } from '../context/DataContext';

declare const Chart: any;

// --- CSS & ANIMATIONS ---
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-enter {
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .dark .glass-card {
    background: rgba(17, 24, 39, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .modern-scrollbar::-webkit-scrollbar { width: 6px; }
  .modern-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .modern-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
`;

// --- SKELETONS ---
const SkeletonCard = () => (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border animate-pulse h-40 flex flex-col justify-between">
        <div className="flex justify-between">
            <div className="h-4 w-24 bg-secondary rounded-full"></div>
            <div className="h-10 w-10 bg-secondary rounded-xl"></div>
        </div>
        <div className="space-y-2">
            <div className="h-8 w-16 bg-secondary rounded"></div>
            <div className="h-3 w-32 bg-secondary rounded"></div>
        </div>
    </div>
);

// --- SPARKLINE CHART ---
const SparklineChart: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!chartRef.current || typeof Chart === 'undefined') return;
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 40);
        gradient.addColorStop(0, `${color}40`); 
        gradient.addColorStop(1, `${color}00`); 

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i.toString()),
                datasets: [{
                    data: data,
                    borderColor: color,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false, min: 0 } },
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { duration: 1000, easing: 'easeOutQuart' },
                layout: { padding: 0 }
            }
        });
        return () => chart.destroy();
    }, [data, color]);

    return <div className="w-full h-full"><canvas ref={chartRef}></canvas></div>;
};

// --- MODERN COMPONENTS ---

const StatCard = React.memo<{ 
    icon: React.ReactNode; 
    title: string; 
    value: number | string; 
    colorName: string; // e.g. "blue", "green"
    trendData?: number[]; 
    delay?: string;
}>(({ icon, title, value, colorName, trendData, delay = "" }) => {
    // Mapping warna dinamis untuk Tailwind
    const bgColors: any = {
        green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        red: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    const colorHex: any = { green: "#10b981", blue: "#3b82f6", purple: "#8b5cf6", red: "#ef4444" };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-enter ${delay}`}>
            {/* Background Gradient Blob */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-transform duration-700 group-hover:scale-150 bg-${colorName}-500`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${bgColors[colorName]} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        {icon}
                    </div>
                    {trendData && (
                        <div className="flex items-center space-x-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                            <span>+12%</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </div>
                    )}
                </div>
                
                <div>
                    <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{title}</p>
                </div>

                {trendData && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50 mask-gradient-to-t">
                        <SparklineChart data={trendData} color={colorHex[colorName]} />
                    </div>
                )}
            </div>
        </div>
    );
});

const WelcomeHeader: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
    const greeting = (() => {
        const h = new Date().getHours();
        return h < 11 ? "Selamat Pagi" : h < 15 ? "Selamat Siang" : h < 19 ? "Selamat Sore" : "Selamat Malam";
    })();
    
    const roleText = {
        [UserRole.Administrator]: "Administrator",
        [UserRole.Receptionist]: "Resepsionis",
        [UserRole.Host]: "Staff",
        [UserRole.MeetingAdmin]: "Sekretaris",
    }[userRole];

    return (
        <div className="relative rounded-3xl overflow-hidden p-8 mb-10 animate-enter shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900 dark:to-teal-900"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between text-white">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium tracking-wide uppercase border border-white/20">
                            {roleText} Dashboard
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                        {greeting}, <span className="text-emerald-100">User</span> 👋
                    </h1>
                    <p className="text-emerald-50 max-w-lg text-sm md:text-base opacity-90">
                        Selamat datang kembali di Sistem Manajemen Tamu Universitas Hamzanwadi. Pantau aktivitas dan kelola data hari ini.
                    </p>
                </div>
                <div className="mt-6 md:mt-0 hidden md:block">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-xs text-emerald-200 uppercase font-semibold">Waktu Server</p>
                            <p className="text-xl font-mono font-bold">{new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                             <p className="text-xs text-emerald-200 uppercase font-semibold">Tanggal</p>
                             <p className="text-sm font-medium">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabPill: React.FC<{ active: boolean; onClick: () => void; count?: number; children: React.ReactNode }> = ({ active, onClick, count, children }) => (
    <button 
        onClick={onClick}
        className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            active 
            ? 'text-white shadow-md bg-gray-900 dark:bg-white dark:text-gray-900' 
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        <span className="relative z-10 flex items-center space-x-2">
            <span>{children}</span>
            {count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {count}
                </span>
            )}
        </span>
    </button>
);

const VisitorCardItem = React.memo<{ visit: Visit }>(({ visit }) => (
    <div className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 animate-enter">
        <div className="flex items-center space-x-4 overflow-hidden">
            <div className="relative shrink-0">
                <img src={visit.visitor.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${visit.status === VisitStatus.OnSite ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {visit.visitor.fullName}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-2">
                    <span className="flex items-center truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5"></span>
                        {visit.host ? visit.host.name : visit.destination}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-gray-400">{new Date(visit.checkInTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        </div>
        <div className="shrink-0">
            <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-700 transition-colors">
                <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
));

const MeetingCardItem = React.memo<{ meeting: ManagementMeeting }>(({ meeting }) => (
    <div className="group flex items-start justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:shadow-md hover:border-purple-500/30 transition-all duration-200 animate-enter">
        <div className="flex items-start space-x-4 overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                {meeting.title.charAt(0)}
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {meeting.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {new Date(meeting.date).toLocaleDateString('id-ID', {weekday: 'short', day: 'numeric', month: 'short'})}
                    <span className="mx-1.5 opacity-50">|</span>
                    <span className="font-mono">{new Date(meeting.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                </p>
                <div className="flex items-center mt-2 space-x-[-8px]">
                    {meeting.attendees.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px]">
                            U
                        </div>
                    ))}
                    {meeting.attendees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                            +{meeting.attendees.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
));

const QuickActionItem: React.FC<{ icon: React.ReactNode; label: string; desc: string; color: string; onClick: () => void }> = ({ icon, label, desc, color, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-start p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full group text-left"
    >
        <div className={`p-3 rounded-xl mb-3 transition-colors duration-300 ${color} group-hover:scale-110 origin-left`}>
            {icon}
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-sm">{label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{desc}</span>
    </button>
);

// --- MAIN DASHBOARD PAGE ---

interface DashboardPageProps {
  userRole: UserRole;
  onCalendarSuggestionClick: (event: CalendarEvent) => void;
  onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userRole, onCalendarSuggestionClick, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'onsite' | 'expected'>('onsite');
  const data = useData();
  const { visits, isLoadingVisits, activityLog, calendarEvents, managementMeetings, visitorTrends } = data;

  const onSiteNow = visits.filter(v => v.status === VisitStatus.OnSite);
  const expectedToday = visits.filter(v => v.status === VisitStatus.Expected);
  
  // Stagger animation references aren't needed with CSS animation classes, but keeping logic structure
  // We use CSS class 'animate-enter' with delays

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-8 font-sans">
      <style>{styles}</style>
      
      {/* 1. HERO SECTION */}
      <WelcomeHeader userRole={userRole} />

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {isLoadingVisits ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
            <>
                <StatCard 
                    icon={<UserCheckIcon className="w-6 h-6"/>}
                    title="Tamu di Lokasi"
                    value={onSiteNow.length}
                    colorName="green"
                    trendData={visitorTrends.onSite}
                    delay="delay-100"
                />
                <StatCard 
                    icon={<CalendarIcon className="w-6 h-6"/>}
                    title="Tamu Diharapkan"
                    value={expectedToday.length}
                    colorName="blue"
                    trendData={visitorTrends.expected}
                    delay="delay-200"
                />
                <StatCard 
                    icon={<CalendarPlusIcon className="w-6 h-6"/>}
                    title="Rapat Aktif"
                    value={managementMeetings?.length || 0}
                    colorName="purple"
                    delay="delay-300"
                />
                <StatCard 
                    icon={<AlertTriangleIcon className="w-6 h-6"/>}
                    title="Alert Keamanan"
                    value="0"
                    colorName="red"
                    delay="delay-300"
                />
            </>
        )}
      </div>

      {/* 3. MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="xl:col-span-2 space-y-8">
            
            {/* VISITOR / MEETING LIST SECTION */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 animate-enter delay-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aktivitas Hari Ini</h2>
                        <p className="text-sm text-gray-500">Pantau siapa saja yang berada di area kampus.</p>
                    </div>
                    
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full self-start md:self-auto">
                        <TabPill active={activeTab === 'onsite'} onClick={() => setActiveTab('onsite')} count={onSiteNow.length}>
                            On-Site
                        </TabPill>
                        <TabPill active={activeTab === 'expected'} onClick={() => setActiveTab('expected')} count={expectedToday.length}>
                            Expected
                        </TabPill>
                    </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto modern-scrollbar pr-2">
                    {isLoadingVisits ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                        </div>
                    ) : (
                        (activeTab === 'onsite' ? onSiteNow : expectedToday).length > 0 ? (
                            (activeTab === 'onsite' ? onSiteNow : expectedToday).map(v => (
                                <VisitorCardItem key={v.id} visit={v} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 text-gray-400">
                                    <UserCheckIcon className="w-8 h-8" />
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white">Tidak ada tamu</p>
                                <p className="text-sm text-gray-500">Belum ada data untuk kategori ini.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-enter delay-300">
                <QuickActionItem 
                    icon={<PreregisterIcon className="w-6 h-6 text-white"/>} 
                    label="Registrasi Tamu" 
                    desc="Formulir tamu baru"
                    color="bg-blue-500 shadow-blue-500/30"
                    onClick={() => onNavigate(Page.Preregister)}
                />
                <QuickActionItem 
                    icon={<CalendarPlusIcon className="w-6 h-6 text-white"/>} 
                    label="Buat Acara" 
                    desc="Jadwalkan event"
                    color="bg-purple-500 shadow-purple-500/30"
                    onClick={() => onNavigate(Page.Events)}
                />
                <QuickActionItem 
                    icon={<BlacklistIcon className="w-6 h-6 text-white"/>} 
                    label="Keamanan" 
                    desc="Daftar hitam & log"
                    color="bg-red-500 shadow-red-500/30"
                    onClick={() => onNavigate(Page.Blacklist)}
                />
                <QuickActionItem 
                    icon={<AnalyticsIcon className="w-6 h-6 text-white"/>} 
                    label="Analitik" 
                    desc="Laporan data"
                    color="bg-emerald-500 shadow-emerald-500/30"
                    onClick={() => onNavigate(Page.Analitik)}
                />
            </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-8">
            
            {/* ACTIVITY FEED */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-enter delay-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Log Aktivitas</h3>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide">View All</button>
                </div>
                
                <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-6">
                    {activityLog.slice(0, 5).map((log, idx) => (
                        <div key={log.id} className="relative group">
                            <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                                log.type === 'checkin' ? 'bg-green-500' : log.type === 'checkout' ? 'bg-orange-500' : 'bg-blue-500'
                            } group-hover:scale-125 transition-transform`}></span>
                            
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-mono mb-0.5">
                                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                </span>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-snug group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    {log.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    {activityLog.length === 0 && <p className="text-sm text-gray-400 italic">Belum ada aktivitas.</p>}
                </div>
            </div>

            {/* CALENDAR SUGGESTIONS */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl text-white animate-enter delay-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                            <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">Saran Kalender</h3>
                    </div>

                    <div className="space-y-3">
                        {calendarEvents.slice(0, 3).map(event => (
                            <div key={event.id} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => onCalendarSuggestionClick(event)}>
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm truncate">{event.title}</h4>
                                        <p className="text-xs text-indigo-100 opacity-80 mt-0.5">
                                            {event.startTime.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} &bull; {event.guestEmail}
                                        </p>
                                    </div>
                                    <button className="text-xs bg-white text-indigo-600 font-bold px-2 py-1 rounded-md shadow-sm">Add</button>
                                </div>
                            </div>
                        ))}
                         {calendarEvents.length === 0 && <p className="text-sm text-indigo-100 opacity-70">Tidak ada saran acara saat ini.</p>}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
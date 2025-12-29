import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { Page, VisitStatus, Visit, Event, Notification as AppNotification, UserRole, SmartToast, CalendarEvent, PreregistrationDraft, ManagementMeeting } from './types';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import DashboardPage from './components/DashboardPage';
import VisitorsPage from './components/VisitorsPage';
import PreregisterPage from './components/PreregisterPage';
import BlacklistPage from './components/BlacklistPage';
import ManualCheckinModal from './components/ManualCheckinModal';
import KioskPage from './components/KioskPage';
import EventsPage from './components/EventsPage';
import PublicRegistrationModal from './components/PublicRegistrationModal';
import EventCheckinPage from './components/EventCheckinPage';
import AuditLogPage from './components/AuditLogPage';
import VisitorDetailModal from './components/VisitorDetailModal';
import HostDashboardPage from './components/HostDashboardPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './LoginPage';
import ToastNotification from './components/ToastNotification';
import AnalyticsPage from './components/AnalyticsPage';
import UserManagementPage from './components/UserManagementPage';
import VisitorBadgeModal from './components/VisitorBadgeModal';
import InviteGuestModal from './components/InviteGuestModal';
import EvacuationListPage from './components/EvacuationListPage';
import ManagementPage from './components/ManagementPage'; 
import MeetingAttendanceModal from './components/MeetingAttendanceModal';
import MeetingDetailModal from './components/MeetingDetailModal';
import MeetingInviteModal from './components/MeetingInviteModal';
import MeetingLiveBoard from './components/MeetingLiveBoard';
import * as api from './services/api';

type ViewMode = 'dashboard' | 'kios';

const App: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const data = useData();

  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  

  const [isCheckinModalOpen, setCheckinModalOpen] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScanningId, setIsScanningId] = useState(false);
  const [isEvacuationModeOpen, setEvacuationModeOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      if (localStorage.getItem('vms-theme') === 'dark') return true;
      if (localStorage.getItem('vms-theme') === 'light') return false;
    } catch (e) { console.error("Could not access localStorage for theme setting.", e); }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [registrationEvent, setRegistrationEvent] = useState<Event | null>(null);
  const [selectedEventForCheckin, setSelectedEventForCheckin] = useState<Event | null>(null);
  const [preregistrationData, setPreregistrationData] = useState<any>(null);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [toast, setToast] = useState<SmartToast | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [visitForBadge, setVisitForBadge] = useState<Visit | null>(null);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<SmartToast[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  const [selectedMeetingForAttendance, setSelectedMeetingForAttendance] = useState<ManagementMeeting | null>(null);
  const [selectedMeetingForReport, setSelectedMeetingForReport] = useState<ManagementMeeting | null>(null);
  const [selectedMeetingForInvite, setSelectedMeetingForInvite] = useState<ManagementMeeting | null>(null);
  const [selectedMeetingForLiveBoard, setSelectedMeetingForLiveBoard] = useState<ManagementMeeting | null>(null);
  
  // --- STATE DEEP LINKING ---
  const [publicEventId, setPublicEventId] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  // --- EFFECT: DETEKSI URL PENDAFTARAN ---
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/register/')) {
        const eventId = path.split('/')[2];
        if (eventId) setPublicEventId(eventId);
    }
  }, []);

  useEffect(() => {
    const loadPublicEvent = async () => {
        // Jika ada ID publik (dari URL)
        if (publicEventId) {
            try {
                // Panggil API Publik secara langsung (Bypassing DataContext yang butuh login)
                const event = await api.getEventByIdApi(publicEventId);
                
                if (event) {
                    // Parsing Tanggal (Penting karena dari API bentuknya string)
                    const parsedEvent = {
                        ...event,
                        date: new Date(event.date)
                    };
                    setRegistrationEvent(parsedEvent);
                    setPublicEventId(null); // Reset agar tidak looping
                }
            } catch (error) {
                console.error("Gagal memuat acara publik:", error);
            }
        }
    };

    loadPublicEvent();
  }, [publicEventId]);

  // --- EFFECT: SINKRONISASI EVENT DARI URL ---
  useEffect(() => {
    // Jika ada ID publik dan data events sudah termuat
    if (publicEventId && data.events.length > 0) {
        const foundEvent = data.events.find(e => e.id === publicEventId);
        if (foundEvent) {
            setRegistrationEvent(foundEvent);
            setPublicEventId(null); // Reset agar tidak looping
        }
    }
  }, [publicEventId, data.events]);

  useEffect(() => {
    // Automatically set the initial page based on user role after login
    if (isAuthenticated && user) {
        setActivePage(user.role === UserRole.Host ? Page.HostDashboard : Page.Dashboard);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('vms-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('vms-theme', 'light');
      }
    } catch (e) { console.error("Could not access localStorage for theme setting.", e); }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const handleNavigation = useCallback((page: Page) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          setActivePage(page);
          setSelectedEventForCheckin(null);
          setPreregistrationData(null);
        },
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, [activePage, viewMode, selectedEventForCheckin]);

  const showNotification = useCallback((message: string, type: AppNotification['type']) => {
    const newNotif = { id: Date.now(), message, type };
    setNotification(newNotif);
    setTimeout(() => {
      setNotification(current => (current?.id === newNotif.id ? null : current));
    }, 5000);
  }, []);

  const showSmartToast = useCallback((visit: Visit) => {
    if (!data.visits) return;
    const visitHistoryCount = data.visits.filter(v => v.visitor.id === visit.visitor.id && v.status === VisitStatus.CheckedOut).length + 1;
    const message = visitHistoryCount === 1 
      ? `${visit.visitor.fullName} dari ${visit.visitor.company} telah tiba. Ini kunjungan pertama mereka.`
      : `${visit.visitor.fullName} dari ${visit.visitor.company} telah tiba. Ini kunjungan ke-${visitHistoryCount}.`;

    const newToast: SmartToast = { id: Date.now(), title: `Tamu Tiba: ${visit.visitor.fullName}`, message, imageUrl: visit.visitor.photoUrl };
    setToast(newToast);
    setNotifications(prev => [newToast, ...prev].slice(0, 10));
    setUnreadNotificationCount(prev => prev + 1);
    setTimeout(() => setToast(null), 8000);
  }, [data.visits]);

  const handleMarkNotificationsAsRead = useCallback(() => setUnreadNotificationCount(0), []);

  const handleBlacklistAlert = useCallback((visitorName: string) => {
    showNotification(`PERINGATAN: Upaya check-in oleh "${visitorName}" (daftar hitam) terdeteksi.`, 'alert');
  }, [showNotification]);
  
  const handleCalendarSuggestionClick = useCallback((event: CalendarEvent) => {
    if(!data.visitors) return;
    const suggestedVisitor = data.visitors.find(v => v.email === event.guestEmail);
    const simplePurpose = event.title.split(' with ')[0].split(' - ')[0];

    setPreregistrationData({
      hostName: event.host.name,
      visitDate: event.startTime.toISOString().split('T')[0],
      visitTime: event.startTime.toTimeString().substring(0, 5),
      purpose: simplePurpose,
      fullName: suggestedVisitor?.fullName || '',
      email: event.guestEmail,
      company: suggestedVisitor?.company || '',
      phone: suggestedVisitor?.phone || '',
    });
    handleNavigation(Page.Preregister);
  }, [handleNavigation, data.visitors]);

  const handleOpenRegistration = useCallback((event: Event) => setRegistrationEvent(event), []);
  
  const checkInVisitorWithSmartToast = useCallback(async (visitData: Omit<Visit, 'id' | 'status' | 'checkInTime'>) => {
    const result = await data.checkInVisitor(visitData);
    if (result.success && result.visit) {
      setVisitForBadge(result.visit);
      showSmartToast(result.visit);
    }
    return result;
  }, [data, showSmartToast]);

  const checkInPreregisteredGuestWithSmartToast = useCallback(async (visitId: string, photoUrl: string) => {
    const result = await data.checkInPreregisteredGuest(visitId, photoUrl);
    if (result.success && result.visit) {
      setVisitForBadge(result.visit);
      showSmartToast(result.visit);
    }
    return result;
  }, [data, showSmartToast]);
  
  const handlePreregSuccessNotification = useCallback((visit: Visit) => {
    showNotification(`Email konfirmasi (simulasi) dikirim ke ${visit.visitor.email} dengan kode ${visit.checkinCode}.`, 'success');
  }, [showNotification]);

  const handleInviteGuest = useCallback(async (draft: PreregistrationDraft) => {
    const SIMULATED_HOST_ID = 'host1';
    if (!data.hosts) return;
    const host = data.hosts.find(h => h.id === SIMULATED_HOST_ID);
    if (host) {
      await data.preregisterGuest({
        visitor: { fullName: draft.guestEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), company: "Diundang via Dasbor Host", email: draft.guestEmail, phone: "" },
        host,
        purpose: draft.meetingDetails,
        visitTime: new Date(new Date().setDate(new Date().getDate() + 2))
      });
      showNotification(`Tamu ${draft.guestEmail} telah berhasil di pra-registrasi.`, 'success');
    }
    setInviteModalOpen(false);
  }, [data, showNotification]);

  const handleIdScan = useCallback(async (base64ImageData: string): Promise<{ fullName: string; company: string } | { error: string }> => {
    setIsScanningId(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY as string });
      const textPart = { text: "Anda ahli pembaca KTP Indonesia. Ekstrak 'Nama Lengkap' dan 'Pekerjaan'. Jika 'Pekerjaan' tidak ada, gunakan string kosong. Kembalikan format JSON: {\"fullName\": \"...\", \"company\": \"...\"}" };
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64ImageData } };
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [textPart, imagePart] }, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { fullName: { type: Type.STRING }, company: { type: Type.STRING } } } } });
      const parsed = JSON.parse(response.text);
      return { fullName: parsed.fullName || '', company: parsed.company || '' };
    } catch (error) {
      console.error("Gemini API error:", error);
      return { error: 'Gagal menganalisis gambar KTP. Coba lagi atau isi manual.' };
    } finally {
      setIsScanningId(false);
    }
  }, []);

  const handleQuickScan = useCallback(() => {
    const today = new Date().toDateString();
    if(!data.managementMeetings) return;
    const todaysMeetings = data.managementMeetings.filter(m => new Date(m.date).toDateString() === today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (todaysMeetings.length === 0) {
      showNotification('Tidak ada agenda rapat yang dijadwalkan hari ini.', 'info');
      return;
    }
    setSelectedMeetingForAttendance(todaysMeetings[0]);
  }, [data.managementMeetings, showNotification]);

  const onSiteNow = data.visits?.filter(v => v.status === VisitStatus.OnSite) || [];

  const renderPageContent = () => {
    if (!user) return null; // Should not happen if authenticated
    if (selectedEventForCheckin) return <EventCheckinPage event={selectedEventForCheckin} visits={data.visits || []} onCheckIn={data.checkInEventGuest} onBack={() => setSelectedEventForCheckin(null)} />;
    
    switch (activePage) {
      case Page.Dashboard: return <DashboardPage userRole={user.role} onCalendarSuggestionClick={handleCalendarSuggestionClick} onNavigate={handleNavigation} onOpenMeetingReport={setSelectedMeetingForReport} onOpenLiveBoard={setSelectedMeetingForLiveBoard} onOpenAttendance={setSelectedMeetingForAttendance} />;
      case Page.Visitors: return <VisitorsPage onManualCheckin={() => setCheckinModalOpen(true)} onOpenVisitDetail={setSelectedVisit} onNavigate={handleNavigation} />;
      case Page.Preregister: return <PreregisterPage onSuccessNotification={handlePreregSuccessNotification} initialData={preregistrationData} />;
      case Page.Blacklist: return <BlacklistPage />;
      case Page.Events: return <EventsPage onOpenRegistration={handleOpenRegistration} onManageCheckin={setSelectedEventForCheckin} onShowToast={(msg) => showNotification(msg, 'info')} />;
      case Page.AuditLog: return <AuditLogPage auditLog={data.auditLog || []} />;
      case Page.HostDashboard: return <HostDashboardPage visits={data.visits || []} onInviteGuest={() => setInviteModalOpen(true)} onPreregister={() => handleNavigation(Page.Preregister)} />;
      case Page.Settings: return <SettingsPage onPurgeData={data.purgeOldVisits} />;
      case Page.Analitik: return <AnalyticsPage visits={data.visits || []} isDarkMode={isDarkMode} />;
      case Page.UserManagement: return <UserManagementPage />;
      case Page.Management: return <ManagementPage onOpenAttendance={setSelectedMeetingForAttendance} onOpenReport={setSelectedMeetingForReport} onOpenInvite={setSelectedMeetingForInvite} onOpenLiveBoard={setSelectedMeetingForLiveBoard} />;
      default: return <div>Halaman tidak ditemukan</div>;
    }
  };

  // --- MODIFIKASI: BYPASS LOGIN JIKA ADA EVENT PENDAFTARAN AKTIF ---
  // Jika sedang membuka link registrasi, tampilkan Modal Registrasi meskipun belum login.
  if (registrationEvent) {
      return (
        <PublicRegistrationModal 
            event={registrationEvent} 
            onClose={() => setRegistrationEvent(null)} 
            onRegister={data.registerForEvent} 
        />
      );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }
  
  if (viewMode === 'kios') return <KioskPage onCheckIn={checkInVisitorWithSmartToast} onPreregisteredCheckIn={checkInPreregisteredGuestWithSmartToast} onBlacklistAlert={handleBlacklistAlert} onScanId={handleIdScan} isScanningId={isScanningId} onSwitchToDashboard={() => setViewMode('dashboard')} />;

  return (
    <>
      <ToastNotification toast={toast} />
      <Layout
        activePage={activePage} onNavigate={handleNavigation} notification={notification}
        onCloseNotification={() => setNotification(null)} userRole={user.role} onLogout={logout}
        isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen(prev => !prev)} isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} onSwitchToKiosk={() => setViewMode('kios')}
        onPanic={() => setEvacuationModeOpen(true)} notifications={notifications}
        unreadNotificationCount={unreadNotificationCount} onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        onQuickScan={user.role === UserRole.MeetingAdmin ? handleQuickScan : undefined}
      >
        <div ref={contentRef}>{renderPageContent()}</div>
      </Layout>
      
      <ManualCheckinModal isOpen={isCheckinModalOpen} onClose={() => setCheckinModalOpen(false)} onCheckIn={checkInVisitorWithSmartToast} onBlacklistAlert={handleBlacklistAlert} />
      {selectedVisit && <VisitorDetailModal visit={selectedVisit} onClose={() => setSelectedVisit(null)} />}
      {visitForBadge && <VisitorBadgeModal visit={visitForBadge} onClose={() => setVisitForBadge(null)} />}
      <InviteGuestModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} onInvite={handleInviteGuest} />
      
      {/* Modal Registrasi (Jika user login dan membuka dari menu) */}
      {registrationEvent && <PublicRegistrationModal event={registrationEvent} onClose={() => setRegistrationEvent(null)} onRegister={data.registerForEvent} />}
      
      {isEvacuationModeOpen && <EvacuationListPage onSiteVisits={onSiteNow} onClose={() => setEvacuationModeOpen(false)} />}
      
      {selectedMeetingForAttendance && <MeetingAttendanceModal meeting={selectedMeetingForAttendance} onClose={() => setSelectedMeetingForAttendance(null)} onMarkAttendance={data.markMeetingAttendance} />}
      {selectedMeetingForReport && <MeetingDetailModal meeting={selectedMeetingForReport} members={data.managementMembers || []} onClose={() => setSelectedMeetingForReport(null)} onUpdateMeeting={data.updateMeeting} onRemoveAttendance={data.removeMeetingAttendance} />}
      {selectedMeetingForInvite && <MeetingInviteModal meeting={selectedMeetingForInvite} members={data.managementMembers || []} onClose={() => setSelectedMeetingForInvite(null)} onInvite={data.inviteMembersToMeeting} />}
      {selectedMeetingForLiveBoard && <MeetingLiveBoard meeting={selectedMeetingForLiveBoard} members={data.managementMembers || []} onClose={() => setSelectedMeetingForLiveBoard(null)} />}
    </>
  );
};

export default App;
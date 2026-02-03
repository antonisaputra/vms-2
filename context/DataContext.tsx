import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
    Visit, VisitStatus, UserRole, CalendarEvent,
    ManagementMeeting, ManagementMember, Host, ActivityLog,
    Event, AuditLogEntry, BlacklistedPerson, Visitor, User,
    MeetingAttendance
} from '../types';

import * as api from '../services/api';

// --- 1. DEFINISI TIPE CONTEXT (INTERFACE) ---
interface DataContextType {
    // Visits & Hosts
    visits: Visit[];
    hosts: Host[];
    isLoadingVisits: boolean;
    isLoadingHosts: boolean;
    preregisterGuest: (data: Partial<Visit>) => Visit;
    // Di bagian interface DataContextType
    checkInVisitor: (data: any) => Promise<{ success: boolean, message?: string }>;
    checkoutVisitor: (visitId: string) => Promise<void>;
    checkoutVisitorByCode: (code: string) => { success: boolean; message?: string };

    // Dashboard Stats
    visitorTrends: { onSite: number[], expected: number[] };
    activityLog: ActivityLog[];
    calendarEvents: CalendarEvent[];
    isLoadingActivityLog: boolean;
    isOffline: boolean;
    offlineQueueCount: number;
    setOffline: (status: boolean) => number;

    // Management Members (Kelola Anggota Manajemen)
    managementMembers: ManagementMember[];
    isLoadingMembers: boolean;
    addManagementMember: (data: Omit<ManagementMember, 'id'>) => void;
    updateManagementMember: (id: string, data: Partial<ManagementMember>) => void;
    deleteManagementMember: (id: string) => void;
    importManagementMembers: (data: Omit<ManagementMember, 'id'>[]) => Promise<number>;

    // Management Meetings (Agenda Rapat)
    managementMeetings: ManagementMeeting[];
    isLoadingMeetings: boolean;
    createManagementMeeting: (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => void;
    updateMeeting: (id: string, data: Partial<ManagementMeeting>) => void;
    deleteManagementMeeting: (id: string) => void;
    duplicateManagementMeeting: (id: string) => void;
    inviteMembersToMeeting: (meetingId: string, memberIds: string[]) => Promise<{ success: boolean; count: number }>;
    markMeetingAttendance: (meetingId: string, identifier: string, signatureDataUrl: string) => { success: boolean; memberName?: string; message?: string };
    removeMeetingAttendance: (meetingId: string, memberId: string) => Promise<void>;

    // Events (Acara)
    events: Event[];
    isLoadingEvents: boolean; // Menambahkan state loading nyata
    blacklist: BlacklistedPerson[];

    // --- USER MANAGEMENT ---
    users: User[];
    isLoadingUsers: boolean;
    auditLog: AuditLogEntry[];
    addToBlacklist: (person: Omit<BlacklistedPerson, 'id' | 'addedAt'>) => void;

    // Updated Event Function
    createEvent: (event: any) => Promise<void>;

    registerForEvent: (event: any, visitor: any) => Promise<any>;
    checkInEventGuest: (visitId: string) => Promise<any>;
    purgeOldVisits: (months: number) => number;
    runAutoCheckout: () => number;

    // Functions
    addUser: (user: any) => Promise<void>;
    updateUser: (id: string, data: any) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    refreshUserData: () => void; // Fungsi trigger refresh manual

    checkInPreregisteredGuest: (visitId: string, photoUrl: string) => Promise<{ success: boolean, visit?: Visit, message?: string }>;
    findPreregisteredGuestByCode: (code: string) => Promise<Visit | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- 2. DUMMY DATA AWAL (Fallback) ---
const INITIAL_HOSTS: Host[] = [
    { id: '1', name: 'Dr. Sitti Rohmi Djalilah', department: 'Rektorat', position: 'Rektor', email: 'rektor@hamzanwadi.ac.id', photoUrl: 'https://ui-avatars.com/api/?name=Sitti+Rohmi' },
];
const INITIAL_EVENTS: CalendarEvent[] = [
    { id: 'cal1', title: 'Rapat Senat', startTime: new Date(), host: INITIAL_HOSTS[0], guestEmail: 'staff@univ.ac.id' }
];

// --- 3. PROVIDER COMPONENT ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- STATE ---
    const [visits, setVisits] = useState<Visit[]>([]);
    const [hosts, setHosts] = useState<Host[]>(INITIAL_HOSTS);

    // Inisialisasi dengan array kosong
    const [managementMembers, setManagementMembers] = useState<ManagementMember[]>([]);
    const [managementMeetings, setManagementMeetings] = useState<ManagementMeeting[]>([]);
    const [events, setEvents] = useState<Event[]>([]); // State Events

    // Loading States
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true); // Loading Events

    // Dashboard & System States
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
    const [blacklist, setBlacklist] = useState<BlacklistedPerson[]>([]);
    const [isOffline, setIsOfflineState] = useState(false);

    // Users State
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Global Refresh Trigger
    const [shouldRefresh, setShouldRefresh] = useState(0);

    // --- GANTI FUNGSI addActivity LAMA DENGAN INI ---
    // --- GANTI FUNGSI addActivity DENGAN INI ---
    const addActivity = async (type: ActivityLog['type'], text: string) => {
        // 1. Cek Token (Apakah user Login?)
        const token = localStorage.getItem('vms_token');

        // 2. Update UI Lokal (Optimistic Update) - Agar terlihat responsif
        const tempLog: ActivityLog = {
            id: Date.now().toString(),
            type,
            text,
            timestamp: new Date()
        };

        setActivityLog(prev => [tempLog, ...prev]);

        // Update juga tabel Audit Log
        const auditEntry: AuditLogEntry = {
            id: tempLog.id,
            timestamp: tempLog.timestamp,
            action: mapTypeToAction(tempLog.type),
            details: tempLog.text,
            user: token ? 'User/Admin' : 'Tamu (Public)'
        };
        setAuditLog(prev => [auditEntry, ...prev]);

        // 3. PANGGIL API HANYA JIKA LOGIN
        // Ini mencegah error "Failed to add activity log" saat tamu mendaftar
        if (token) {
            try {
                // Pastikan api.addActivityLogApi sudah ada di services/api.ts
                await api.addActivityLogApi({ type, text });
            } catch (error) {
                console.warn("Gagal simpan log ke DB (Mungkin sesi habis):", error);
            }
        } else {
            // Opsional: Untuk tamu, log ini hanya tersimpan di browser session (hilang saat refresh)
            // Atau, Anda bisa membuat endpoint publik khusus di backend jika wajib disimpan.
            console.log("[Info] Log aktivitas tamu tidak dikirim ke backend (Butuh Auth).");
        }
    };

    // Fungsi Trigger Refresh
    const refreshUserData = () => {
        setShouldRefresh(prev => prev + 1);
    };

    // --- FETCH DATA LOGIC ---

    // 1. Fetch Users
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) {
                    setUsers([]);
                    return;
                }
                const data = await api.getUsersApi();
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error("Gagal mengambil data user:", error);
                setUsers([]);
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchUsers();
    }, [shouldRefresh]);

    // 2. Fetch Management Members
    useEffect(() => {
        const fetchMembers = async () => {
            setIsLoadingMembers(true);
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) {
                    setManagementMembers([]);
                    return;
                }
                const data = await api.getManagementMembersApi();
                if (Array.isArray(data)) {
                    setManagementMembers(data);
                } else {
                    setManagementMembers([]);
                }
            } catch (error) {
                console.error("Gagal mengambil data anggota manajemen:", error);
                setManagementMembers([]);
            } finally {
                setIsLoadingMembers(false);
            }
        };
        fetchMembers();
    }, [shouldRefresh]);

    useEffect(() => {
        const fetchHosts = async () => {
            // Jika Anda ingin state loading, buat state [isLoadingHosts, setIsLoadingHosts] = useState(false)
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) return;

                // Memanggil API getHostsApi yang sudah ada di services/api.ts
                const data = await api.getHostsApi();

                if (Array.isArray(data)) {
                    setHosts(data);
                }
            } catch (error) {
                console.error("Gagal mengambil data hosts:", error);
            }
        };
        fetchHosts();
    }, [shouldRefresh]);

    // 3. Fetch Management Meetings
    useEffect(() => {
        const fetchMeetings = async () => {
            setIsLoadingMeetings(true);
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) {
                    setManagementMeetings([]);
                    return;
                }
                const data = await api.getManagementMeetings();
                if (Array.isArray(data)) {
                    setManagementMeetings(data);
                } else {
                    setManagementMeetings([]);
                }
            } catch (error) {
                console.error("Gagal mengambil data rapat:", error);
                setManagementMeetings([]);
            } finally {
                setIsLoadingMeetings(false);
            }
        };
        fetchMeetings();
    }, [shouldRefresh]);

    useEffect(() => {
        const fetchVisits = async () => {
            // Kita tidak set loading global agar tidak memblokir UI, tapi bisa dibuat state sendiri jika mau
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) return;

                const data = await api.getVisitsApi(); // Pastikan fungsi ini ada di api.ts

                if (Array.isArray(data)) {
                    // Normalisasi data jika perlu
                    const parsedVisits = data.map((v: any) => ({
                        ...v,
                        // Pastikan checkInTime jadi Date object
                        checkInTime: new Date(v.checkInTime),
                        // Jaga-jaga jika visitor null
                        visitor: v.visitor || { fullName: 'Unknown', email: '-' }
                    }));
                    setVisits(parsedVisits);
                }
            } catch (error) {
                console.error("Gagal mengambil data visits:", error);
            }
        };

        fetchVisits();
    }, [shouldRefresh]);

    // 4. Fetch Events (BARU: Mengambil acara dari database)
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoadingEvents(true);
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) {
                    setEvents([]);
                    return;
                }
                const data = await api.getEventsApi();
                // Konversi string date ke object Date
                if (Array.isArray(data)) {
                    const parsedData = data.map((e: any) => ({
                        ...e,
                        date: new Date(e.date)
                    }));
                    setEvents(parsedData);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error("Gagal mengambil data acara:", error);
                setEvents([]);
            } finally {
                setIsLoadingEvents(false);
            }
        };
        fetchEvents();
    }, [shouldRefresh]);

    useEffect(() => {
        const fetchBlacklist = async () => {
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) return;

                // Memanggil API GET /blacklist
                const data = await api.getBlacklistApi();

                if (Array.isArray(data)) {
                    // Masukkan data dari database ke State Lokal
                    setBlacklist(data.map((b: any) => ({
                        ...b,
                        addedAt: new Date(b.addedAt) // Konversi string tanggal ke object Date
                    })));
                }
            } catch (error) {
                console.error("Gagal mengambil data blacklist:", error);
            }
        };
        fetchBlacklist();
    }, [shouldRefresh]);

    const mapTypeToAction = (type: string) => {
        const upperType = type?.toUpperCase() || '';
        if (upperType.includes('CHECKIN')) return 'MANAJEMEN PENGGUNA';
        if (upperType.includes('CHECKOUT')) return 'MANAJEMEN PENGGUNA';
        if (upperType.includes('BLACKLIST')) return 'MANAJEMEN DAFTAR HITAM';
        if (upperType.includes('EVENT')) return 'MANAJEMEN ACARA';
        if (upperType.includes('SYSTEM')) return 'PERINGATAN KEAMANAN';
        return upperType;
    };

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                const token = localStorage.getItem('vms_token');
                if (!token) return;

                // 1. Panggil API Backend
                const data = await api.getActivityLogApi();

                if (Array.isArray(data)) {
                    // 2. Mapping data dari format Backend (ActivityLog) ke format Frontend (AuditLogEntry)
                    // Backend mengirim: { type, text, timestamp }
                    // Frontend AuditLogPage butuh: { action, details, timestamp }

                    const parsedLogs = data.map((log: any) => ({
                        id: log.id,
                        timestamp: new Date(log.timestamp), // Konversi string ke Date
                        action: mapTypeToAction(log.type),  // Helper untuk sesuaikan nama aksi
                        details: log.text || log.details || 'Tanpa Keterangan',
                        user: log.user || 'System'
                    }));

                    // Update State
                    setAuditLog(parsedLogs);

                    // Opsional: Update juga ActivityLog untuk dashboard jika menggunakan sumber yang sama
                    setActivityLog(data.map((l: any) => ({
                        ...l,
                        timestamp: new Date(l.timestamp)
                    })));
                }
            } catch (error) {
                console.error("Gagal mengambil data audit log:", error);
            }
        };

        fetchAuditLogs();
    }, [shouldRefresh]);

    // --- LOGIKA VISITS ---
    const preregisterGuest = (data: Partial<Visit>): Visit => {
        const newVisit: Visit = {
            id: Math.random().toString(36).substr(2, 9),
            status: VisitStatus.Expected,
            checkInTime: data.visitTime || new Date(),
            checkOutTime: null,
            checkinCode: Math.floor(100000 + Math.random() * 900000).toString(),
            visitor: data.visitor!,
            host: data.host,
            destination: data.destination,
            purpose: data.purpose || 'Tamu',
            photoUrl: '',
            signatureDataUrl: ''
        };
        setVisits(prev => [...prev, newVisit]);
        addActivity('system', `Pra-registrasi tamu: ${data.visitor?.fullName}`);
        return newVisit;
    };

    // --- LOGIKA CHECK-IN (DIPERBAIKI) ---
    const checkInVisitor = async (dataOrId: any): Promise<{ success: boolean; message?: string; visit?: Visit }> => {
        try {
            // Cek apakah input berupa ID (string) atau Objek Data Tamu
            const isIdString = typeof dataOrId === 'string';
            const visitId = isIdString ? dataOrId : dataOrId.id;

            let finalVisit: Visit;

            // KONDISI 1: WALK-IN (Tamu Baru / ID Kosong) -> Panggil API CREATE
            if (!isIdString && (!visitId || visitId === '')) {
                // Bersihkan ID kosong sebelum kirim ke API agar tidak error
                const { id, ...newVisitData } = dataOrId;
                
                // Tambahkan status dan waktu default
                const payload = {
                    ...newVisitData,
                    status: VisitStatus.OnSite,
                    checkInTime: new Date()
                };

                // Panggil endpoint POST /visits
                finalVisit = await api.addVisitApi(payload);
                
                // Update State Lokal: Tambahkan ke paling atas
                setVisits(prev => [finalVisit, ...prev]);
                addActivity('checkin', `Walk-in Guest: ${finalVisit.visitor.fullName}`);
            } 
            // KONDISI 2: PRE-REGISTERED / QR SCAN (Ada ID) -> Panggil API UPDATE
            else {
                // Panggil endpoint PUT /visits/:id
                finalVisit = await api.checkInVisitApi(visitId);

                // Update State Lokal: Update data yang cocok
                setVisits(prev => prev.map(v => {
                    if (v.id === visitId) {
                        return { 
                            ...v, 
                            ...finalVisit, // Gabungkan data terbaru dari API
                            status: VisitStatus.OnSite, 
                            checkInTime: new Date() 
                        };
                    }
                    return v;
                }));
                addActivity('checkin', `Tamu check-in: ${finalVisit.visitor?.fullName || 'Tamu'}`);
            }

            // PENTING: Kembalikan objek 'visit' agar KioskPage bisa menampilkan tiket/sukses
            return { success: true, message: 'Check-in Berhasil', visit: finalVisit };

        } catch (error) {
            console.error("Gagal Check-in:", error);
            return { success: false, message: 'Gagal menghubungi server' };
        }
    };

    const checkoutVisitor = async (visitId: string) => {
        setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: VisitStatus.CheckedOut, checkOutTime: new Date() } : v));
        addActivity('checkout', `Tamu check-out.`);
    };

    const checkoutVisitorByCode = (code: string) => {
        const visit = visits.find(v => v.checkinCode === code && v.status === VisitStatus.OnSite);
        if (visit) {
            checkoutVisitor(visit.id);
            return { success: true, message: `Berhasil checkout: ${visit.visitor.fullName}` };
        }
        return { success: false, message: 'Kode tidak ditemukan.' };
    };

    const findPreregisteredGuestByCode = async (code: string): Promise<Visit | null> => {
        try {
            // Panggil API langsung agar data selalu FRESH dari database
            const visit = await api.getVisitByCodeApi(code);
            return visit;
        } catch (error) {
            console.error("Error finding guest:", error);
            return null;
        }
    };

    const checkInPreregisteredGuest = async (visitId: string, photoUrl: string) => {
        try {
            // 1. Panggil API Backend untuk simpan status check-in
            // Pastikan api.checkInVisitApi sudah benar (mengirim status ON_SITE)
            const updatedVisitFromApi = await api.checkInVisitApi(visitId);

            // 2. Update State Lokal
            setVisits(prev => {
                const visitIndex = prev.findIndex(v => v.id === visitId);
                if (visitIndex > -1) {
                    const newVisits = [...prev];
                    // Gabungkan data API dengan URL foto baru
                    newVisits[visitIndex] = {
                        ...updatedVisitFromApi,
                        visitor: { ...updatedVisitFromApi.visitor, photoUrl }
                    };
                    return newVisits;
                } else {
                    // Jika data belum ada di state lokal (misal baru diambil via kode), tambahkan.
                    return [
                        { ...updatedVisitFromApi, visitor: { ...updatedVisitFromApi.visitor, photoUrl } },
                        ...prev
                    ];
                }
            });

            addActivity('checkin', `${updatedVisitFromApi.visitor.fullName} (Pra-reg) check-in.`);
            return { success: true, visit: updatedVisitFromApi };

        } catch (error) {
            console.error("Gagal Check-in Pra-registrasi:", error);
            return { success: false, message: 'Gagal menghubungi server database.' };
        }
    };


    // --- LOGIKA MANAGEMENT MEMBERS ---
    const addManagementMember = async (data: Omit<ManagementMember, 'id'>) => {
        try {
            const savedMember = await api.addManagementMemberApi(data);
            setManagementMembers(prev => [savedMember, ...prev]);
            addActivity('system', `Sukses menambah anggota: ${data.fullName}`);
        } catch (error) {
            console.error("Gagal menyimpan:", error);
        }
    };

    const updateManagementMember = async (id: string, data: Partial<ManagementMember>) => {
        try {
            const updated = await api.updateManagementMemberApi(id, data);
            if (updated) {
                setManagementMembers(prev => prev.map(m => m.id === id ? updated : m));
            }
        } catch (error) {
            console.error("Gagal update member:", error);
        }
    };

    const deleteManagementMember = async (id: string) => {
        try {
            await api.deleteManagementMemberApi(id);
            setManagementMembers(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Gagal hapus member:", error);
        }
    };

    const importManagementMembers = async (data: Omit<ManagementMember, 'id'>[]): Promise<number> => {
        try {
            const res = await api.importManagementMembersApi(data);
            refreshUserData();
            return res.count;
        } catch (error) {
            console.error("Gagal import:", error);
            return 0;
        }
    };

    // --- LOGIKA MANAGEMENT MEETINGS ---
    const createManagementMeeting = async (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => {
        try {
            const newMeeting = await api.createManagementMeetingApi(data);
            setManagementMeetings(prev => [newMeeting, ...prev]);
            addActivity('system', `Rapat baru: ${data.title}`);
        } catch (error) {
            console.error("Gagal buat meeting:", error);
        }
    };

    const updateMeeting = async (id: string, data: Partial<ManagementMeeting>) => {
        try {
            const updated = await api.updateManagementMeetingApi(id, data);
            if (updated) {
                setManagementMeetings(prev => prev.map(m => m.id === id ? updated : m));
            }
        } catch (error) {
            console.error("Gagal update meeting:", error);
        }
    };

    const deleteManagementMeeting = async (id: string) => {
        try {
            await api.deleteManagementMeetingApi(id);
            setManagementMeetings(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Gagal hapus meeting:", error);
        }
    };

    const duplicateManagementMeeting = async (id: string) => {
        try {
            const duplicated = await api.duplicateManagementMeetingApi(id);
            if (duplicated) {
                setManagementMeetings(prev => [duplicated, ...prev]);
            }
        } catch (error) {
            console.error("Gagal duplikasi meeting:", error);
        }
    };

    const inviteMembersToMeeting = async (meetingId: string, memberIds: string[]) => {
        try {
            const result = await api.inviteMembersToMeetingApi(meetingId, memberIds);
            if (result.success && result.updatedMeeting) {
                setManagementMeetings(prev => prev.map(m => m.id === meetingId ? result.updatedMeeting! : m));
            }
            return { success: result.success, count: memberIds.length };
        } catch (error) {
            console.error("Gagal invite member:", error);
            return { success: false, count: 0 };
        }
    };

    const markMeetingAttendance = (meetingId: string, identifier: string, signatureDataUrl: string) => {
        const member = managementMembers.find(m => m.id === identifier || m.nidn === identifier || m.phone === identifier);
        if (!member) return { success: false, message: 'Anggota tidak ditemukan.' };

        setManagementMeetings(prev => prev.map(m => {
            if (m.id === meetingId) {
                if (m.attendees.some(a => a.memberId === member.id)) return m;
                return {
                    ...m,
                    attendees: [...m.attendees, { memberId: member.id, checkInTime: new Date(), signatureDataUrl }]
                };
            }
            return m;
        }));
        return { success: true, memberName: member.fullName };
    };

    const removeMeetingAttendance = async (meetingId: string, memberId: string) => {
        try {
            const updated = await api.removeMeetingAttendanceApi(meetingId, memberId);
            if (updated) {
                setManagementMeetings(prev => prev.map(m => m.id === meetingId ? updated : m));
            }
        } catch (error) {
            console.error("Gagal hapus kehadiran:", error);
        }
    };

    // --- LOGIKA EVENTS (DIPERBAIKI) ---
    // Sekarang memanggil API, bukan hanya state lokal
    const createEvent = async (eventData: any) => {
        try {
            const savedEvent = await api.createEventApi(eventData);
            // Parse tanggal agar sesuai dengan tipe data di frontend
            const parsedEvent = {
                ...savedEvent,
                date: new Date(savedEvent.date)
            };
            setEvents(prev => [parsedEvent, ...prev]);
            addActivity('system', `Acara baru dibuat: ${savedEvent.name}`);
        } catch (error) {
            console.error("Gagal membuat acara:", error);
            throw error;
        }
    };


    // --- USER MANAGEMENT ---
    const addUser = async (userData: any) => {
        try {
            const savedUser = await api.addUserApi(userData);
            setUsers(prev => [savedUser, ...prev]);
            addActivity('system', `User baru ditambahkan: ${savedUser.name}`);
        } catch (error) {
            console.error("Gagal menambah user:", error);
            throw error;
        }
    };

    const updateUser = async (id: string, data: any) => {
        try {
            const updatedUser = await api.updateUserApi(id, data);
            if (updatedUser) {
                setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
                addActivity('system', `User diupdate: ${updatedUser.name}`);
            }
        } catch (error) {
            console.error("Gagal update user:", error);
            throw error;
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await api.deleteUserApi(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            addActivity('system', `User dihapus (ID: ${id})`);
        } catch (error) {
            console.error("Gagal hapus user:", error);
            throw error;
        }
    };

    // --- UTILS ---
    const setOffline = (status: boolean) => { setIsOfflineState(status); return 0; };
    const addToBlacklist = async (person: Omit<BlacklistedPerson, 'id' | 'addedAt'>) => {
        try {
            // Panggil API Backend
            const savedPerson = await api.addBlacklistApi(person);

            // Update State Lokal dengan data dari Backend (termasuk ID dan tanggal)
            const parsedPerson = {
                ...savedPerson,
                addedAt: new Date(savedPerson.addedAt)
            };

            setBlacklist(prev => [parsedPerson, ...prev]);
            addActivity('system', `Menambahkan ke daftar hitam: ${person.fullName}`);
        } catch (error) {
            console.error("Gagal menyimpan ke blacklist:", error);
            // Opsional: Tampilkan alert atau notifikasi error ke user
        }
    };

    const registerForEvent = async (event: any, visitorData: any) => {
        try {
            // 1. Panggil API Backend
            const newVisit = await api.registerForEventApi(event, visitorData);

            // 2. Tambahkan ke state lokal agar terlihat (opsional, untuk admin)
            // Parse tanggal agar tidak error di UI
            const parsedVisit = {
                ...newVisit,
                checkInTime: new Date(newVisit.checkInTime),
                visitor: {
                    ...newVisit.visitor,
                    // Pastikan foto ada (fallback jika backend tidak mengirim)
                    photoUrl: newVisit.visitor.photoUrl || `https://ui-avatars.com/api/?name=${newVisit.visitor.fullName}`
                }
            };

            setVisits(prev => [parsedVisit, ...prev]);
            addActivity('preregister', `Pendaftaran Publik: ${visitorData.fullName} untuk ${event.name}`);

            return parsedVisit;
        } catch (error) {
            console.error("Gagal melakukan registrasi event:", error);
            throw error; // Lempar error agar bisa ditangkap oleh Modal (untuk stop loading spinner)
        }
    };
    const checkInEventGuest = async (visitId: string) => {
        try {
            // 1. Panggil API Backend (pastikan api.ts sudah diperbaiki menggunakan Enum)
            const updatedVisit = await api.checkInVisitApi(visitId);

            // 2. Update State Lokal 'visits' agar UI langsung berubah jadi "Terverifikasi"
            setVisits(prev => prev.map(v => {
                if (v.id === visitId) {
                    return {
                        ...v,
                        status: VisitStatus.OnSite, // Ubah status lokal
                        checkInTime: new Date(),    // Update waktu
                        ...updatedVisit             // Gabungkan dengan data terbaru dari backend
                    };
                }
                return v;
            }));

            addActivity('checkin', `Peserta acara check-in: ${updatedVisit.visitor?.fullName || 'Tamu'}`);
            return { success: true };
        } catch (error) {
            console.error("Gagal check-in acara:", error);
            return { success: false, message: 'Gagal menghubungi server.' };
        }
    };

    const purgeOldVisits = (m: number) => 0;
    const runAutoCheckout = () => 0;

    // --- VALUE OBJECT ---
    const value: DataContextType = {
        visits, hosts, isLoadingVisits: false, isLoadingHosts: false,
        preregisterGuest, checkInVisitor, checkoutVisitor, checkoutVisitorByCode,
        findPreregisteredGuestByCode, checkInPreregisteredGuest,

        visitorTrends: { onSite: [10, 15, 8, 12, 20], expected: [5, 8, 12, 10, 15] },
        activityLog, calendarEvents, isLoadingActivityLog: false,
        isOffline, offlineQueueCount: 0, setOffline,

        // MEMBER & MEETING DATA
        managementMembers,
        isLoadingMembers,
        addManagementMember, updateManagementMember, deleteManagementMember, importManagementMembers,

        managementMeetings,
        isLoadingMeetings,
        createManagementMeeting, updateMeeting, deleteManagementMeeting, duplicateManagementMeeting,
        inviteMembersToMeeting, markMeetingAttendance, removeMeetingAttendance,

        // EVENTS DATA (Sudah Terhubung)
        events,
        isLoadingEvents,
        createEvent,

        blacklist,

        // Users Data & Functions
        users,
        isLoadingUsers,
        auditLog,
        addToBlacklist, registerForEvent, checkInEventGuest,
        purgeOldVisits, runAutoCheckout,
        addUser, updateUser, deleteUser,
        refreshUserData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
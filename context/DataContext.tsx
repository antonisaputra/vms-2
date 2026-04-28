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
    visits: Visit[];
    hosts: Host[];
    isLoadingVisits: boolean;
    isLoadingHosts: boolean;
    preregisterGuest: (data: Partial<Visit>) => Visit;
    checkInVisitor: (data: any) => Promise<{ success: boolean, message?: string }>;
    checkoutVisitor: (visitId: string) => Promise<void>;
    checkoutVisitorByCode: (code: string) => { success: boolean; message?: string };

    visitorTrends: { onSite: number[], expected: number[] };
    activityLog: ActivityLog[];
    calendarEvents: CalendarEvent[];
    isLoadingActivityLog: boolean;
    isOffline: boolean;
    offlineQueueCount: number;
    setOffline: (status: boolean) => number;

    managementMembers: ManagementMember[];
    isLoadingMembers: boolean;
    addManagementMember: (data: Omit<ManagementMember, 'id'>) => Promise<void>;
    updateManagementMember: (id: string, data: Partial<ManagementMember>) => Promise<void>;
    deleteManagementMember: (id: string) => Promise<void>;
    importManagementMembers: (data: Omit<ManagementMember, 'id'>[]) => Promise<number>;

    managementMeetings: ManagementMeeting[];
    isLoadingMeetings: boolean;
    createManagementMeeting: (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => Promise<void>;
    updateMeeting: (id: string, data: Partial<ManagementMeeting>) => Promise<void>;
    deleteManagementMeeting: (id: string) => Promise<void>;
    duplicateManagementMeeting: (id: string) => Promise<void>;
    inviteMembersToMeeting: (meetingId: string, memberIds: string[]) => Promise<{ success: boolean; count: number }>;
    markMeetingAttendance: (meetingId: string, identifier: string, signatureDataUrl: string) => Promise<{ success: boolean; memberName?: string; message?: string }>;
    removeMeetingAttendance: (meetingId: string, memberId: string) => Promise<void>;

    events: Event[];
    isLoadingEvents: boolean;
    blacklist: BlacklistedPerson[];
    users: User[];
    isLoadingUsers: boolean;
    auditLog: AuditLogEntry[];
    addToBlacklist: (person: Omit<BlacklistedPerson, 'id' | 'addedAt'>) => Promise<void>;
    createEvent: (event: any) => Promise<void>;
    registerForEvent: (event: any, visitor: any) => Promise<any>;
    checkInEventGuest: (visitId: string) => Promise<any>;
    purgeOldVisits: (months: number) => number;
    runAutoCheckout: () => number;
    addUser: (user: any) => Promise<void>;
    updateUser: (id: string, data: any) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    refreshUserData: () => void;
    checkInPreregisteredGuest: (visitId: string, photoUrl: string) => Promise<{ success: boolean, visit?: Visit, message?: string }>;
    findPreregisteredGuestByCode: (code: string) => Promise<Visit | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [hosts, setHosts] = useState<Host[]>([]);
    const [managementMembers, setManagementMembers] = useState<ManagementMember[]>([]);
    const [managementMeetings, setManagementMeetings] = useState<ManagementMeeting[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [blacklist, setBlacklist] = useState<BlacklistedPerson[]>([]);
    const [isOffline, setIsOfflineState] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [shouldRefresh, setShouldRefresh] = useState(0);

    const refreshUserData = () => setShouldRefresh(prev => prev + 1);

    const addActivity = async (type: ActivityLog['type'], text: string) => {
        try {
            await api.addActivityLogApi({ type, text });
            refreshUserData();
        } catch (e) { console.warn(e); }
    };

    // --- EFFECT: FETCH SEMUA DATA ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('vms_token');
            if (!token) return;

            try {
                const [usersData, membersData, meetingsData, visitsData, eventsData, blacklistData] = await Promise.all([
                    api.getUsersApi(),
                    api.getManagementMembersApi(),
                    api.getManagementMeetings(),
                    api.getVisitsApi(),
                    api.getEventsApi(),
                    api.getBlacklistApi()
                ]);

                if (Array.isArray(usersData)) setUsers(usersData);
                if (Array.isArray(membersData)) setManagementMembers(membersData);
                if (Array.isArray(meetingsData)) setManagementMeetings(meetingsData);
                if (Array.isArray(visitsData)) setVisits(visitsData);
                if (Array.isArray(eventsData)) setEvents(eventsData);
                if (Array.isArray(blacklistData)) setBlacklist(blacklistData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoadingMembers(false);
                setIsLoadingMeetings(false);
                setIsLoadingEvents(false);
            }
        };
        fetchData();
    }, [shouldRefresh]);

    // --- IMPLEMENTASI FUNGSI MANAGEMENT MEETINGS (FIXED) ---
    const createManagementMeeting = async (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => {
        try {
            const newMeeting = await api.createManagementMeetingApi(data);
            setManagementMeetings(prev => [newMeeting, ...prev]);
            addActivity('system', `Rapat baru: ${data.title}`);
        } catch (error) {
            console.error("Gagal buat meeting:", error);
            throw error;
        }
    };

    const updateMeeting = async (id: string, data: Partial<ManagementMeeting>) => {
        try {
            // 1. Panggil API dan TAMPUNG hasilnya (updatedMeeting)
            const updatedMeeting = await api.updateManagementMeetingApi(id, data);

            if (updatedMeeting) {
                // 2. Update state global. Ini akan memicu re-render pada ManagementPage 
                // dan mengirimkan props 'meeting' terbaru ke MeetingDetailModal
                setManagementMeetings(prev =>
                    prev.map(m => m.id === id ? updatedMeeting : m)
                );

                // 3. Pastikan refreshUserData dipanggil jika komponen lain bergantung pada audit log
                refreshUserData();
            }
        } catch (error) {
            console.error("Gagal update meeting:", error);
            throw error;
        }
    };

    const deleteManagementMeeting = async (id: string) => {
        try {
            await api.deleteManagementMeetingApi(id);
            setManagementMeetings(prev => prev.filter(m => m.id !== id));
        } catch (error) { console.error(error); }
    };

    const duplicateManagementMeeting = async (id: string) => {
        try {
            const duplicated = await api.duplicateManagementMeetingApi(id);
            setManagementMeetings(prev => [duplicated, ...prev]);
        } catch (error) { console.error(error); }
    };

    const markMeetingAttendance = async (meetingId: string, identifier: string, signatureDataUrl: string) => {
        try {
            const member = managementMembers.find(m => m.nidn === identifier || m.id === identifier);
            if (!member) return { success: false, message: 'NIDN tidak terdaftar' };

            const result = await api.markMeetingAttendanceApi(meetingId, member.id, signatureDataUrl);
            if (result.success) {
                refreshUserData();
                return { success: true, memberName: result.memberName };
            }
            return { success: false, message: 'Gagal mencatat kehadiran' };
        } catch (error) {
            return { success: false, message: 'Koneksi database terputus' };
        }
    };

    // --- VALUE OBJECT: HUBUNGKAN SEMUA FUNGSI KE PROVIDER ---
    const value: DataContextType = {
        visits, hosts, isLoadingVisits: false, isLoadingHosts: false,
        preregisterGuest: (d) => ({ id: 'temp', ...d } as Visit),
        checkInVisitor: async (d) => ({ success: true }),
        checkoutVisitor: async (id) => { },
        checkoutVisitorByCode: (c) => ({ success: true }),
        visitorTrends: { onSite: [], expected: [] },
        activityLog, calendarEvents, isLoadingActivityLog: false,
        isOffline, offlineQueueCount: 0, setOffline: (s) => 0,

        managementMembers,
        isLoadingMembers,
        addManagementMember: async (d) => { await api.addManagementMemberApi(d); refreshUserData(); },
        updateManagementMember: async (id, d) => { await api.updateManagementMemberApi(id, d); refreshUserData(); },
        deleteManagementMember: async (id) => { await api.deleteManagementMemberApi(id); refreshUserData(); },
        importManagementMembers: async (d) => { const res = await api.importManagementMembersApi(d); refreshUserData(); return res.count; },

        managementMeetings,
        isLoadingMeetings,
        createManagementMeeting, // Sekarang terhubung ke fungsi asli
        updateMeeting,           // Sekarang terhubung ke fungsi asli
        deleteManagementMeeting, // Sekarang terhubung ke fungsi asli
        duplicateManagementMeeting, // Sekarang terhubung ke fungsi asli
        inviteMembersToMeeting: async (mid, ids) => { const res = await api.inviteMembersToMeetingApi(mid, ids); refreshUserData(); return { success: res.success, count: ids.length }; },
        markMeetingAttendance,
        removeMeetingAttendance: async (mid, memid) => { await api.removeMeetingAttendanceApi(mid, memid); refreshUserData(); },

        events, isLoadingEvents, createEvent: async (e) => { await api.createEventApi(e); refreshUserData(); },
        blacklist, users, isLoadingUsers, auditLog,
        addToBlacklist: async (p) => { await api.addBlacklistApi(p); refreshUserData(); },
        registerForEvent: async (e, v) => { return await api.registerForEventApi(e, v); },
        checkInEventGuest: async (id) => { return await api.checkInVisitApi(id); },
        purgeOldVisits: (m) => 0,
        runAutoCheckout: () => 0,
        addUser: async (u) => { await api.addUserApi(u); refreshUserData(); },
        updateUser: async (id, d) => { await api.updateUserApi(id, d); refreshUserData(); },
        deleteUser: async (id) => { await api.deleteUserApi(id); refreshUserData(); },
        refreshUserData,
        checkInPreregisteredGuest: async (id, p) => { return await api.checkInVisitApi(id); },
        findPreregisteredGuestByCode: async (c) => { return await api.getVisitByCodeApi(c); }
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
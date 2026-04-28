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

    // Management Members
    managementMembers: ManagementMember[];
    isLoadingMembers: boolean;
    addManagementMember: (data: Omit<ManagementMember, 'id'>) => Promise<void>;
    updateManagementMember: (id: string, data: Partial<ManagementMember>) => Promise<void>;
    deleteManagementMember: (id: string) => Promise<void>;
    importManagementMembers: (data: Omit<ManagementMember, 'id'>[]) => Promise<number>;

    // Management Meetings
    managementMeetings: ManagementMeeting[];
    isLoadingMeetings: boolean;
    createManagementMeeting: (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>) => Promise<void>;
    updateMeeting: (id: string, data: Partial<ManagementMeeting>) => Promise<void>;
    deleteManagementMeeting: (id: string) => Promise<void>;
    duplicateManagementMeeting: (id: string) => Promise<void>;
    inviteMembersToMeeting: (meetingId: string, memberIds: string[]) => Promise<{ success: boolean; count: number }>;

    // PERBAIKAN: Sesuaikan nama fungsi dengan yang dipanggil di Modal
    markMeetingAttendance: (meetingId: string, identifier: string, signatureDataUrl: string) => Promise<{ success: boolean; memberName?: string; message?: string }>;
    removeMeetingAttendance: (meetingId: string, memberId: string) => Promise<void>;

    // Events & Others
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

    // --- IMPLEMENTASI MARK ATTENDANCE (DIPERBAIKI) ---
    const markMeetingAttendance = async (meetingId: string, identifier: string, signatureDataUrl: string) => {
        try {
            const member = managementMembers.find(m => m.nidn === identifier || m.id === identifier);
            if (!member) return { success: false, message: 'NIDN tidak terdaftar' };

            // Panggil fungsi API yang sudah dibuat di langkah 3
            const result = await api.markMeetingAttendanceApi(meetingId, member.id, signatureDataUrl);

            if (result.success) {
                refreshUserData(); // Refresh data agar UI terupdate
                return { success: true, memberName: result.memberName };
            }
            return { success: false, message: 'Gagal mencatat kehadiran' };
        } catch (error) {
            console.error("Error markAttendance:", error);
            return { success: false, message: 'Koneksi database terputus' };
        }
    };

    // --- FETCH DATA EFFECTS ---
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

    // --- OTHER FUNCTIONS (WRAP WITH ASYNC/AWAIT) ---
    const addManagementMember = async (data: any) => {
        const res = await api.addManagementMemberApi(data);
        setManagementMembers(prev => [res, ...prev]);
        refreshUserData();
    };

    const deleteManagementMember = async (id: string) => {
        await api.deleteManagementMemberApi(id);
        setManagementMembers(prev => prev.filter(m => m.id !== id));
    };

    const addActivity = async (type: ActivityLog['type'], text: string) => {
        try {
            await api.addActivityLogApi({ type, text });
            refreshUserData();
        } catch (e) { console.warn(e); }
    };

    // ... Sisa fungsi lainnya (updateMeeting, createEvent, dll) panggil api.ts ...

    const value: DataContextType = {
        visits, hosts, isLoadingVisits: false, isLoadingHosts: false,
        preregisterGuest: (d) => ({ id: 'temp', ...d } as Visit), // Dummy implementation
        checkInVisitor: async (d) => ({ success: true }),
        checkoutVisitor: async (id) => { },
        checkoutVisitorByCode: (c) => ({ success: true }),
        visitorTrends: { onSite: [], expected: [] },
        activityLog, calendarEvents, isLoadingActivityLog: false,
        isOffline, offlineQueueCount: 0, setOffline: (s) => 0,
        managementMembers, isLoadingMembers, addManagementMember,
        updateManagementMember: async (id, d) => { },
        deleteManagementMember,
        importManagementMembers: async (d) => 0,
        managementMeetings, isLoadingMeetings,
        createManagementMeeting: async (d) => { },
        updateMeeting: async (id, d) => { },
        deleteManagementMeeting: async (id) => { },
        duplicateManagementMeeting: async (id) => { },
        inviteMembersToMeeting: async (mid, ids) => ({ success: true, count: ids.length }),
        markMeetingAttendance, // Gunakan fungsi yang sudah diperbaiki
        removeMeetingAttendance: async (mid, memid) => { },
        events, isLoadingEvents, createEvent: async (e) => { },
        blacklist, users, isLoadingUsers, auditLog,
        addToBlacklist: async (p) => { },
        registerForEvent: async (e, v) => { },
        checkInEventGuest: async (id) => { },
        purgeOldVisits: (m) => 0,
        runAutoCheckout: () => 0,
        addUser: async (u) => { },
        updateUser: async (id, d) => { },
        deleteUser: async (id) => { },
        refreshUserData,
        checkInPreregisteredGuest: async (id, p) => ({ success: true }),
        findPreregisteredGuestByCode: async (c) => null
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
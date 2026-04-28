// This file simulates the NestJS/MySQL backend.
// It has its own in-memory "database".
import { ManagementMember, ManagementMeeting, Visit, Visitor, BlacklistedPerson, VisitStatus, Event, User, UserRole, Host, ActivityLog } from '../types';

// const API_BASE_URL = 'https://api-vms.hamzanwadi.ac.id/api';
const API_BASE_URL = 'http://127.0.0.1:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('vms_token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};


// services/api.ts

// Tambahkan fungsi ini
export const checkInVisitApi = async (visitId: string): Promise<Visit> => {
    const response = await fetch(`${API_BASE_URL}/visits/${visitId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            status: VisitStatus.OnSite, // <--- PERBAIKAN: Gunakan Enum, jangan string manual
            checkInTime: new Date().toISOString()
        }),
    });

    if (!response.ok) {
        throw new Error('Gagal melakukan check-in');
    }
    return await response.json();
};

// --- AUTH Functions ---
// services/api.ts
export const loginApi = async (credentials: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        // Coba ambil pesan detail dari backend jika ada
        const errorData = await response.json().catch(() => null); 
        throw new Error(errorData?.message || `Login Gagal (Status: ${response.status})`);
    }
    return await response.json();
};


// --- Member Functions --- (NOW HITTING REAL API)

export const getManagementMembersApi = async () => {
    // FIX: URL diubah dari '/management-members' menjadi '/members'
    // FIX: Menambahkan headers token
    const response = await fetch(`${API_BASE_URL}/members`, { 
        headers: getAuthHeaders() 
    });
    
    if (!response.ok) {
        throw new Error('Gagal mengambil data anggota');
    }
    return response.json();
};

export const addManagementMemberApi = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/members`, { // Ubah ke /members
        method: 'POST',
        headers: getAuthHeaders(), // Gunakan helper ini agar token ikut terkirim
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menambah anggota');
    }
    return response.json();
};

export const updateManagementMemberApi = async (id: string, data: Partial<ManagementMember>): Promise<ManagementMember | null> => {
    console.log(`[API] PUT ${API_BASE_URL}/members/${id}`, data);
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update management member');
    }
    return await response.json();
};

export const deleteManagementMemberApi = async (id: string): Promise<{ success: boolean }> => {
    console.log(`[API] DELETE ${API_BASE_URL}/members/${id}`);
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return { success: response.ok };
};


export const importManagementMembersApi = async (newMembersData: (Omit<ManagementMember, 'id'>)[]): Promise<{ count: number }> => {
    console.log(`[API] POST ${API_BASE_URL}/members/import`, newMembersData);
    const response = await fetch(`${API_BASE_URL}/members/import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newMembersData),
    });
     if (!response.ok) {
        throw new Error('Failed to import members');
    }
    return await response.json();
};

// --- Meeting Functions --- (NOW HITTING REAL API)

export const getManagementMeetings = async (): Promise<ManagementMeeting[]> => {
    console.log(`[API] GET ${API_BASE_URL}/meetings`);
    try {
        const response = await fetch(`${API_BASE_URL}/meetings`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch meetings');
        const meetings = await response.json();
        // Sort by date descending on the client side
        return meetings.sort((a: ManagementMeeting, b: ManagementMeeting) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("API Error fetching meetings:", error);
        return [];
    }
};

export const createManagementMeetingApi = async (data: Omit<ManagementMeeting, 'id' | 'attendees' | 'invitedMemberIds'>): Promise<ManagementMeeting> => {
    console.log(`[API] POST ${API_BASE_URL}/meetings`, data);
    const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create meeting');
    return await response.json();
};

export const updateManagementMeetingApi = async (id: string, data: Partial<ManagementMeeting>): Promise<ManagementMeeting | null> => {
    console.log(`[API] PUT ${API_BASE_URL}/meetings/${id}`, data);
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update meeting');
    return await response.json();
};

export const deleteManagementMeetingApi = async (id: string): Promise<{ success: boolean }> => {
    console.log(`[API] DELETE ${API_BASE_URL}/meetings/${id}`);
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return { success: response.ok };
};

export const duplicateManagementMeetingApi = async (id: string): Promise<ManagementMeeting | null> => {
    console.log(`[API] POST ${API_BASE_URL}/meetings/${id}/duplicate`);
    const response = await fetch(`${API_BASE_URL}/meetings/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to duplicate meeting');
    return await response.json();
};

export const inviteMembersToMeetingApi = async (meetingId: string, memberIds: string[]): Promise<{ success: boolean, updatedMeeting?: ManagementMeeting }> => {
    console.log(`[API] POST ${API_BASE_URL}/meetings/${meetingId}/invite`, { memberIds });
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ memberIds }),
    });
    if (!response.ok) return { success: false };
    const updatedMeeting = await response.json();
    return { success: true, updatedMeeting };
};

export const removeMeetingAttendanceApi = async (meetingId: string, memberId: string): Promise<ManagementMeeting | null> => {
    console.log(`[API] DELETE ${API_BASE_URL}/meetings/${meetingId}/attendance/${memberId}`);
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/attendance/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove attendance');
    return await response.json();
};

// --- Visit Functions ---

export const getVisitsApi = async (): Promise<Visit[]> => {
    console.log(`[API] GET ${API_BASE_URL}/visits`);
    try {
        const response = await fetch(`${API_BASE_URL}/visits`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch visits');
        return await response.json();
    } catch (error) {
        console.error("API Error fetching visits:", error);
        return [];
    }
};

export const addVisitApi = async (visitData: Omit<Visit, 'id'>): Promise<Visit> => {
    console.log(`[API] POST ${API_BASE_URL}/visits`, visitData);
    const response = await fetch(`${API_BASE_URL}/visits`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(visitData),
    });

    if (!response.ok) {
        // Ambil pesan error detail dari backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Gagal menambahkan kunjungan';
        console.error("Backend Error Detail:", errorData); // Cek Console Browser Anda
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
    return await response.json();
};

export const updateVisitApi = async (id: string, data: Partial<Visit>): Promise<Visit | null> => {
    console.log(`[API] PUT ${API_BASE_URL}/visits/${id}`, data);
    const response = await fetch(`${API_BASE_URL}/visits/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update visit');
    return await response.json();
};


// --- Blacklist Functions ---
export const getBlacklistApi = async (): Promise<BlacklistedPerson[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/blacklist`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch blacklist');
        return await response.json();
    } catch (error) {
        console.error("API Error fetching blacklist:", error);
        return [];
    }
};

export const addBlacklistApi = async (personData: Omit<BlacklistedPerson, 'id' | 'addedAt'>): Promise<BlacklistedPerson> => {
    console.log(`[API] POST ${API_BASE_URL}/blacklist`, personData);
    const response = await fetch(`${API_BASE_URL}/blacklist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(personData),
    });
    if (!response.ok) throw new Error('Failed to add to blacklist');
    return await response.json();
};

// --- Host Functions ---
export const getHostsApi = async (): Promise<Host[]> => {
    console.log(`[API] GET ${API_BASE_URL}/hosts`);
    try {
        const response = await fetch(`${API_BASE_URL}/hosts`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch hosts');
        return await response.json();
    } catch (error) {
        console.error("API Error fetching hosts:", error);
        return [];
    }
};


// --- Event Functions ---
export const getEventsApi = async (): Promise<Event[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, { 
            headers: getAuthHeaders() // <--- Jangan dihapus!
        });
        
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    } catch (error) {
        console.error("API Error fetching events:", error);
        return []; 
    }
};

export const getVisitByCodeApi = async (code: string): Promise<Visit | null> => {
    try {
        const visits = await getVisitsApi(); 
        
        // Perbaikan: Gunakan VisitStatus.Expected dari import '../types'
        // Pastikan juga kode dicek tanpa mempedulikan huruf besar/kecil (opsional tapi disarankan)
        const found = visits.find((v: Visit) => 
            v.checkinCode.toUpperCase() === code.toUpperCase() && 
            v.status === VisitStatus.Expected
        );
        
        return found || null;
    } catch (error) {
        console.error("Gagal mencari visit by code:", error);
        return null; 
    }
};

// --- 2. UNTUK PUBLIC / TAMU (Detail Acara) ---
// Dipakai di App.tsx saat membuka link registrasi
// JANGAN PAKAI HEADER TOKEN agar tamu bisa akses tanpa login
export const getEventByIdApi = async (id: string): Promise<Event | null> => {
    try {
        // Endpoint ini harus bersifat PUBLIC di backend (tanpa @UseGuards)
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("API Error fetching single event:", error);
        return null;
    }
};

export const createEventApi = async (eventData: Omit<Event, 'id' | 'registrationLink'>): Promise<Event> => {
    console.log(`[API] POST ${API_BASE_URL}/events`, eventData);
    const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return await response.json();
};

export const registerForEventApi = async (event: Event, visitorData: any): Promise<Visit> => {
    // Endpoint harus sesuai dengan backend: /events/:id/register
    const response = await fetch(`${API_BASE_URL}/events/${event.id}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Token tidak wajib untuk pendaftaran publik, tapi getAuthHeaders() aman digunakan
            ...getAuthHeaders() 
        },
        body: JSON.stringify(visitorData),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Gagal mendaftar acara');
    }
    return await response.json();
};


// --- User Functions --- (NOW HITTING REAL API)
export const getUsersApi = async (): Promise<User[]> => {
    console.log(`[API] GET ${API_BASE_URL}/users`);
    try {
        const response = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error("API Error fetching users:", error);
        return [];
    }
};

export const addUserApi = async (userData: Omit<User, 'id'>): Promise<User> => {
    console.log(`[API] POST ${API_BASE_URL}/users`, userData);
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to add user');
    return await response.json();
};

export const updateUserApi = async (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User | null> => {
    console.log(`[API] PUT ${API_BASE_URL}/users/${userId}`, userData);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
};

export const deleteUserApi = async (userId: string): Promise<{ success: boolean }> => {
    console.log(`[API] DELETE ${API_BASE_URL}/users/${userId}`);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return { success: response.ok };
};

// --- Activity Log Functions ---
export const getActivityLogApi = async (): Promise<ActivityLog[]> => {
    console.log(`[API] GET ${API_BASE_URL}/activity-log`);
    try {
        const response = await fetch(`${API_BASE_URL}/activity-log`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch activity log');
        return await response.json();
    } catch (error) {
        console.error("API Error fetching activity log:", error);
        return [];
    }
};

export const addActivityLogApi = async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> => {
    // Sesuaikan endpoint '/activity-log' dengan controller backend Anda
    const response = await fetch(`${API_BASE_URL}/activity-log`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(log),
    });
    if (!response.ok) throw new Error('Failed to add activity log');
    return await response.json();
};

// services/api.ts

export const markMeetingAttendanceApi = async (meetingId: string, memberId: string, signature: string) => {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/attendance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ memberId, signature }),
    });

    if (!response.ok) {
        throw new Error('Gagal menyimpan ke database');
    }
    return await response.json();
};
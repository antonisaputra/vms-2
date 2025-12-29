
export enum Page {
  Dashboard = 'Dashboard',
  Visitors = 'Tamu',
  Preregister = 'Pra-Registrasi',
  Blacklist = 'Daftar Hitam',
  Events = 'Acara',
  EventCheckin = 'Check-in Acara',
  AuditLog = 'Log Audit',
  HostDashboard = 'Tamu Saya',
  Settings = 'Pengaturan',
  Analitik = 'Analitik',
  UserManagement = 'Kelola Pengguna',
  Management = 'Manajemen Kampus', // New Page
}

export enum UserRole {
    Administrator = 'Administrator',
    Host = 'Host',
    Receptionist = 'Resepsionis',
    MeetingAdmin = 'Sekretaris Rapat', // New Role
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum VisitStatus {
  OnSite = 'On-Site',
  Expected = 'Diharapkan',
  CheckedOut = 'Sudah Check-out',
}

export interface Host {
  id: string;
  name: string;
  department: string;
  email: string;
}

export interface Visitor {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  photoUrl: string;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  registrationLink: string; // Simulated public link
}

export interface Visit {
  id: string;
  visitor: Visitor;
  host?: Host;
  destination?: string;
  purpose: string;
  status: VisitStatus;
  checkInTime: Date;
  checkOutTime?: Date;
  hostPickupTime?: Date;
  signatureDataUrl?: string;
  preregisteredBy?: string;
  checkinCode?: string;
  eventInfo?: {
    eventId: string;
    eventName: string;
  };
}

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: Date;
    host: Host;
    guestEmail: string;
}

export interface PreregistrationDraft {
    guestEmail: string;
    meetingDetails: string;
}

export interface BlacklistedPerson {
  id: string;
  fullName: string;
  reason: string;
  addedAt: Date;
}

export interface ActivityLog {
    id: string;
    type: 'checkin' | 'checkout' | 'preregister';
    text: string;
    timestamp: Date;
}

export interface Notification {
    id: number;
    message: string;
    type: 'alert' | 'success' | 'info';
}

export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    action: string;
    details: string;
}

export type OfflineActionPayload = 
  | { type: 'checkInVisitor', data: Omit<Visit, 'id' | 'status' | 'checkInTime'> }
  | { type: 'checkoutVisitorByCode', code: string }
  | { type: 'checkInPreregisteredGuest', visitId: string, photoUrl: string }
  | { type: 'markMeetingAttendance', meetingId: string, memberId: string, signatureDataUrl: string };

export interface OfflineQueueItem {
    id: string;
    payload: OfflineActionPayload;
}

export interface SmartToast {
    id: number;
    title: string;
    message: string;
    imageUrl: string;
}

// --- NEW TYPES FOR MANAGEMENT ---

export interface ManagementMember {
  id: string;
  nidn: string;
  fullName: string; // Nama Lengkap & Gelar
  faculty: string;
  studyProgram: string;
  position: string; // Jabatan di Manajemen
  phone: string;
  email: string;
  photoUrl: string; // Formal/Non-formal front facing
}

export interface MeetingAttendance {
    memberId: string;
    checkInTime: Date;
    signatureDataUrl: string;
}

export interface ManagementMeeting {
  id: string;
  title: string;
  date: Date;
  location: string;
  attendees: MeetingAttendance[];
  invitedMemberIds: string[]; // List of expected members
  minutes?: string; // Notulensi Rapat
}

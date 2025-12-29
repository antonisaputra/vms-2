
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, TabletIcon, WifiIcon, WifiOffIcon, LogoutIcon, SunIcon, MoonIcon, MenuIcon, AlertTriangleIcon, BellIcon, ScanLineIcon } from './icons';
import { Page, UserRole, SmartToast } from '../types';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
    activePage: Page;
    isOffline: boolean;
    onToggleOffline: () => void;
    offlineQueueCount: number;
    userRole: UserRole;
    onLogout: () => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onToggleMobileNav: () => void;
    onSwitchToKiosk: () => void;
    onPanic: () => void;
    notifications: SmartToast[];
    unreadNotificationCount: number;
    onMarkNotificationsAsRead: () => void;
    onQuickScan?: () => void;
}


const Header: React.FC<HeaderProps> = ({ activePage, isOffline, onToggleOffline, offlineQueueCount, userRole, onLogout, isDarkMode, onToggleDarkMode, onToggleMobileNav, onSwitchToKiosk, onPanic, notifications, unreadNotificationCount, onMarkNotificationsAsRead, onQuickScan }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const userInfo = {
      [UserRole.Administrator]: { name: "Admin Sistem", department: "IT / Superuser", avatar: "admin" },
      [UserRole.Receptionist]: { name: "Resepsionis", department: "Lobi Utama", avatar: "receptionist" },
      [UserRole.Host]: { name: "Dr. Budi Santoso", department: "Host (Dosen/Staf)", avatar: "host" },
      [UserRole.MeetingAdmin]: { name: "Sekretaris Rapat", department: "Manajemen & Agenda", avatar: "secretary" }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setNotificationPanelOpen(prev => !prev);
    if (!isNotificationPanelOpen) {
        onMarkNotificationsAsRead();
    }
  };

  const canAccessOperatorFeatures = [UserRole.Administrator, UserRole.Receptionist].includes(userRole);

  return (
    <header className="flex justify-between items-center p-4 bg-card shadow-sm z-20 relative h-16 border-b border-border">
      <div className="flex items-center gap-4">
        <button onClick={onToggleMobileNav} className="md:hidden text-muted-foreground hover:text-foreground">
            <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-foreground hidden md:block">{activePage}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {userRole === UserRole.MeetingAdmin && onQuickScan && (
             <button
                onClick={onQuickScan}
                title="Absensi Cepat Hari Ini"
                className="flex items-center px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:brightness-110 transition-colors border border-transparent"
            >
                <ScanLineIcon className="w-4 h-4 sm:mr-2"/>
                <span className="hidden sm:inline">Quick Scan</span>
            </button>
        )}

         {canAccessOperatorFeatures && (
            <>
                <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToKiosk(); }}
                    className="hidden sm:flex items-center px-3 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-accent transition-colors border border-border"
                >
                    <TabletIcon className="w-4 h-4 mr-2" />
                    Mode Kios
                </a>
                <button
                    onClick={onToggleOffline}
                    title={isOffline ? "Kembali Online & Sinkronkan Data" : "Simulasikan Mode Offline"}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative border border-transparent ${isOffline ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800' : 'bg-secondary text-secondary-foreground hover:bg-accent border-border'}`}
                >
                    {isOffline ? <WifiOffIcon className="w-4 h-4 sm:mr-2"/> : <WifiIcon className="w-4 h-4 sm:mr-2"/>}
                    <span className="hidden sm:inline">{isOffline ? 'OFFLINE' : 'ONLINE'}</span>
                    {isOffline && offlineQueueCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-card">
                            {offlineQueueCount}
                        </span>
                    )}
                </button>
            </>
        )}

        {/* Theme Toggle - Moved here */}
        <button 
            onClick={onToggleDarkMode}
            className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors border border-transparent hover:border-border"
            title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        <div className="relative" ref={notificationRef}>
            <button onClick={handleNotificationClick} className="p-2 text-muted-foreground hover:bg-secondary rounded-full relative transition-colors border border-transparent hover:border-border">
                <BellIcon className="w-5 h-5"/>
                {unreadNotificationCount > 0 && (
                     <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-card"></span>
                )}
            </button>
            {isNotificationPanelOpen && (
                <NotificationPanel notifications={notifications} userRole={userRole} />
            )}
        </div>


        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center cursor-pointer pl-2" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <img 
                    src={`https://picsum.photos/seed/${userInfo[userRole]?.avatar || 'default'}/40`} 
                    alt="User Avatar" 
                    className="w-9 h-9 rounded-full border border-border bg-secondary"
                />
                <div className="ml-3 hidden md:block text-left">
                    <p className="font-semibold text-sm text-foreground leading-tight">{userInfo[userRole]?.name || userRole}</p>
                    <p className="text-[11px] text-muted-foreground">{userInfo[userRole]?.department || ''}</p>
                </div>
                <ChevronDownIcon className={`w-4 h-4 ml-2 text-muted-foreground transition-transform hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-30 border border-border animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-border md:hidden">
                        <p className="font-medium text-sm text-foreground">{userInfo[userRole]?.name}</p>
                        <p className="text-xs text-muted-foreground">{userInfo[userRole]?.department}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogoutIcon className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;

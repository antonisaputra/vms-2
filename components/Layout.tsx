import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Notification, UserRole, Page, SmartToast } from '../types';
import NotificationBanner from './NotificationBanner';
import { useData } from '../context/DataContext';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
  notification: Notification | null;
  onCloseNotification: () => void;
  userRole: UserRole;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onSwitchToKiosk: () => void;
  onPanic: () => void;
  notifications: SmartToast[];
  unreadNotificationCount: number;
  onMarkNotificationsAsRead: () => void;
  onQuickScan?: () => void;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { 
    children, activePage, onNavigate,
    notification, onCloseNotification, 
    userRole, onLogout, isDarkMode, onToggleDarkMode, isMobileNavOpen, onToggleMobileNav,
    onSwitchToKiosk, onPanic,
    notifications, unreadNotificationCount, onMarkNotificationsAsRead, onQuickScan
  } = props;
  
  const { isOffline, offlineQueueCount, setOffline } = useData();

  const handleToggleOffline = () => {
    setOffline(!isOffline);
  };
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activePage={activePage}
        onNavigate={onNavigate}
        userRole={userRole} 
        onLogout={onLogout}
        isMobileOpen={isMobileNavOpen}
        onToggleMobileNav={onToggleMobileNav}
      />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 md:ml-20">
        <Header 
            activePage={activePage}
            isOffline={isOffline}
            onToggleOffline={handleToggleOffline}
            offlineQueueCount={offlineQueueCount}
            userRole={userRole}
            onLogout={onLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onToggleMobileNav={onToggleMobileNav}
            onSwitchToKiosk={onSwitchToKiosk}
            onPanic={onPanic}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            onMarkNotificationsAsRead={onMarkNotificationsAsRead}
            onQuickScan={onQuickScan}
        />
        <NotificationBanner notification={notification} onClose={onCloseNotification} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 md:p-8 relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { Page, UserRole } from '../types';
import { DashboardIcon, VisitorsIcon, PreregisterIcon, BlacklistIcon, LogoutIcon, CalendarPlusIcon, FileTextIcon, SettingsIcon, AnalyticsIcon, UsersIcon, IdCardIcon } from './icons';
import Logo from '../assets/logo.png';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  userRole: UserRole;
  onLogout: () => void;
  isMobileOpen: boolean;
  onToggleMobileNav: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: Page; isActive: boolean; onClick: () => void; isExpanded: boolean; }> = ({ icon, label, isActive, onClick, isExpanded }) => {
  return (
    <li
      onClick={onClick}
      className={`group relative flex items-center px-3 py-3 my-1.5 mx-3 rounded-xl cursor-pointer transition-all duration-200 ease-out
        ${isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      title={!isExpanded ? String(label) : ''}
    >
      <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 ${!isActive && 'group-hover:scale-110 group-hover:text-primary'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${isActive ? 'fill-current' : ''}` })}
      </div>

      <span
        className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 origin-left
        ${!isExpanded ? 'w-0 opacity-0 -translate-x-4 absolute' : 'w-auto opacity-100 translate-x-0 relative'}`}
      >
        {label}
      </span>

      {/* Active Indicator Line for Mini State */}
      {!isExpanded && isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
      )}
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, userRole, onLogout, isMobileOpen, onToggleMobileNav }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Desktop Sidebar is expanded if hovered
  const isExpanded = isHovered;

  const allNavItems = [
    { page: Page.Dashboard, icon: <DashboardIcon />, roles: [UserRole.Administrator, UserRole.Receptionist, UserRole.MeetingAdmin] },
    { page: Page.Management, icon: <IdCardIcon />, roles: [UserRole.Administrator, UserRole.MeetingAdmin] },
    { page: Page.Visitors, icon: <VisitorsIcon />, roles: [UserRole.Administrator, UserRole.Receptionist] },
    { page: Page.HostDashboard, icon: <VisitorsIcon />, roles: [UserRole.Host] },
    { page: Page.Preregister, icon: <PreregisterIcon />, roles: [UserRole.Administrator, UserRole.Receptionist, UserRole.Host] },
    { page: Page.Events, icon: <CalendarPlusIcon />, roles: [UserRole.Administrator, UserRole.Receptionist] },
    { page: Page.Blacklist, icon: <BlacklistIcon />, roles: [UserRole.Administrator] },
    { page: Page.Analitik, icon: <AnalyticsIcon />, roles: [UserRole.Administrator] },
    { page: Page.UserManagement, icon: <UsersIcon />, roles: [UserRole.Administrator] },
    { page: Page.AuditLog, icon: <FileTextIcon />, roles: [UserRole.Administrator] },
    { page: Page.Settings, icon: <SettingsIcon />, roles: [UserRole.Administrator, UserRole.MeetingAdmin] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleItemClick = (page: Page) => {
    onNavigate(page);
    if (isMobileOpen) {
      onToggleMobileNav();
    }
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div onClick={onToggleMobileNav} className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-card border-r border-border shadow-xl transition-all duration-300 ease-in-out
            ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
            md:w-20 hover:md:w-72
            flex flex-col
            `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header Logo */}
        <div className={`h-20 flex items-center px-5 transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
          {/* h-8: ukuran tinggi di mobile (32px)
       md:h-12: ukuran tinggi di desktop/layar medium ke atas (48px)
    */}
          <img
            src={Logo}
            className="h-8 md:h-12 w-auto transition-all duration-300"
            alt="Logo"
          />
        </div>

        <div className="px-4 pb-4">
          <div className="h-px bg-border w-full"></div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow overflow-y-auto scrollbar-hide space-y-1 py-2">
          <ul>
            {navItems.map(item => (
              <NavItem
                key={item.page}
                icon={item.icon}
                label={item.page}
                isActive={activePage === item.page}
                onClick={() => handleItemClick(item.page)}
                isExpanded={isExpanded || isMobileOpen}
              />
            ))}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 mt-auto">
          <div className="h-px bg-border w-full mb-3 mx-auto"></div>
          <li
            onClick={onLogout}
            className={`group flex items-center px-3 py-3 my-1 mx-2 rounded-xl cursor-pointer transition-all duration-200 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20`}
            title={!isExpanded ? 'Keluar' : ''}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-600 dark:group-hover:text-red-400">
              <LogoutIcon className="w-5 h-5" />
            </div>
            <span className={`ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!(isExpanded || isMobileOpen) ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100 relative'}`}>Keluar</span>
          </li>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

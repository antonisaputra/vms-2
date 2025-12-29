import React from 'react';
import { Notification } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, CloseIcon } from './icons';

interface NotificationBannerProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const baseClasses = "p-4 w-full flex items-center justify-between text-white z-50 shadow-lg";
  const colorClasses = {
    alert: "bg-red-600",
    success: "bg-green-600",
    info: "bg-blue-600",
  };

  const Icon = () => {
    switch (notification.type) {
      case 'alert':
        return <AlertTriangleIcon className="w-6 h-6 mr-3" />;
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 mr-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`${baseClasses} ${colorClasses[notification.type]}`}>
      <div className="flex items-center">
        <Icon />
        <p className="font-semibold">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NotificationBanner;
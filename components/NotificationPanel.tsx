
import React from 'react';
import { SmartToast, UserRole } from '../types';

interface NotificationPanelProps {
  notifications: SmartToast[];
  userRole: UserRole;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, userRole }) => {
  const isHost = userRole === UserRole.Host;

  const handleActionClick = (action: string) => {
    alert(`Aksi "${action}" telah disimulasikan.`);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-2xl border border-border z-30">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Notifikasi</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Tidak ada notifikasi baru.</p>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className="p-4 border-b border-border last:border-b-0 hover:bg-secondary">
              <div className="flex items-start">
                <img src={notif.imageUrl} alt="guest" className="w-10 h-10 rounded-md object-cover mr-3"/>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  {isHost && (
                    <div className="mt-2 flex gap-2">
                        <button onClick={() => handleActionClick("Saya Segera Turun")} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">
                            Saya Segera Turun
                        </button>
                         <button onClick={() => handleActionClick("Minta Tunggu 5 Menit")} className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                            Tunggu 5 Menit
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

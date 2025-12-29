
import React, { useMemo } from 'react';
import { Visit, VisitStatus } from '../types';
import { UserCheckIcon, CalendarIcon, MailIcon, PreregisterIcon } from './icons';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';

interface HostDashboardPageProps {
  visits: Visit[];
  onInviteGuest: () => void;
  onPreregister: () => void;
}

// Simulate the currently logged-in host
const SIMULATED_HOST_ID = 'host1'; 
const SIMULATED_HOST_NAME = 'Dr. Budi Santoso';

const StatCard = React.memo<{ icon: React.ReactNode; title: string; value: number; color: string }>(({ icon, title, value, color }) => (
    <div className="bg-card p-6 rounded-lg shadow-custom flex items-center stagger-item">
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
));

const VisitorRow = React.memo<{ visit: Visit }>(({ visit }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0 stagger-item-2">
      <div className="flex items-center">
        <img src={visit.visitor.photoUrl} alt={visit.visitor.fullName} className="w-10 h-10 rounded-full object-cover" />
        <div className="ml-4">
          <p className="font-semibold">{visit.visitor.fullName}</p>
          <p className="text-sm text-muted-foreground">Dari: {visit.visitor.company}</p>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">
          {visit.status === VisitStatus.OnSite 
            ? `Masuk: ${visit.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}` 
            : `Diharapkan: ${visit.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}`
          }
      </span>
    </div>
));


const HostDashboardPage: React.FC<HostDashboardPageProps> = ({ visits, onInviteGuest, onPreregister }) => {
  const myVisits = useMemo(() => {
    return visits.filter(v => v.host?.id === SIMULATED_HOST_ID);
  }, [visits]);

  const onSiteNow = myVisits.filter(v => v.status === VisitStatus.OnSite);
  const expectedToday = myVisits.filter(v => v.status === VisitStatus.Expected);

  const containerRef = useStaggerAnimation('.stagger-item', []);
  const listRef = useStaggerAnimation('.stagger-item-2', [onSiteNow, expectedToday]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Dasbor Host</h1>
      <p className="mt-1 text-muted-foreground">Selamat datang, {SIMULATED_HOST_NAME}. Berikut adalah daftar tamu Anda.</p>
      
      <div ref={containerRef} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<UserCheckIcon className="w-6 h-6 text-green-800"/>}
          title="Tamu Anda di Lokasi"
          value={onSiteNow.length}
          color="bg-green-100"
        />
        <StatCard 
          icon={<CalendarIcon className="w-6 h-6 text-blue-800"/>}
          title="Tamu Anda Diharapkan"
          value={expectedToday.length}
          color="bg-blue-100"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div ref={listRef} className="bg-card p-6 rounded-lg shadow-custom">
            <h2 className="text-xl font-semibold mb-4">Daftar Tamu Anda</h2>
            <div className="space-y-2">
                <h3 className="font-semibold">Sedang di Lokasi ({onSiteNow.length})</h3>
                {onSiteNow.length > 0 ? onSiteNow.map(v => <VisitorRow key={v.id} visit={v} />) : <p className="text-muted-foreground text-sm py-3">Tidak ada tamu Anda di lokasi.</p>}
                
                <h3 className="font-semibold pt-4">Diharapkan Hari Ini ({expectedToday.length})</h3>
                {expectedToday.length > 0 ? expectedToday.map(v => <VisitorRow key={v.id} visit={v} />) : <p className="text-muted-foreground text-sm py-3">Tidak ada tamu yang diharapkan.</p>}
            </div>
        </div>
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow-custom">
                <h3 className="text-lg font-semibold">Aksi Cepat</h3>
                <div className="mt-4 space-y-3">
                     <button onClick={onInviteGuest} className="btn-soft btn-soft-info flex items-center">
                        <MailIcon className="w-5 h-5 mr-3"/>
                        Undang Tamu via Email
                    </button>
                    <button onClick={onPreregister} className="btn-soft btn-soft-primary flex items-center">
                        <PreregisterIcon className="w-5 h-5 mr-3"/>
                        Pra-Registrasi Tamu Baru Anda
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;

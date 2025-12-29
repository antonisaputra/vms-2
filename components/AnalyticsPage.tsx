import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Visit } from '../types';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import { UserCheckIcon, UsersIcon, ClockIcon, DownloadIcon, CalendarIcon, FilterIcon } from './icons';
import { gsap } from 'gsap';

declare const Chart: any;

interface AnalyticsPageProps {
  visits: Visit[];
  isDarkMode: boolean;
}

// Komponen Helper untuk Animasi Angka
const AnimatedNumber: React.FC<{ value: number | string; duration?: number }> = ({ value, duration = 1 }) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const isTime = typeof value === 'string' && value.includes(':'); // Deteksi format waktu sederhana jika ada

    useEffect(() => {
        const obj = { val: 0 };
        if (spanRef.current && !isNaN(numericValue)) {
            gsap.fromTo(obj, 
                { val: 0 },
                {
                    val: numericValue,
                    duration: duration,
                    ease: "power2.out",
                    onUpdate: () => {
                        if (spanRef.current) {
                            // Format sederhana, jika string aslinya mengandung teks (misal: "15 mnt"), kita tempelkan lagi nanti di parent
                            spanRef.current.innerText = obj.val.toFixed(0); 
                        }
                    }
                }
            );
        }
    }, [numericValue, duration]);

    // Jika bukan angka murni yang bisa di-animate (misal format jam kompleks), render langsung
    if (isNaN(numericValue)) return <span>{value}</span>;

    return <span ref={spanRef}>0</span>;
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode, colorClass: string, subValue?: string }> = ({ title, value, icon, colorClass, subValue }) => {
    // Memisahkan angka dan teks unit (misal: "45 mnt")
    const match = value.match(/([\d\.]+)(.*)/);
    const num = match ? match[1] : 0;
    const unit = match ? match[2] : value;

    return (
        <div className={`relative overflow-hidden group p-6 rounded-2xl shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 stagger-item ${colorClass} bg-opacity-10 backdrop-blur-sm`}>
            {/* Dekorasi Background Bulat */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-current opacity-5 group-hover:opacity-10 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-white/80 dark:bg-black/20 shadow-sm text-current`}>
                    {icon}
                </div>
                {subValue && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">{subValue}</span>}
            </div>
            
            <div className="relative z-10">
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
                    <AnimatedNumber value={num} />
                    <span className="text-lg font-medium text-muted-foreground">{unit}</span>
                </h3>
            </div>
        </div>
    );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode, subtitle?: string }> = ({ title, children, subtitle }) => (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-2xl shadow-sm stagger-item flex flex-col h-full hover:shadow-md transition-shadow duration-300">
        <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex-grow relative w-full min-h-[300px]">
            {children}
        </div>
    </div>
);

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ visits, isDarkMode }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Menggunakan stagger animation pada class .stagger-item
  const containerRef = useStaggerAnimation('.stagger-item', [visits, dateRange]);
  
  const weeklyTrendChartRef = useRef<HTMLCanvasElement>(null);
  const peakHoursChartRef = useRef<HTMLCanvasElement>(null);
  const departmentChartRef = useRef<HTMLCanvasElement>(null);
  const visitsByDayChartRef = useRef<HTMLCanvasElement>(null);
  
  const filteredVisits = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return visits;
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    return visits.filter(v => {
      const visitDate = new Date(v.checkInTime);
      return visitDate >= startDate && visitDate <= endDate;
    });
  }, [visits, dateRange]);

  const analyticsData = useMemo(() => {
    const dataSet = filteredVisits;
    const weeklyLabels: string[] = [];
    const weeklyData: number[] = [];
    
    // Logic data processing (sama seperti sebelumnya, dipertahankan)
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weeklyLabels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })); // Tambah tanggal biar jelas
        const count = dataSet.filter(v => new Date(v.checkInTime).toDateString() === d.toDateString()).length;
        weeklyData.push(count);
    }
    const hourlyCounts = new Array(24).fill(0);
    dataSet.forEach(v => {
        const hour = new Date(v.checkInTime).getHours();
        hourlyCounts[hour]++;
    });
    const departmentCounts: { [key: string]: number } = {};
    dataSet.forEach(v => {
      if (v.host && v.host.department) {
        departmentCounts[v.host.department] = (departmentCounts[v.host.department] || 0) + 1;
      }
    });
    const departmentLabels = Object.keys(departmentCounts);
    const departmentData = Object.values(departmentCounts);
    const totalVisits = dataSet.length;

    let totalWaitTime = 0;
    let visitsWithPickup = 0;
    dataSet.forEach(v => {
      if (v.hostPickupTime && v.checkInTime) {
        const waitTime = new Date(v.hostPickupTime).getTime() - new Date(v.checkInTime).getTime();
        if (waitTime > 0) {
          totalWaitTime += waitTime;
          visitsWithPickup++;
        }
      }
    });
    const averageWaitTimeMinutes = visitsWithPickup > 0 ? Math.round((totalWaitTime / visitsWithPickup) / (1000 * 60)) : 0;

    let totalDuration = 0;
    let completedVisits = 0;
    dataSet.forEach(v => {
        if(v.checkOutTime) {
            totalDuration += new Date(v.checkOutTime).getTime() - new Date(v.checkInTime).getTime();
            completedVisits++;
        }
    });
    const avgDurationMinutes = completedVisits > 0 ? Math.round((totalDuration / completedVisits) / (1000 * 60)) : 0;
    const avgDurationString = avgDurationMinutes > 60 ? `${Math.floor(avgDurationMinutes/60)}j ${avgDurationMinutes%60}m` : `${avgDurationMinutes} mnt`;

    const visitsByDay = new Array(7).fill(0); 
    dataSet.forEach(v => {
      const day = new Date(v.checkInTime).getDay();
      visitsByDay[day]++;
    });

    return { weeklyLabels, weeklyData, hourlyCounts, departmentLabels, departmentData, totalVisits, avgDurationString, averageWaitTimeMinutes, visitsByDay };
  }, [filteredVisits]);

  // Chart Rendering
  useEffect(() => {
    const charts: any[] = [];
    const textColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
    const gridColor = isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';
    const fontFamily = "'Inter', sans-serif";

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        font: { family: fontFamily },
        plugins: {
            legend: { 
                position: 'bottom',
                labels: { color: textColor, padding: 20, usePointStyle: true, boxWidth: 8 } 
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                titleColor: isDarkMode ? '#fff' : '#1e293b',
                bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
                borderColor: gridColor,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
            }
        },
        scales: {
            x: { 
                grid: { display: false }, 
                ticks: { color: textColor, font: { size: 11 } },
                border: { display: false }
            },
            y: { 
                grid: { color: gridColor, borderDash: [4, 4] }, 
                ticks: { color: textColor, font: { size: 11 }, padding: 10 },
                border: { display: false },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    // 1. Weekly Trend (Line Chart with Gradient)
    if (weeklyTrendChartRef.current) {
        const ctx = weeklyTrendChartRef.current.getContext('2d');
        const gradient = ctx!.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)'); // Green-500 low opacity
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

        charts.push(new Chart(ctx, {
            type: 'line',
            data: { 
                labels: analyticsData.weeklyLabels, 
                datasets: [{ 
                    label: 'Total Kunjungan', 
                    data: analyticsData.weeklyData, 
                    borderColor: '#22c55e', // Green-500
                    backgroundColor: gradient, 
                    tension: 0.4, // Membuat garis melengkung halus
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#22c55e',
                    pointHoverBackgroundColor: '#22c55e',
                    pointHoverBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true 
                }] 
            },
            options: commonOptions
        }));
    }

    // 2. Peak Hours (Bar Chart with Rounded Corners)
    if (peakHoursChartRef.current) {
        charts.push(new Chart(peakHoursChartRef.current.getContext('2d'), {
            type: 'bar',
            data: { 
                labels: Array.from({length: 12}, (_, i) => `${(i+7).toString().padStart(2, '0')}:00`), 
                datasets: [{ 
                    label: 'Tamu per Jam', 
                    data: analyticsData.hourlyCounts.slice(7, 19), 
                    backgroundColor: '#3b82f6', // Blue-500
                    borderRadius: 4,
                    barThickness: 20
                }] 
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    x: { ...commonOptions.scales.x, grid: { display: false } }
                }
            }
        }));
    }

    // 3. Department (Doughnut - Modern Style)
    if (departmentChartRef.current) {
        charts.push(new Chart(departmentChartRef.current.getContext('2d'), {
            type: 'doughnut',
            data: { 
                labels: analyticsData.departmentLabels, 
                datasets: [{ 
                    data: analyticsData.departmentData, 
                    backgroundColor: ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0,
                    hoverOffset: 15
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                cutout: '75%', // Donut lebih tipis
                plugins: {
                    legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, color: textColor } }
                }
            }
        }));
    }

    // 4. Visits by Day (Bar)
    if (visitsByDayChartRef.current) {
        charts.push(new Chart(visitsByDayChartRef.current.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            datasets: [{
              label: 'Rata-rata Harian',
              data: analyticsData.visitsByDay,
              backgroundColor: 'rgba(249, 115, 22, 0.8)', // Orange-500
              borderRadius: 6,
              barThickness: 'flex'
            }]
          },
          options: commonOptions
        }));
    }
    
    return () => {
        charts.forEach(chart => chart.destroy());
    }
  }, [analyticsData, isDarkMode]);

  return (
    <div ref={containerRef} className="pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 stagger-item">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dasbor Analitik</h1>
                <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
                    Pantau kinerja lalu lintas pengunjung dan efisiensi operasional secara real-time.
                </p>
            </div>
             <button 
                onClick={() => alert('Fitur dalam pengembangan')}
                className="btn btn-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 inline-flex items-center"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Ekspor Laporan
            </button>
        </div>
        
        {/* Filter Section - Glassmorphism */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center stagger-item">
            <div className="flex items-center text-muted-foreground mr-2">
                <FilterIcon className="w-5 h-5 mr-2" />
                <span className="font-medium text-sm">Filter:</span>
            </div>
            <div className="grid grid-cols-2 md:flex gap-4 w-full md:w-auto flex-grow">
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="date" 
                        className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none w-full"
                        value={dateRange.start} 
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} 
                    />
                </div>
                <div className="flex items-center justify-center text-muted-foreground text-sm">s/d</div>
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="date" 
                        className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary outline-none w-full"
                        value={dateRange.end} 
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} 
                    />
                </div>
            </div>
            {(dateRange.start || dateRange.end) && (
                <button 
                    onClick={() => setDateRange({start: '', end: ''})} 
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors px-4"
                >
                    Reset
                </button>
            )}
        </div>

      {/* Stat Cards - Colorful & Animated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Total Kunjungan" 
            value={analyticsData.totalVisits.toString()} 
            icon={<UsersIcon className="w-6 h-6" />} 
            colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
            subValue="+12% bln ini"
        />
        <StatCard 
            title="Rata-rata Durasi" 
            value={analyticsData.avgDurationString} 
            icon={<ClockIcon className="w-6 h-6" />} 
            colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        />
        <StatCard 
            title="Waktu Tunggu (Host)" 
            value={`${analyticsData.averageWaitTimeMinutes} mnt`} 
            icon={<UserCheckIcon className="w-6 h-6" />} 
            colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            subValue="Target: <10 mnt"
        />
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart spans 2 columns */}
        <div className="lg:col-span-2">
            <ChartCard title="Tren Kunjungan Mingguan" subtitle="Data real-time 7 hari terakhir">
                <canvas ref={weeklyTrendChartRef}></canvas>
            </ChartCard>
        </div>
        
        <div className="lg:col-span-1">
             <ChartCard title="Departemen Tujuan" subtitle="Distribusi tamu berdasarkan departemen">
                <div className="flex justify-center h-full">
                    <canvas ref={departmentChartRef}></canvas>
                </div>
            </ChartCard>
        </div>

        <div className="lg:col-span-1">
             <ChartCard title="Jam Sibuk" subtitle="Rata-rata kedatangan per jam (07:00 - 18:00)">
                 <canvas ref={peakHoursChartRef}></canvas>
            </ChartCard>
        </div>
        
        <div className="lg:col-span-2">
             <ChartCard title="Frekuensi Hari" subtitle="Akumulasi kunjungan berdasarkan hari">
                <canvas ref={visitsByDayChartRef}></canvas>
            </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
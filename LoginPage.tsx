import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Logo from './assets/logo.png';
import { useAuth } from './context/AuthContext';
import { MailIcon, LockIcon, ArrowRightIcon } from './components/icons';

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('admin@hamzanwadi.ac.id');
  const [password, setPassword] = useState('password123');

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(formRef.current?.children || [],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-gray-950 font-sans">
      
      {/* --- STYLE KHUSUS --- */}
      <style>{`
        /* 1. Autofill Fix (Tetap Hitam & Teks Hijau) */
        input:-webkit-autofill {
            -webkit-text-fill-color: #10b981 !important; 
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #1f2937 inset !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        input { caret-color: #10b981; }

        /* 2. ANIMASI BACKGROUND (Floating Blobs) */
        @keyframes float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, 30px) scale(1.2); }
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.7; }
        }
        
        .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 0;
        }
        .blob-1 {
            top: -10%; left: -10%; width: 600px; height: 600px;
            background: rgba(16, 185, 129, 0.25); /* Emerald */
            animation: float-1 20s infinite ease-in-out;
        }
        .blob-2 {
            bottom: -20%; right: -10%; width: 700px; height: 700px;
            background: rgba(5, 150, 105, 0.2); /* Green-600 */
            animation: float-2 25s infinite ease-in-out reverse;
        }
        .blob-3 {
            top: 40%; left: 40%; width: 400px; height: 400px;
            background: rgba(4, 120, 87, 0.15); /* Green-700 */
            animation: float-1 22s infinite ease-in-out 2s, pulse-glow 8s infinite ease-in-out;
        }
      `}</style>

      {/* 1. BACKGROUND ANIMATION LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gray-900">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        {/* Pattern Grid Halus agar tidak terlalu polos */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 z-0"></div>
        {/* Overlay Gradient Hitam Tipis */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-black/80 z-0"></div>
      </div>
      
      {/* 2. Main Card Container */}
      <div 
        ref={containerRef}
        className="relative z-20 w-full max-w-5xl mx-4 grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/20 backdrop-blur-sm"
        style={{ minHeight: '600px' }}
      >
        
        {/* Kolom Kiri - Branding */}
        <div className="hidden lg:flex flex-col relative bg-white/5 backdrop-blur-md p-12 text-white justify-between border-r border-white/5">
           {/* Dekorasi tambahan di dalam kartu */}
           <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>

           <div className="relative z-10">
              <div className="inline-block p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 mb-6 shadow-lg shadow-emerald-900/20">
                <img src={Logo} alt="Logo" className="h-12 w-auto" />
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
                Sistem Manajemen <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Tamu Digital</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-sm">
                Platform terintegrasi untuk keamanan kampus dan manajemen kunjungan yang efisien di <span className="text-white font-bold">Universitas Hamzanwadi</span>.
              </p>
           </div>

           <div className="relative z-10 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                 <div className="h-px w-8 bg-emerald-500/50"></div>
                 <span className="font-mono text-emerald-500/80">VMS Secure Access 2.0</span>
              </div>
              <p className="mt-2 opacity-60">&copy; {new Date().getFullYear()} <span className="text-white font-medium">Universitas Hamzanwadi (JAT)</span>.</p>
           </div>
        </div>

        {/* Kolom Kanan - Login Form */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-gray-900/70 backdrop-blur-xl border-l border-white/5 relative">
          <div ref={formRef} className="w-full max-w-sm relative z-10">
            
            <div className="lg:hidden text-center mb-8">
              <img src={Logo} alt="Logo" className="h-14 mx-auto" />
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Selamat Datang</h2>
              <p className="text-gray-400">Silakan masuk untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="group">
                {/* UPDATED: text-white */}
                <label htmlFor="email" className="block text-xs font-semibold text-white uppercase tracking-wider mb-2 ml-1">
                  Email Universitas
                </label>
                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <MailIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-emerald-500 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner relative z-0 font-medium"
                    placeholder="nama@hamzanwadi.ac.id"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <LockIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-emerald-500 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner relative z-0 font-medium"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-300 text-sm animate-pulse">
                  <span>⚠️ {error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold shadow-lg shadow-emerald-900/40 transition-all duration-300 hover:shadow-emerald-900/60 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full skew-x-12"></div>
                <span className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Sistem</span>
                      <ArrowRightIcon className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
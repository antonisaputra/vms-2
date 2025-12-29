
import React, { useState } from 'react';
import { UserRole } from '../types';
import { UsersIcon, CalendarIcon } from './icons';
import Modal from './Modal';
import Logo from './Logo';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`}}
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
      <div className="w-full max-w-md z-10">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/50">
          <Logo className="h-20 mx-auto justify-center" />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 font-medium">Sistem Manajemen Tamu Digital</p>
          <div className="mt-10">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full px-8 py-4 bg-primary hover:bg-green-700 text-primary-foreground text-lg font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
            >
              Login dengan Akun Universitas (IOSys)
            </button>
          </div>
        </div>
        <p className="text-center text-white/90 text-sm mt-8 font-medium shadow-sm">
            &copy; {new Date().getFullYear()} Universitas Hamzanwadi. All rights reserved.
        </p>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-sm">
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pilih Peran (Simulasi)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Pilih peran untuk mensimulasikan login SSO.</p>
            <div className="mt-6 space-y-3">
            <button
                onClick={() => onLogin(UserRole.Administrator)}
                className="w-full flex items-center text-left p-4 bg-gray-50 hover:bg-green-50 rounded-lg border-2 border-transparent hover:border-green-400 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:border-green-600"
            >
                <UsersIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-4" />
                <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Administrator</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Akses penuh ke semua fitur.</p>
                </div>
            </button>
            <button
                onClick={() => onLogin(UserRole.MeetingAdmin)}
                className="w-full flex items-center text-left p-4 bg-gray-50 hover:bg-purple-50 rounded-lg border-2 border-transparent hover:border-purple-400 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:border-purple-600"
            >
                <CalendarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-4" />
                <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Sekretaris Rapat</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kelola data manajemen & rapat.</p>
                </div>
            </button>
            <button
                onClick={() => onLogin(UserRole.Receptionist)}
                className="w-full flex items-center text-left p-4 bg-gray-50 hover:bg-emerald-50 rounded-lg border-2 border-transparent hover:border-emerald-400 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:border-emerald-600"
            >
                <UsersIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mr-4" />
                <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Resepsionis</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Akses operasional harian.</p>
                </div>
            </button>
            <button
                onClick={() => onLogin(UserRole.Host)}
                className="w-full flex items-center text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border-2 border-transparent hover:border-blue-400 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:border-blue-600"
            >
                <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4" />
                <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Host (Dosen / Staf)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Akses terbatas untuk tamu pribadi.</p>
                </div>
            </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
    SearchIcon, 
    UserPlusIcon, 
    ShieldAlertIcon, 
    TrashIcon, 
    BanIcon 
} from './icons';
import Modal from './Modal';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';

const BlacklistPage: React.FC = () => {
  const { blacklist, addToBlacklist } = useData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState('');

  // Filter Data
  const filteredList = useMemo(() => {
    return blacklist.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blacklist, searchTerm]);

  // Animasi List
  const listRef = useStaggerAnimation('.blacklist-card', [filteredList]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newReason) {
        addToBlacklist({ fullName: newName, reason: newReason });
        setNewName('');
        setNewReason('');
        setModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 min-h-[80vh]">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 dark:border-gray-700 pb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-xl text-red-600 dark:text-red-400">
                    <ShieldAlertIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Hitam</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed ml-1">
                Kelola daftar individu yang dilarang memasuki area kampus demi keamanan.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative group w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Cari nama atau alasan..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Add Button */}
            <button 
                onClick={() => setModalOpen(true)}
                className="btn bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
                <UserPlusIcon className="w-5 h-5" />
                <span>Tambah Orang</span>
            </button>
        </div>
      </div>

      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20">
              <p className="text-red-100 text-sm font-medium mb-1">Total Terblokir</p>
              <h3 className="text-3xl font-bold">{blacklist.length} <span className="text-lg font-normal text-red-200">Orang</span></h3>
          </div>
          {/* Placeholder Stats Lainnya (Bisa dikembangkan) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
               <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Terbaru Ditambahkan</p>
               <p className="text-gray-900 dark:text-white font-medium truncate">
                   {blacklist.length > 0 ? blacklist[blacklist.length - 1].fullName : '-'}
               </p>
          </div>
      </div>

      {/* --- LIST CONTENT --- */}
      <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredList.length > 0 ? (
            filteredList.map((person) => (
                <div key={person.id} className="blacklist-card group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 relative overflow-hidden">
                    
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
                                {person.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-red-600 transition-colors">
                                    {person.fullName}
                                </h3>
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 uppercase tracking-wide border border-red-100">
                                    <BanIcon className="w-3 h-3" />
                                    DIBLOKIR
                                </span>
                            </div>
                        </div>
                        {/* Action Menu (Optional - Currently disabled/dummy) */}
                        {/* <button className="text-gray-300 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button> */}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-700 relative z-10">
                        <p className="text-xs text-gray-400 font-medium uppercase mb-1">Alasan</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {person.reason}
                        </p>
                    </div>

                    <div className="mt-3 text-[10px] text-gray-400 text-right">
                        Ditambahkan: {new Date(person.addedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <SearchIcon className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium">Tidak ada data ditemukan</h3>
                <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain atau tambahkan orang baru.</p>
            </div>
        )}
      </div>

      {/* --- ADD MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Tambah ke Daftar Hitam">
        <form onSubmit={handleAdd} className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800 mb-2">
                <ShieldAlertIcon className="w-6 h-6 shrink-0" />
                <p className="text-sm leading-relaxed">
                    Tindakan ini akan memicu peringatan keamanan jika orang ini mencoba melakukan check-in di masa depan.
                </p>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap</label>
                <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    placeholder="Nama sesuai KTP..."
                    required 
                />
            </div>
            
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Alasan Pemblokiran</label>
                <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none min-h-[100px]"
                    value={newReason} 
                    onChange={e => setNewReason(e.target.value)} 
                    placeholder="Contoh: Terlibat pencurian aset kampus..."
                    required 
                />
            </div>

            <div className="pt-4 flex gap-3">
                <button 
                    type="button" 
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                    Batal
                </button>
                <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 font-bold transition-all active:scale-95"
                >
                    Simpan Data
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default BlacklistPage;
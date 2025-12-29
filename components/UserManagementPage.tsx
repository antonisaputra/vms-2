import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Edit2Icon, Trash2Icon, UserPlusIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import Modal from './Modal';
import { useStaggerAnimation } from '../hooks/useStaggerAnimation';
import Pagination from './Pagination';
import TableSkeleton from './TableSkeleton';
import { useData } from '../context/DataContext';

interface UserManagementPageProps {}

const ITEMS_PER_PAGE = 8;
type SortKey = 'name' | 'email' | 'role';
type SortDirection = 'asc' | 'desc';

// --- ICONS & ASSETS KECIL ---

const RefreshIcon = ({ className, onClick, spin }: { className?: string, onClick?: () => void, spin?: boolean }) => (
    <button 
        onClick={onClick}
        className={`p-2 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all active:scale-95 ${className}`}
        title="Refresh Data"
    >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" height="20" viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" strokeWidth="2" 
            strokeLinecap="round" strokeLinejoin="round" 
            className={`${spin ? 'animate-spin text-emerald-600' : ''}`}
        >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
        </svg>
    </button>
);

const SearchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// --- KOMPONEN PENDUKUNG ---

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

// Badge Role dengan Warna yang Lebih Rapi & Harmonis
const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    // Menggunakan palet warna yang sedikit lebih 'muted' agar elegan
    const styles = {
        [UserRole.Administrator]: 'bg-purple-50 text-purple-700 border-purple-100 ring-1 ring-purple-100',
        [UserRole.Receptionist]: 'bg-blue-50 text-blue-700 border-blue-100 ring-1 ring-blue-100',
        [UserRole.Host]: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-100',
        [UserRole.MeetingAdmin]: 'bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-100',
        [UserRole.Visitor]: 'bg-gray-50 text-gray-600 border-gray-100 ring-1 ring-gray-100', 
    };
    
    const activeStyle = styles[role] || styles[UserRole.Visitor];

    return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${activeStyle} inline-flex items-center gap-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStyle.replace('bg-', 'bg-current ').split(' ')[0]} opacity-60`}></span>
            {role}
        </span>
    );
};

// --- MODAL FORM USER ---
const UserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>; 
  userToEdit: User | null;
}> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: UserRole.Host,
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setFormData({ 
          name: userToEdit.name, 
          email: userToEdit.email, 
          role: userToEdit.role,
          password: '' 
        });
    } else {
      setFormData({ name: '', email: '', role: UserRole.Host, password: '' });
    }
    setError(null);
    setIsSaving(false);
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userToEdit) {
        if (!formData.password || formData.password.length < 8) {
            setError("Password wajib minimal 8 karakter.");
            return;
        }
    }
    
    if (userToEdit && formData.password && formData.password.length < 8) {
        setError("Password baru harus minimal 8 karakter.");
        return;
    }

    try {
        setIsSaving(true);
        await onSave(formData);
        onClose();
    } catch (err) {
        console.error(err);
        setError("Gagal menyimpan. Email mungkin sudah terdaftar.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-8">
        <div className="mb-8 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                <UserPlusIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
                {userToEdit ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                {userToEdit ? 'Perbarui informasi akun pengguna.' : 'Buat akun baru untuk akses ke sistem.'}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3">
                <div className="w-1 h-full bg-red-400 rounded-full"></div>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Nama Lengkap</label>
            <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
                placeholder="Contoh: Ahmad Fadillah"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Email Institusi</label>
            <input 
                type="email" 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                required 
                placeholder="nama@domain.ac.id"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">
                {userToEdit ? 'Password (Opsional)' : 'Password'}
            </label>
            <div className="relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none pr-24"
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    required={!userToEdit}
                    placeholder={userToEdit ? "Kosongkan jika tidak diubah" : "Min. 8 karakter"}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors px-2 py-1"
                >
                    {showPassword ? "SEMBUNYIKAN" : "LIHAT"}
                </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Peran Pengguna</label>
            <div className="relative">
                <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} 
                    required
                >
                    <option value={UserRole.Administrator}>Administrator (Akses Penuh)</option>
                    <option value={UserRole.Receptionist}>Resepsionis (Check-in/out)</option>
                    <option value={UserRole.Host}>Host (Dosen/Staf)</option>
                    <option value={UserRole.MeetingAdmin}>Sekretaris Rapat</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ArrowDownIcon className="w-4 h-4" />
                </div>
            </div>
          </div>

          <div className="pt-8 flex gap-3">
            <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
                disabled={isSaving}
            >
                Batal
            </button>
            <button 
                type="submit" 
                className="flex-[2] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Menyimpan...
                    </>
                ) : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// --- KARTU USER (MOBILE) ---
const UserCard: React.FC<{ user: User; onEdit: () => void; onDelete: () => void; }> = ({ user, onEdit, onDelete }) => (
    <div className="user-card bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 group">
        <div className="flex justify-between items-start">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 font-medium">{user.email}</p>
                    <RoleBadge role={user.role} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <button onClick={onEdit} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Edit">
                    <Edit2Icon className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                    <Trash2Icon className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);


// --- HALAMAN UTAMA ---
const UserManagementPage: React.FC<UserManagementPageProps> = () => {
  const { users, isLoadingUsers, addUser, updateUser, deleteUser, refreshUserData } = useData();
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'name', direction: 'asc'});
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Efek Mounting
  useEffect(() => {
    if (refreshUserData) {
        refreshUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleRefresh = () => {
      setIsRefreshing(true);
      if (refreshUserData) refreshUserData();
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const sortedUsers = useMemo(() => {
    let sortableItems = [...users];
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        sortableItems = sortableItems.filter(u => 
            u.name.toLowerCase().includes(lowerQuery) || 
            u.email.toLowerCase().includes(lowerQuery) ||
            u.role.toLowerCase().includes(lowerQuery)
        );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedUsers, currentPage]);

  const tableBodyRef = useStaggerAnimation('tr', [paginatedUsers, isLoadingUsers]); 
  const cardListRef = useStaggerAnimation('.user-card', [paginatedUsers, isLoadingUsers]); 

  const handleOpenAddModal = () => {
    setUserToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Hapus pengguna "${user.name}"?`)) {
        try {
            await deleteUser(user.id);
            if (refreshUserData) refreshUserData();
        } catch (error) {
            alert("Gagal menghapus user.");
        }
    }
  };

  const handleSaveUser = async (formData: UserFormData) => {
    const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
    };
    if (formData.password) {
        payload.password = formData.password;
    }

    if (userToEdit) {
      await updateUser(userToEdit.id, payload);
    } else {
      await addUser(payload);
    }
    if (refreshUserData) refreshUserData();
  };
  
  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode, className?: string }> = ({ sortKey, children, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const Icon = sortConfig?.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
    return (
        <th 
            scope="col" 
            className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-all select-none group ${className}`} 
            onClick={() => requestSort(sortKey)}
        >
            <div className="flex items-center gap-2">
                {children}
                <span className={`transition-all duration-200 ${isSorted ? 'opacity-100 text-emerald-600' : 'opacity-0 group-hover:opacity-40'}`}>
                    <Icon className="w-3.5 h-3.5"/>
                </span>
            </div>
        </th>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="w-1 h-8 bg-emerald-500 rounded-full"></span>
                <h1 className="text-3xl font-bold text-gray-800">
                    Manajemen Pengguna
                </h1>
            </div>
            <p className="text-gray-500 text-sm max-w-lg leading-relaxed ml-4">
                Pusat kontrol akses sistem. Tambahkan, edit, atau kelola hak akses pengguna dengan mudah dan aman.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch">
             {/* Search Bar Modern */}
             <div className="relative group w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <SearchIcon className="w-4 h-4" />
                </div>
                <input 
                    type="text" 
                    placeholder="Cari user..." 
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-1 pr-1 flex items-center">
                    <RefreshIcon onClick={handleRefresh} spin={isRefreshing} />
                </div>
             </div>

             <button 
                onClick={handleOpenAddModal} 
                className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
                <UserPlusIcon className="w-5 h-5" />
                <span>Pengguna Baru</span>
            </button>
          </div>
        </div>

        {/* TABEL VIEW (DESKTOP) */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader sortKey="name">Nama Lengkap</SortableHeader>
                  <SortableHeader sortKey="email">Email</SortableHeader>
                  <SortableHeader sortKey="role" className="w-48">Peran</SortableHeader>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Aksi</th>
                </tr>
              </thead>
              {isLoadingUsers ? (
                 <TableSkeleton /> 
              ) : (
                <tbody ref={tableBodyRef as React.RefObject<HTMLTableSectionElement>} className="divide-y divide-gray-50 bg-white">
                  {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user, idx) => (
                        <tr 
                            key={user.id} 
                            className="hover:bg-emerald-50/30 transition-colors duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 flex items-center justify-center font-bold text-sm mr-3 border border-emerald-100">
                                      {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="font-medium text-gray-900">{user.name}</div>
                              </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                             <RoleBadge role={user.role} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => handleOpenEditModal(user)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                                    <Edit2Icon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-gray-400 bg-gray-50/20">
                              <div className="flex flex-col items-center justify-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                                    <SearchIcon className="w-6 h-6 opacity-30" />
                                  </div>
                                  <p>Tidak ada pengguna yang ditemukan.</p>
                              </div>
                          </td>
                      </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
          
          {/* Footer Tabel */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
             {sortedUsers.length > ITEMS_PER_PAGE && (
                <Pagination 
                    currentPage={currentPage}
                    totalItems={sortedUsers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            )}
          </div>
        </div>
        
        {/* MOBILE CARD VIEW */}
        <div ref={cardListRef} className="md:hidden">
            {isLoadingUsers ? (
                Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl mb-4 shadow-sm animate-pulse border border-gray-100">
                        <div className="flex gap-4 mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                ))
            ) : (
                paginatedUsers.length > 0 ? (
                    paginatedUsers.map(user => (
                        <div key={user.id} className="user-card">
                            <UserCard 
                                user={user} 
                                onEdit={() => handleOpenEditModal(user)}
                                onDelete={() => handleDelete(user)}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>Tidak ada data.</p>
                    </div>
                )
            )}
            
            {sortedUsers.length > ITEMS_PER_PAGE && (
                <div className="mt-6 flex justify-center">
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={sortedUsers.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />
    </>
  );
};

export default UserManagementPage;
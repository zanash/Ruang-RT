
import React, { useState } from 'react';
import ResidentTable from './ResidentTable';
import KkTable from './KkTable';
import Modal from './Modal';
import ResidentForm from './ResidentForm';
import AdminPanel from './AdminPanel';
import Dashboard from './Dashboard';
import KeuanganPanel from './KeuanganPanel';
import RekapitulasiPanel from './RekapitulasiPanel';
import RiwayatIuranPanel from './RiwayatIuranPanel';
import BendaharaSettingsPanel from './BendaharaSettingsPanel';
import type { Resident, AdminLists, User, Iuran, IuranConfig, Pengeluaran, PemasukanLain } from '../types';
import { PlusIcon, CogIcon, ArrowLeftOnRectangleIcon, ChartBarIcon, TableCellsIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, UserGroupIcon, ClockIcon } from './icons';

interface AppData {
    residents: Resident[];
    setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
    adminLists: AdminLists;
    setAdminLists: React.Dispatch<React.SetStateAction<AdminLists>>;
    iuran: Iuran[];
    setIuran: React.Dispatch<React.SetStateAction<Iuran[]>>;
    iuranConfig: IuranConfig;
    setIuranConfig: React.Dispatch<React.SetStateAction<IuranConfig>>;
    pengeluaran: Pengeluaran[];
    setPengeluaran: React.Dispatch<React.SetStateAction<Pengeluaran[]>>;
    pemasukanLain: PemasukanLain[];
    setPemasukanLain: React.Dispatch<React.SetStateAction<PemasukanLain[]>>;
}

interface MainLayoutProps {
  onLogout: () => void;
  user: User;
  appData: AppData;
}

type View = 'dashboard' | 'table' | 'kkTable' | 'keuangan' | 'rekapitulasi' | 'riwayat';

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout, user, appData }) => {
  const { 
    residents, setResidents, 
    adminLists, setAdminLists,
    iuran, setIuran,
    iuranConfig, setIuranConfig,
    pengeluaran, setPengeluaran,
    pemasukanLain, setPemasukanLain
  } = appData;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isBendaharaSettingsModalOpen, setIsBendaharaSettingsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState('');

  const handleOpenAddModal = () => {
    setEditingResident(null);
    setIsFormModalOpen(true);
  };
  
  const handleOpenEditModal = (resident: Resident) => {
    setEditingResident(resident);
    setIsFormModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setIsAdminModalOpen(false);
    setIsBendaharaSettingsModalOpen(false);
    setEditingResident(null);
    setIsReceiptModalOpen(false);
    setReceiptImageUrl('');
  };

  const handleShowReceipt = (base64Image: string) => {
    setReceiptImageUrl(base64Image);
    setIsReceiptModalOpen(true);
  };

  const handleSaveResident = (resident: Resident) => {
    if (editingResident) {
      setResidents(prev => prev.map(r => r.id === resident.id ? resident : r));
    } else {
      setResidents(prev => [...prev, resident]);
    }
    handleCloseModal();
  };
  
  const handleSaveIuranConfig = (newConfig: IuranConfig) => {
    setIuranConfig(newConfig);
    handleCloseModal();
  };

  const handleDeleteResident = (id: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus data warga ini?')) {
        setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Panel Pengurus</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
                {user.role === 'admin' && (
                    <>
                        <button
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                        <PlusIcon /> <span className="hidden sm:inline">Tambah Warga</span>
                        </button>
                        <button
                            onClick={() => setIsAdminModalOpen(true)}
                            className="inline-flex items-center gap-2 justify-center p-2 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                        <CogIcon /> <span className="hidden sm:inline">Admin</span>
                        </button>
                    </>
                )}
                 {(user.role === 'admin' || user.role === 'bendahara') && (
                    <button
                        onClick={() => setIsBendaharaSettingsModalOpen(true)}
                        className="inline-flex items-center gap-2 justify-center p-2 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                    <CogIcon /> <span className="hidden sm:inline">Iuran</span>
                    </button>
                 )}
                 <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 justify-center p-2 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                   <ArrowLeftOnRectangleIcon /> <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
          </div>
          <nav className="mt-4">
            <div className="flex border-b border-gray-200 overflow-x-auto">
                <button onClick={() => setCurrentView('dashboard')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'dashboard' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <ChartBarIcon /> Dashboard
                </button>
                <button onClick={() => setCurrentView('table')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'table' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <TableCellsIcon /> Tabel Warga
                </button>
                 <button onClick={() => setCurrentView('kkTable')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'kkTable' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <UserGroupIcon /> Tabel KK
                </button>
                {(user.role === 'admin' || user.role === 'bendahara') && (
                    <>
                        <button onClick={() => setCurrentView('keuangan')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'keuangan' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <CurrencyDollarIcon /> Kelola Keuangan
                        </button>
                        <button onClick={() => setCurrentView('rekapitulasi')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'rekapitulasi' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <ClipboardDocumentListIcon /> Rekapitulasi
                        </button>
                        <button onClick={() => setCurrentView('riwayat')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'riwayat' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <ClockIcon /> Riwayat Iuran
                        </button>
                    </>
                )}
            </div>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && <Dashboard residents={residents} />}
        {currentView === 'table' && (
          <ResidentTable 
            residents={residents} 
            onEdit={handleOpenEditModal} 
            onDelete={handleDeleteResident} 
            userRole={user.role}
          />
        )}
        {currentView === 'kkTable' && <KkTable residents={residents} />}
        {currentView === 'keuangan' && (
            <KeuanganPanel 
                residents={residents} 
                iuran={iuran} 
                setIuran={setIuran}
                iuranConfig={iuranConfig}
                pengeluaran={pengeluaran}
                setPengeluaran={setPengeluaran}
                pemasukanLain={pemasukanLain}
                setPemasukanLain={setPemasukanLain}
                onShowReceipt={handleShowReceipt}
            />
        )}
         {currentView === 'rekapitulasi' && (
            <RekapitulasiPanel 
                residents={residents}
                iuran={iuran}
                pengeluaran={pengeluaran}
                pemasukanLain={pemasukanLain}
                iuranConfig={iuranConfig}
            />
        )}
        {currentView === 'riwayat' && (
            <RiwayatIuranPanel
                residents={residents}
                iuran={iuran}
            />
        )}
      </main>

      <Modal 
        isOpen={isFormModalOpen} 
        onClose={handleCloseModal}
        title={editingResident ? 'Edit Data Warga' : 'Tambah Data Warga'}
        widthClass="max-w-4xl"
      >
        <ResidentForm 
          onSave={handleSaveResident} 
          onClose={handleCloseModal} 
          existingResident={editingResident}
          adminLists={adminLists}
          allResidents={residents}
        />
      </Modal>

      <Modal 
        isOpen={isAdminModalOpen} 
        onClose={handleCloseModal}
        title="Pengaturan Daftar Pilihan (Admin)"
        widthClass="max-w-6xl"
      >
        <AdminPanel 
          adminLists={adminLists}
          setAdminLists={setAdminLists}
        />
      </Modal>
      
      <Modal 
        isOpen={isBendaharaSettingsModalOpen} 
        onClose={handleCloseModal}
        title="Pengaturan Besaran Iuran"
        widthClass="max-w-2xl"
      >
        <BendaharaSettingsPanel 
          iuranConfig={iuranConfig}
          onSave={handleSaveIuranConfig}
        />
      </Modal>
      
       <Modal 
        isOpen={isReceiptModalOpen} 
        onClose={handleCloseModal}
        title="Bukti Pembayaran"
        widthClass="max-w-2xl"
      >
        <div className="p-4">
            <img src={receiptImageUrl} alt="Bukti Pembayaran" className="w-full h-auto object-contain rounded-md" />
        </div>
      </Modal>
    </>
  );
}

export default MainLayout;

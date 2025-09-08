
import React, { useState } from 'react';
import PublicRekapitulasi from './PublicRekapitulasi';
import PublicGrafik from './PublicGrafik';
import CekTagihanPanel from './CekTagihanPanel';
import { ChartBarIcon, ClipboardDocumentListIcon, CreditCardIcon, ArrowRightOnRectangleIcon } from './icons';
import type { Resident, Iuran, Pengeluaran, PemasukanLain, IuranConfig } from '../types';

interface PublicLayoutProps {
  onLoginClick: () => void;
  appData: {
    residents: Resident[];
    iuran: Iuran[];
    pengeluaran: Pengeluaran[];
    pemasukanLain: PemasukanLain[];
    iuranConfig: IuranConfig;
  };
}

type PublicView = 'rekapitulasi' | 'grafik' | 'cekTagihan';

const PublicLayout: React.FC<PublicLayoutProps> = ({ onLoginClick, appData }) => {
  const [currentView, setCurrentView] = useState<PublicView>('rekapitulasi');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Laporan Warga RT</h1>
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowRightOnRectangleIcon />
              <span className="hidden sm:inline">Login Pengurus</span>
            </button>
          </div>
          <nav className="mt-4">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button onClick={() => setCurrentView('rekapitulasi')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'rekapitulasi' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <ClipboardDocumentListIcon /> Rekapitulasi Keuangan
              </button>
              <button onClick={() => setCurrentView('grafik')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'grafik' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <ChartBarIcon /> Grafik Warga
              </button>
              <button onClick={() => setCurrentView('cekTagihan')} className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === 'cekTagihan' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <CreditCardIcon /> Cek Tagihan
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'rekapitulasi' && <PublicRekapitulasi {...appData} />}
        {currentView === 'grafik' && <PublicGrafik residents={appData.residents} />}
        {currentView === 'cekTagihan' && <CekTagihanPanel residents={appData.residents} iuran={appData.iuran} iuranConfig={appData.iuranConfig} />}
      </main>
       <footer className="bg-white mt-8 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Aplikasi Database Warga RT. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
};

export default PublicLayout;

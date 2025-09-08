
import React, { useState } from 'react';
import PublicView from './components/PublicView';
import MainLayout from './components/MainLayout';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { User, Role, Resident, AdminLists, Iuran, IuranConfig, Pengeluaran, PemasukanLain } from './types';
import { INITIAL_ADMIN_LISTS, INITIAL_IURAN_CONFIG } from './constants';
import { SAMPLE_RESIDENTS } from './utils/sampleData';

function App() {
  const [user, setUser] = useLocalStorage<User | null>('user', null);

  // All data states are lifted up to the App component
  const [residents, setResidents] = useLocalStorage<Resident[]>('residents', SAMPLE_RESIDENTS);
  const [adminLists, setAdminLists] = useLocalStorage<AdminLists>('adminLists', INITIAL_ADMIN_LISTS);
  const [iuran, setIuran] = useLocalStorage<Iuran[]>('iuran', []);
  const [iuranConfig, setIuranConfig] = useLocalStorage<IuranConfig>('iuranConfig', INITIAL_IURAN_CONFIG);
  const [pengeluaran, setPengeluaran] = useLocalStorage<Pengeluaran[]>('pengeluaran', []);
  const [pemasukanLain, setPemasukanLain] = useLocalStorage<PemasukanLain[]>('pemasukanLain', []);

  const handleLogin = (username: string, role: Role) => {
    setUser({ username, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const appData = {
    residents, setResidents,
    adminLists, setAdminLists,
    iuran, setIuran,
    iuranConfig, setIuranConfig,
    pengeluaran, setPengeluaran,
    pemasukanLain, setPemasukanLain,
  };

  if (!user) {
    return (
        <PublicView
            onLogin={handleLogin}
            appData={{ residents, iuran, pengeluaran, pemasukanLain, iuranConfig }}
        />
    );
  }

  return (
    <MainLayout 
        user={user} 
        onLogout={handleLogout}
        appData={appData}
    />
  );
}

export default App;

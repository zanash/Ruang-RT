
import React, { useState } from 'react';
import Login from './Login';
import PublicLayout from './PublicLayout';
import type { Role, Resident, Iuran, Pengeluaran, PemasukanLain, IuranConfig } from '../types';

interface PublicViewProps {
  onLogin: (username: string, role: Role) => void;
  appData: {
    residents: Resident[];
    iuran: Iuran[];
    pengeluaran: Pengeluaran[];
    pemasukanLain: PemasukanLain[];
    iuranConfig: IuranConfig;
  };
}

const PublicView: React.FC<PublicViewProps> = ({ onLogin, appData }) => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <Login onLogin={onLogin} onBack={() => setShowLogin(false)} />;
  }

  return <PublicLayout onLoginClick={() => setShowLogin(true)} appData={appData} />;
};

export default PublicView;

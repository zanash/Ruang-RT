
import React from 'react';
import Dashboard from './Dashboard';
import type { Resident } from '../types';

interface PublicGrafikProps {
    residents: Resident[];
}

const PublicGrafik: React.FC<PublicGrafikProps> = ({ residents }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Grafik Demografi Warga</h2>
            <p className="text-gray-600">Berikut adalah gambaran umum demografi warga di lingkungan RT kita.</p>
            <Dashboard residents={residents} />
        </div>
    );
};

export default PublicGrafik;

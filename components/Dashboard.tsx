import React, { useMemo } from 'react';
import type { Resident } from '../types';
import { UsersIcon, BuildingOfficeIcon } from './icons';

interface DashboardProps {
  residents: Resident[];
}

const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const groupData = (data: Resident[], key: keyof Resident) => {
    return data.reduce((acc, resident) => {
        const value = resident[key] as string;
        if (value) {
            acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`rounded-full p-3 mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
    </div>
);

const BreakdownCard: React.FC<{ title: string, data: Record<string, number> }> = ({ title, data }) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);
    return(
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {sortedData.map(([key, value]) => (
                    <div key={key}>
                        <div className="flex justify-between mb-1 text-sm">
                            <span className="font-medium text-gray-700">{key}</span>
                            <span className="text-gray-500">{value} warga</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                           <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: total > 0 ? `${(value / total) * 100}%` : '0%' }}></div>
                        </div>
                    </div>
                ))}
                {sortedData.length === 0 && <p className="text-gray-500 text-sm">Tidak ada data.</p>}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ residents }) => {

    const stats = useMemo(() => {
        const totalResidents = residents.length;
        const totalFamilies = new Set(residents.map(r => r.noKK)).size;
        
        const gender = groupData(residents, 'jenisKelamin');

        const ageGroups = residents.reduce((acc, r) => {
            const age = calculateAge(r.tanggalLahir);
            if (age !== null) {
                if (age <= 5) acc['Balita (0-5)']++;
                else if (age <= 17) acc['Anak & Remaja (6-17)']++;
                else if (age <= 59) acc['Dewasa (18-59)']++;
                else acc['Lansia (60+)']++;
            }
            return acc;
        }, { 'Balita (0-5)': 0, 'Anak & Remaja (6-17)': 0, 'Dewasa (18-59)': 0, 'Lansia (60+)': 0 });

        const religion = groupData(residents, 'agama');
        const education = groupData(residents, 'pendidikan');
        const maritalStatus = groupData(residents, 'statusPerkawinan');

        return { totalResidents, totalFamilies, gender, ageGroups, religion, education, maritalStatus };
    }, [residents]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Warga" value={stats.totalResidents} icon={<UsersIcon />} color="bg-indigo-500" />
                <StatCard title="Total Keluarga" value={stats.totalFamilies} icon={<BuildingOfficeIcon />} color="bg-teal-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <BreakdownCard title="Berdasarkan Jenis Kelamin" data={stats.gender} />
                 <BreakdownCard title="Berdasarkan Kelompok Usia" data={stats.ageGroups} />
                 <BreakdownCard title="Berdasarkan Agama" data={stats.religion} />
                 <BreakdownCard title="Berdasarkan Pendidikan" data={stats.education} />
                 <BreakdownCard title="Berdasarkan Status Perkawinan" data={stats.maritalStatus} />
            </div>
        </div>
    );
};

export default Dashboard;
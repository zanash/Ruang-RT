
import React, { useState, useMemo } from 'react';
import type { Resident, Iuran, RumahCategory } from '../types';

interface RiwayatIuranPanelProps {
  residents: Resident[];
  iuran: Iuran[];
}

interface KkIuranInfo {
    noKK: string;
    kepalaKeluarga: string;
    noRumah: string;
    statusRT: { lunas: boolean; tanggal?: string };
    statusPKK: { lunas: boolean; tanggal?: string };
}

const RiwayatIuranPanel: React.FC<RiwayatIuranPanelProps> = ({ residents, iuran }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

    const kkIuranData = useMemo((): KkIuranInfo[] => {
        const kkMap = new Map<string, Resident[]>();
        residents.forEach(r => {
            if (!kkMap.has(r.noKK)) {
                kkMap.set(r.noKK, []);
            }
            kkMap.get(r.noKK)?.push(r);
        });
        
        const iuranBulanIni = iuran.filter(i => i.tahun === selectedYear && i.bulan === selectedMonth);

        const summaryList: KkIuranInfo[] = [];
        kkMap.forEach((members, noKK) => {
            const kepalaKeluarga = members.find(m => m.statusHubungan === 'Kepala Keluarga');
            if (kepalaKeluarga) {
                const iuranRT = iuranBulanIni.find(i => i.noKK === noKK && i.jenis === 'RT');
                const iuranPKK = iuranBulanIni.find(i => i.noKK === noKK && i.jenis === 'PKK');
                
                summaryList.push({
                    noKK: noKK,
                    kepalaKeluarga: kepalaKeluarga.nama,
                    noRumah: kepalaKeluarga.noRumah,
                    statusRT: {
                        lunas: !!iuranRT,
                        tanggal: iuranRT ? new Date(iuranRT.tanggalBayar).toLocaleDateString('id-ID') : undefined
                    },
                    statusPKK: {
                        lunas: !!iuranPKK,
                        tanggal: iuranPKK ? new Date(iuranPKK.tanggalBayar).toLocaleDateString('id-ID') : undefined
                    }
                });
            }
        });

        return summaryList.sort((a, b) => a.noRumah.localeCompare(b.noRumah));
    }, [residents, iuran, selectedYear, selectedMonth]);

    const filteredData = useMemo(() => {
        return kkIuranData.filter(kk =>
            kk.kepalaKeluarga.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [kkIuranData, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <div className="flex flex-wrap items-end justify-between gap-4">
                     <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Riwayat Pembayaran Iuran</h2>
                         <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tahun</label>
                                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Bulan</label>
                                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                     </div>
                     <div className="w-full sm:w-auto">
                         <input
                            type="text"
                            placeholder="Cari kepala keluarga..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rumah</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iuran RT</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iuran PKK</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map((kk) => (
                                <tr key={kk.noKK} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kk.kepalaKeluarga}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kk.noRumah}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {kk.statusRT.lunas ? (
                                            <div>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Lunas</span>
                                                <p className="text-gray-500 text-xs mt-1">Tgl: {kk.statusRT.tanggal}</p>
                                            </div>
                                        ) : (
                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Belum Lunas</span>
                                        )}
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {kk.statusPKK.lunas ? (
                                            <div>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Lunas</span>
                                                <p className="text-gray-500 text-xs mt-1">Tgl: {kk.statusPKK.tanggal}</p>
                                            </div>
                                        ) : (
                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Belum Lunas</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        {kkIuranData.length > 0 ? 'Tidak ada hasil yang cocok.' : 'Belum ada data iuran.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> hasil
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">&lt;</button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">&gt;</button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiwayatIuranPanel;


import React, { useState, useMemo } from 'react';
import type { Resident, RumahCategory } from '../types';

interface KkTableProps {
  residents: Resident[];
}

interface KkSummary {
    noKK: string;
    kepalaKeluarga: string;
    noHP?: string;
    alamat: string;
    noRumah: string;
    jumlahAnggota: number;
    kategoriKK: RumahCategory;
}

const KkTable: React.FC<KkTableProps> = ({ residents }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const kkData = useMemo((): KkSummary[] => {
        const kkMap = new Map<string, Resident[]>();
        residents.forEach(r => {
            if (!kkMap.has(r.noKK)) {
                kkMap.set(r.noKK, []);
            }
            kkMap.get(r.noKK)?.push(r);
        });
        
        const summaryList: KkSummary[] = [];
        kkMap.forEach((members, noKK) => {
            const kepalaKeluarga = members.find(m => m.statusHubungan === 'Kepala Keluarga');
            summaryList.push({
                noKK: noKK,
                kepalaKeluarga: kepalaKeluarga?.nama || 'N/A',
                noHP: kepalaKeluarga?.noHP,
                alamat: kepalaKeluarga?.alamat || members[0]?.alamat || 'N/A',
                noRumah: kepalaKeluarga?.noRumah || members[0]?.noRumah || 'N/A',
                jumlahAnggota: members.length,
                kategoriKK: kepalaKeluarga?.kategoriKK || 'C',
            });
        });

        return summaryList.sort((a, b) => a.noRumah.localeCompare(b.noRumah));
    }, [residents]);

    const filteredKkData = useMemo(() => {
        return kkData.filter(kk =>
            Object.values(kk).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [kkData, searchTerm]);

    const paginatedKkData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredKkData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredKkData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredKkData.length / itemsPerPage);

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Cari KK..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. KK</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rumah</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Anggota</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedKkData.map((kk) => (
                            <tr key={kk.noKK} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kk.noKK}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kk.kepalaKeluarga}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kk.noHP}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kk.noRumah}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{kk.kategoriKK}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kk.jumlahAnggota}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{kk.alamat}</td>
                            </tr>
                        ))}
                         {paginatedKkData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">
                                    {kkData.length > 0 ? 'Tidak ada hasil yang cocok.' : 'Belum ada data keluarga.'}
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
                                Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredKkData.length)}</span> dari <span className="font-medium">{filteredKkData.length}</span> hasil
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                    &lt;
                                </button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                    &gt;
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KkTable;
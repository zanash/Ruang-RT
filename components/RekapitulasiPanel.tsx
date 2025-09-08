
import React, { useState, useMemo } from 'react';
import type { Resident, Iuran, Pengeluaran, PemasukanLain, IuranConfig, RumahCategory } from '../types';
import { UsersIcon, BuildingOfficeIcon, ArrowDownTrayIcon } from './icons';

interface RekapitulasiPanelProps {
  residents: Resident[];
  iuran: Iuran[];
  pengeluaran: Pengeluaran[];
  pemasukanLain: PemasukanLain[];
  iuranConfig: IuranConfig;
}

const StatCard: React.FC<{ title: string; value: number | string; icon?: React.ReactNode; color?: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        {icon && <div className={`rounded-full p-3 mr-4 ${color}`}>{icon}</div>}
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
    </div>
);

const exportToCsv = (filename: string, rows: (string | number)[][]) => {
    const processRow = (row: (string | number)[]): string => {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
            let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
            if (String(row[j]).includes(',')) {
                innerValue = `"${innerValue.replace(/"/g, '""')}"`;
            }
            finalVal += innerValue + ',';
        }
        return finalVal.slice(0, -1) + '\r\n';
    };

    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(row => {
        csvContent += processRow(row);
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const RekapitulasiPanel: React.FC<RekapitulasiPanelProps> = ({ residents, iuran, pengeluaran, pemasukanLain, iuranConfig }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    const formatCurrencyForCsv = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(amount);

    const uniqueKKs = useMemo(() => {
        const kkMap = new Map<string, Resident[]>();
        residents.forEach(r => {
            if (!kkMap.has(r.noKK)) {
                kkMap.set(r.noKK, []);
            }
            kkMap.get(r.noKK)?.push(r);
        });
        
        const kkInfoList: { noKK: string; kategoriKK: RumahCategory }[] = [];
        kkMap.forEach((members, noKK) => {
            const kepalaKeluarga = members.find(m => m.statusHubungan === 'Kepala Keluarga');
            kkInfoList.push({
                noKK: noKK,
                kategoriKK: kepalaKeluarga?.kategoriKK || 'C',
            });
        });

        return kkInfoList;
    }, [residents]);

    const residentStats = useMemo(() => {
        const totalResidents = residents.length;
        const totalFamilies = new Set(residents.map(r => r.noKK)).size;
        return { totalResidents, totalFamilies };
    }, [residents]);

    const financialStats = useMemo(() => {
        const pemasukanIuran = iuran
            .filter(p => p.tahun === selectedYear && p.bulan === selectedMonth)
            .reduce((sum, p) => sum + p.jumlah, 0);

        const pemasukanLainnya = pemasukanLain
            .filter(p => {
                const tgl = new Date(p.tanggal);
                return tgl.getFullYear() === selectedYear && tgl.getMonth() + 1 === selectedMonth;
            })
            .reduce((sum, p) => sum + p.jumlah, 0);
        
        const totalPemasukan = pemasukanIuran + pemasukanLainnya;

        const pengeluaranBulanIni = pengeluaran
            .filter(p => {
                const tgl = new Date(p.tanggal);
                return tgl.getFullYear() === selectedYear && tgl.getMonth() + 1 === selectedMonth;
            })
            .reduce((sum, p) => sum + p.jumlah, 0);

        const saldo = totalPemasukan - pengeluaranBulanIni;
        
        const totalExpected = uniqueKKs.reduce((acc, kk) => {
            const config = iuranConfig[kk.kategoriKK] || { RT: 0, PKK: 0 };
            return acc + config.RT + config.PKK;
        }, 0);

        return { pemasukan: totalPemasukan, pengeluaran: pengeluaranBulanIni, saldo, totalExpected };

    }, [iuran, pengeluaran, pemasukanLain, selectedYear, selectedMonth, uniqueKKs, iuranConfig]);
    
    const transactions = useMemo(() => {
        const incomeTransactionsIuran = iuran
            .filter(p => p.tahun === selectedYear && p.bulan === selectedMonth)
            .map(p => {
                 const kepalaKeluarga = residents.find(r => r.noKK === p.noKK && r.statusHubungan === 'Kepala Keluarga');
                 return {
                    id: p.id,
                    tanggal: p.tanggalBayar,
                    deskripsi: `Iuran ${p.jenis} - ${kepalaKeluarga?.nama || p.noKK}`,
                    jumlah: p.jumlah,
                    type: 'income' as const
                }
            });
            
        const incomeTransactionsLain = pemasukanLain
             .filter(p => {
                const tgl = new Date(p.tanggal);
                return tgl.getFullYear() === selectedYear && tgl.getMonth() + 1 === selectedMonth;
            })
            .map(p => ({
                id: p.id,
                tanggal: p.tanggal,
                deskripsi: p.deskripsi,
                jumlah: p.jumlah,
                type: 'income' as const
            }));
        
        const expenseTransactions = pengeluaran
            .filter(p => {
                const tgl = new Date(p.tanggal);
                return tgl.getFullYear() === selectedYear && tgl.getMonth() + 1 === selectedMonth;
            })
            .map(p => ({
                id: p.id,
                tanggal: p.tanggal,
                deskripsi: p.deskripsi,
                jumlah: p.jumlah,
                type: 'expense' as const
            }));
            
        return [...incomeTransactionsIuran, ...incomeTransactionsLain, ...expenseTransactions].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    }, [iuran, pengeluaran, pemasukanLain, selectedYear, selectedMonth, residents]);

    const handleExport = (type: 'RT' | 'PKK' | 'Keseluruhan') => {
        const monthName = months.find(m => m.value === selectedMonth)?.name;
        const filename = `Laporan_${type}_${monthName}_${selectedYear}.csv`;
        let csvRows: (string | number)[][] = [];
        
        if (type === 'Keseluruhan') {
            csvRows.push([`Laporan Keuangan Keseluruhan`]);
            csvRows.push([`Periode: ${monthName} ${selectedYear}`]);
            csvRows.push([]);
            csvRows.push(['', 'Ringkasan Keuangan']);
            csvRows.push(['', 'Total Pemasukan', formatCurrencyForCsv(financialStats.pemasukan)]);
            csvRows.push(['', 'Total Pengeluaran', formatCurrencyForCsv(financialStats.pengeluaran)]);
            csvRows.push(['', 'Saldo Akhir', formatCurrencyForCsv(financialStats.saldo)]);
            csvRows.push([]);
            csvRows.push(['Tanggal', 'Keterangan', 'Pemasukan (IDR)', 'Pengeluaran (IDR)']);
            transactions.forEach(tx => {
                csvRows.push([
                    new Date(tx.tanggal).toLocaleDateString('id-ID'),
                    tx.deskripsi,
                    tx.type === 'income' ? formatCurrencyForCsv(tx.jumlah) : '',
                    tx.type === 'expense' ? formatCurrencyForCsv(tx.jumlah) : '',
                ]);
            });
        } else { // RT or PKK
            const filteredIuran = transactions.filter(tx => tx.deskripsi.includes(`Iuran ${type}`));
            const totalIuran = filteredIuran.reduce((sum, tx) => sum + tx.jumlah, 0);

            csvRows.push([`Laporan Pemasukan Iuran ${type}`]);
            csvRows.push([`Periode: ${monthName} ${selectedYear}`]);
            csvRows.push([]);
            csvRows.push(['', 'Total Pemasukan Iuran', formatCurrencyForCsv(totalIuran)]);
            csvRows.push([]);
            csvRows.push(['Tanggal Bayar', 'Keterangan', 'Jumlah (IDR)']);
            filteredIuran.forEach(tx => {
                csvRows.push([
                    new Date(tx.tanggal).toLocaleDateString('id-ID'),
                    tx.deskripsi,
                    formatCurrencyForCsv(tx.jumlah),
                ]);
            });
        }
        
        exportToCsv(filename, csvRows);
    };

    return (
         <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Periode Rekapitulasi</h2>
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
                     <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-right">Ekspor Laporan</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <button onClick={() => handleExport('RT')} className="inline-flex items-center gap-2 justify-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100">
                                <ArrowDownTrayIcon /> Laporan RT
                            </button>
                             <button onClick={() => handleExport('PKK')} className="inline-flex items-center gap-2 justify-center px-3 py-2 border border-purple-600 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100">
                                <ArrowDownTrayIcon /> Laporan PKK
                            </button>
                            <button onClick={() => handleExport('Keseluruhan')} className="inline-flex items-center gap-2 justify-center px-3 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                                <ArrowDownTrayIcon /> Keseluruhan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rekapitulasi Warga */}
            <div>
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Rekapitulasi Warga (Keseluruhan)</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Total Warga" value={residentStats.totalResidents} icon={<UsersIcon />} color="bg-indigo-500" />
                    <StatCard title="Total Keluarga" value={residentStats.totalFamilies} icon={<BuildingOfficeIcon />} color="bg-teal-500" />
                </div>
            </div>

            {/* Rekapitulasi Keuangan */}
            <div>
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Rekapitulasi Keuangan - {months.find(m => m.value === selectedMonth)?.name} {selectedYear}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Target Iuran Wajib" value={formatCurrency(financialStats.totalExpected)} color="bg-yellow-500" />
                    <StatCard title="Total Pemasukan" value={formatCurrency(financialStats.pemasukan)} color="bg-green-500" />
                    <StatCard title="Total Pengeluaran" value={formatCurrency(financialStats.pengeluaran)} color="bg-red-500" />
                    <StatCard title="Saldo Akhir" value={formatCurrency(financialStats.saldo)} color="bg-blue-500" />
                </div>
                
                 <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-900 p-4 border-b">Rincian Transaksi</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{tx.deskripsi}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.jumlah)}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                     <tr>
                                        <td colSpan={3} className="text-center py-10 text-gray-500">Tidak ada transaksi pada periode ini.</td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default RekapitulasiPanel;
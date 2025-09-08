
import React, { useState, useMemo } from 'react';
import type { Resident, Iuran, Pengeluaran, PemasukanLain } from '../types';

interface PublicRekapitulasiProps {
  residents: Resident[];
  iuran: Iuran[];
  pengeluaran: Pengeluaran[];
  pemasukanLain: PemasukanLain[];
}

const StatCard: React.FC<{ title: string; value: string; color: string; }> = ({ title, value, color }) => (
    <div className={`border-l-4 ${color} bg-white p-6 rounded-r-lg shadow-md`}>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
);


const PublicRekapitulasi: React.FC<PublicRekapitulasiProps> = ({ residents, iuran, pengeluaran, pemasukanLain }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    
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
        
        return { pemasukan: totalPemasukan, pengeluaran: pengeluaranBulanIni, saldo };

    }, [iuran, pengeluaran, pemasukanLain, selectedYear, selectedMonth]);
    
    const transactions = useMemo(() => {
        const incomeTransactionsIuran = iuran
            .filter(p => p.tahun === selectedYear && p.bulan === selectedMonth)
            .map(p => ({
                id: p.id,
                tanggal: p.tanggalBayar,
                deskripsi: `Pembayaran Iuran Warga (${p.jenis})`,
                jumlah: p.jumlah,
                type: 'income' as const
            }));
            
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

    }, [iuran, pengeluaran, pemasukanLain, selectedYear, selectedMonth]);

    return (
         <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Periode Laporan</h2>
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
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Laporan Keuangan - {months.find(m => m.value === selectedMonth)?.name} {selectedYear}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total Pemasukan" value={formatCurrency(financialStats.pemasukan)} color="border-green-500" />
                    <StatCard title="Total Pengeluaran" value={formatCurrency(financialStats.pengeluaran)} color="border-red-500" />
                    <StatCard title="Saldo Akhir" value={formatCurrency(financialStats.saldo)} color="border-blue-500" />
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

export default PublicRekapitulasi;

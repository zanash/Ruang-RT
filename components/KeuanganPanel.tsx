import React, { useState, useMemo } from 'react';
import type { Resident, Iuran, IuranType, Pengeluaran, PemasukanLain, IuranConfig, RumahCategory } from '../types';
import { IURAN_LABELS } from '../constants';
import { TrashIcon, EyeIcon } from './icons';

interface KeuanganPanelProps {
  residents: Resident[];
  iuran: Iuran[];
  setIuran: React.Dispatch<React.SetStateAction<Iuran[]>>;
  iuranConfig: IuranConfig;
  pengeluaran: Pengeluaran[];
  setPengeluaran: React.Dispatch<React.SetStateAction<Pengeluaran[]>>;
  pemasukanLain: PemasukanLain[];
  setPemasukanLain: React.Dispatch<React.SetStateAction<PemasukanLain[]>>;
  onShowReceipt: (base64Image: string) => void;
}

interface KKInfo {
    noKK: string;
    kepalaKeluarga: string;
    noRumah: string;
    kategoriKK: RumahCategory;
}

const StatCard: React.FC<{ title: string; value: string; subvalue?: string; }> = ({ title, value, subvalue }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subvalue && <p className="text-xs text-gray-500">{subvalue}</p>}
    </div>
);

const KeuanganPanel: React.FC<KeuanganPanelProps> = ({ 
    residents, iuran, setIuran, iuranConfig, 
    pengeluaran, setPengeluaran, pemasukanLain, setPemasukanLain,
    onShowReceipt
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const todayISO = new Date().toISOString().split('T')[0];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const [newExpense, setNewExpense] = useState({ tanggal: todayISO, deskripsi: '', jumlah: '', bukti: '' });
  const [newIncome, setNewIncome] = useState({ tanggal: todayISO, deskripsi: '', jumlah: '' });


  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const uniqueKKs = useMemo((): KKInfo[] => {
    const kkMap = new Map<string, Resident[]>();
    residents.forEach(r => {
        if (!kkMap.has(r.noKK)) {
            kkMap.set(r.noKK, []);
        }
        kkMap.get(r.noKK)?.push(r);
    });
    
    const kkInfoList: KKInfo[] = [];
    kkMap.forEach((members, noKK) => {
        const kepalaKeluarga = members.find(m => m.statusHubungan === 'Kepala Keluarga');
        kkInfoList.push({
            noKK: noKK,
            kepalaKeluarga: kepalaKeluarga?.nama || 'N/A',
            noRumah: kepalaKeluarga?.noRumah || members[0]?.noRumah || 'N/A',
            kategoriKK: kepalaKeluarga?.kategoriKK || 'C',
        });
    });

    return kkInfoList.sort((a,b) => a.noRumah.localeCompare(b.noRumah));
  }, [residents]);
  
  const filteredData = useMemo(() => {
    const filterByMonthYear = (items: (Pengeluaran | PemasukanLain)[]) => 
        items.filter(p => {
            const tgl = new Date(p.tanggal);
            return tgl.getFullYear() === selectedYear && tgl.getMonth() + 1 === selectedMonth;
        }).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        
    return {
        iuran: iuran.filter(i => i.tahun === selectedYear && i.bulan === selectedMonth),
        pengeluaran: filterByMonthYear(pengeluaran) as Pengeluaran[],
        pemasukanLain: filterByMonthYear(pemasukanLain) as PemasukanLain[],
    };
  }, [iuran, pengeluaran, pemasukanLain, selectedYear, selectedMonth]);


  const stats = useMemo(() => {
      const collectedRT = filteredData.iuran.filter(i => i.jenis === 'RT').reduce((sum, i) => sum + i.jumlah, 0);
      const collectedPKK = filteredData.iuran.filter(i => i.jenis === 'PKK').reduce((sum, i) => sum + i.jumlah, 0);
      const collectedLain = filteredData.pemasukanLain.reduce((sum, p) => sum + p.jumlah, 0);
      const totalPemasukan = collectedRT + collectedPKK + collectedLain;
      const totalPengeluaran = filteredData.pengeluaran.reduce((sum, p) => sum + p.jumlah, 0);
      const saldo = totalPemasukan - totalPengeluaran;

      return { totalPemasukan, totalPengeluaran, saldo };
  }, [filteredData]);


  const handlePay = (noKK: string, jenis: IuranType) => {
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('id-ID', { month: 'long' });
    const kkInfo = uniqueKKs.find(k => k.noKK === noKK);
    if (!kkInfo) return;

    const amount = iuranConfig[kkInfo.kategoriKK]?.[jenis] || 0;

    if (!window.confirm(`Konfirmasi pembayaran ${IURAN_LABELS[jenis]} (${formatCurrency(amount)}) untuk KK ${kkInfo.kepalaKeluarga} bulan ${monthName} ${selectedYear}?`)) return;
    
    const newPayment: Iuran = {
        id: `${noKK}-${selectedYear}-${selectedMonth}-${jenis}`,
        noKK,
        tahun: selectedYear,
        bulan: selectedMonth,
        jenis,
        jumlah: amount,
        tanggalBayar: new Date().toISOString(),
    };
    setIuran(prev => [...prev.filter(p => p.id !== newPayment.id), newPayment]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExpense(prev => ({ ...prev, bukti: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Generic handler for income and expense forms
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'income' | 'expense') => {
    const { name, value } = e.target;
    if (type === 'income') {
        setNewIncome(prev => ({ ...prev, [name]: value }));
    } else {
        setNewExpense(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const { deskripsi, jumlah, tanggal, bukti } = newExpense;
    if (deskripsi.trim() && parseFloat(jumlah) > 0 && tanggal) {
      const expense: Pengeluaran = {
        id: new Date().toISOString(),
        tanggal,
        deskripsi: deskripsi.trim(),
        jumlah: parseFloat(jumlah),
        bukti,
      };
      setPengeluaran(prev => [...prev, expense]);
      setNewExpense({ tanggal: todayISO, deskripsi: '', jumlah: '', bukti: '' });
    }
  };
  
   const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const { deskripsi, jumlah, tanggal } = newIncome;
    if (deskripsi.trim() && parseFloat(jumlah) > 0 && tanggal) {
      const income: PemasukanLain = {
        id: new Date().toISOString(),
        tanggal,
        deskripsi: deskripsi.trim(),
        jumlah: parseFloat(jumlah),
      };
      setPemasukanLain(prev => [...prev, income]);
      setNewIncome({ tanggal: todayISO, deskripsi: '', jumlah: '' });
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Hapus data pengeluaran ini?')) {
      setPengeluaran(prev => prev.filter(p => p.id !== id));
    }
  };
  
  const handleDeleteIncome = (id: string) => {
    if (window.confirm('Hapus data pemasukan ini?')) {
      setPemasukanLain(prev => prev.filter(p => p.id !== id));
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
             <h2 className="text-xl font-semibold text-gray-800">Kelola Keuangan</h2>
             <div className="flex gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Pemasukan" value={formatCurrency(stats.totalPemasukan)} />
            <StatCard title="Total Pengeluaran" value={formatCurrency(stats.totalPengeluaran)} />
            <StatCard title="Saldo" value={formatCurrency(stats.saldo)} />
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h3 className="text-lg font-medium text-gray-900 p-4 border-b">Status Pembayaran Iuran Wajib</h3>
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rumah</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Iuran RT</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Iuran PKK</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uniqueKKs.map(kk => {
                const hasPaidRT = filteredData.iuran.some(i => i.noKK === kk.noKK && i.jenis === 'RT');
                const hasPaidPKK = filteredData.iuran.some(i => i.noKK === kk.noKK && i.jenis === 'PKK');
                return (
                  <tr key={kk.noKK} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kk.kepalaKeluarga}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kk.noRumah}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {hasPaidRT ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Lunas</span>
                      ) : (
                        <button onClick={() => handlePay(kk.noKK, 'RT')} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700">Bayar</button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {hasPaidPKK ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Lunas</span>
                      ) : (
                        <button onClick={() => handlePay(kk.noKK, 'PKK')} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700">Bayar</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pemasukan Lain */}
        <div className="bg-white shadow-md rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 p-4 border-b">Pemasukan Lain</h3>
             <form onSubmit={handleAddIncome} className="p-4 border-b space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                  <input type="date" name="tanggal" value={newIncome.tanggal} onChange={(e) => handleTransactionChange(e, 'income')} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <input type="text" name="deskripsi" value={newIncome.deskripsi} onChange={(e) => handleTransactionChange(e, 'income')} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                    <input type="number" name="jumlah" value={newIncome.jumlah} onChange={(e) => handleTransactionChange(e, 'income')} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">Tambah Pemasukan</button>
            </form>
             <div className="overflow-y-auto max-h-[40vh] p-2">
                {filteredData.pemasukanLain.length > 0 ? (
                <ul className="space-y-2">
                    {filteredData.pemasukanLain.map(p => (
                    <li key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border">
                        <div className="text-sm">
                        <p className="text-gray-800">{p.deskripsi}</p>
                        <p className="text-gray-500">{new Date(p.tanggal).toLocaleDateString('id-ID')} - {formatCurrency(p.jumlah)}</p>
                        </div>
                        <button onClick={() => handleDeleteIncome(p.id)} className="text-red-500 hover:text-red-700">
                           <TrashIcon />
                        </button>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-center text-sm text-gray-500 py-4">Belum ada pemasukan lain bulan ini.</p>
                )}
            </div>
        </div>
        
        {/* Laporan Pengeluaran */}
        <div className="bg-white shadow-md rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 p-4 border-b">Laporan Pengeluaran</h3>
          <form onSubmit={handleAddExpense} className="p-4 border-b space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                  <input type="date" name="tanggal" value={newExpense.tanggal} onChange={(e) => handleTransactionChange(e, 'expense')} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <input type="text" name="deskripsi" value={newExpense.deskripsi} onChange={(e) => handleTransactionChange(e, 'expense')} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                  <input type="number" name="jumlah" value={newExpense.jumlah} onChange={(e) => handleTransactionChange(e, 'expense')} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Bukti Kwitansi (Foto)</label>
                   <input type="file" name="bukti" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Tambah Pengeluaran</button>
          </form>
           <div className="overflow-y-auto max-h-[40vh] p-2">
            {filteredData.pengeluaran.length > 0 ? (
              <ul className="space-y-2">
                {filteredData.pengeluaran.map(p => (
                  <li key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border">
                    <div className="text-sm flex-1">
                      <p className="text-gray-800">{p.deskripsi}</p>
                      <p className="text-gray-500">{new Date(p.tanggal).toLocaleDateString('id-ID')} - {formatCurrency(p.jumlah)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {p.bukti && (
                             <button onClick={() => onShowReceipt(p.bukti as string)} className="text-indigo-600 hover:text-indigo-800">
                                <EyeIcon />
                            </button>
                        )}
                        <button onClick={() => handleDeleteExpense(p.id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon />
                        </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">Belum ada pengeluaran bulan ini.</p>
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default KeuanganPanel;
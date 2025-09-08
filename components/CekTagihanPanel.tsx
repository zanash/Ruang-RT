import React, { useState, useMemo } from 'react';
import type { Resident, Iuran, IuranConfig } from '../types';

interface CekTagihanPanelProps {
  residents: Resident[];
  iuran: Iuran[];
  iuranConfig: IuranConfig;
}

interface Tagihan {
    bulan: string;
    tahun: number;
    tagihanRT: number | null;
    tagihanPKK: number | null;
}

const CekTagihanPanel: React.FC<CekTagihanPanelProps> = ({ residents, iuran, iuranConfig }) => {
  const [noKK, setNoKK] = useState('');
  const [kepalaKeluarga, setKepalaKeluarga] = useState<Resident | null>(null);
  const [tagihan, setTagihan] = useState<Tagihan[] | null>(null);
  const [error, setError] = useState('');
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleCekTagihan = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTagihan(null);
    setKepalaKeluarga(null);

    if (noKK.length !== 16 || !/^\d+$/.test(noKK)) {
      setError('Nomor KK harus terdiri dari 16 digit angka.');
      return;
    }

    const kkKepala = residents.find(r => r.noKK === noKK && r.statusHubungan === 'Kepala Keluarga');

    if (!kkKepala) {
      setError('Nomor KK tidak ditemukan atau bukan Kepala Keluarga.');
      return;
    }

    setKepalaKeluarga(kkKepala);
    
    const kategori = kkKepala.kategoriKK || 'C';
    const config = iuranConfig[kategori];
    const tagihanList: Tagihan[] = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
        const dateToCheck = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = dateToCheck.getFullYear();
        const month = dateToCheck.getMonth() + 1;

        const hasPaidRT = iuran.some(p => p.noKK === noKK && p.tahun === year && p.bulan === month && p.jenis === 'RT');
        const hasPaidPKK = iuran.some(p => p.noKK === noKK && p.tahun === year && p.bulan === month && p.jenis === 'PKK');

        const tunggakan: Tagihan = {
            tahun: year,
            bulan: dateToCheck.toLocaleString('id-ID', { month: 'long' }),
            tagihanRT: hasPaidRT ? null : config.RT,
            tagihanPKK: hasPaidPKK ? null : config.PKK,
        };
        
        if(tunggakan.tagihanRT !== null || tunggakan.tagihanPKK !== null) {
            tagihanList.push(tunggakan);
        }
    }
    setTagihan(tagihanList);
  };

  const totalTagihan = useMemo(() => {
    if (!tagihan) return 0;
    return tagihan.reduce((acc, current) => acc + (current.tagihanRT || 0) + (current.tagihanPKK || 0), 0);
  }, [tagihan]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Cek Tagihan Iuran Warga</h2>
      <p className="text-gray-600 mb-6">Masukkan Nomor Kartu Keluarga (KK) Anda untuk melihat tagihan yang belum dibayar dalam 6 bulan terakhir.</p>
      <form onSubmit={handleCekTagihan} className="space-y-4">
        <div>
          <label htmlFor="noKK" className="block text-sm font-medium text-gray-700">Nomor Kartu Keluarga (16 Digit)</label>
          <input
            id="noKK"
            type="text"
            value={noKK}
            onChange={(e) => setNoKK(e.target.value.replace(/\D/g, ''))}
            maxLength={16}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Contoh: 3201010101010001"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
          Cek Tagihan
        </button>
      </form>
      
      {kepalaKeluarga && tagihan && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900">Hasil Pengecekan</h3>
          <p className="text-sm text-gray-600">Kepala Keluarga: <span className="font-semibold">{kepalaKeluarga.nama}</span></p>
          <p className="text-sm text-gray-600">Nomor Rumah: <span className="font-semibold">{kepalaKeluarga.noRumah}</span></p>

          {tagihan.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md">Ditemukan tunggakan iuran sebagai berikut. Mohon segera selesaikan pembayaran ke Bendahara RT.</p>
              
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">Total Tunggakan</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(totalTagihan)}</p>
              </div>

              <ul className="divide-y divide-gray-200 border-t mt-4 pt-4">
                {tagihan.map(t => (
                  <li key={`${t.tahun}-${t.bulan}`} className="py-3">
                    <p className="font-semibold text-gray-800">{t.bulan} {t.tahun}</p>
                    <div className="pl-4 text-sm">
                        {t.tagihanRT !== null && <p className="text-gray-700">Iuran RT: {formatCurrency(t.tagihanRT)}</p>}
                        {t.tagihanPKK !== null && <p className="text-gray-700">Iuran PKK: {formatCurrency(t.tagihanPKK)}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
             <div className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-md">
                <p className="font-semibold">Terima kasih!</p>
                <p>Tidak ditemukan tunggakan iuran dalam 6 bulan terakhir.</p>
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CekTagihanPanel;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Resident, AdminLists } from '../types';

interface ResidentFormProps {
  onSave: (resident: Resident) => void;
  onClose: () => void;
  existingResident: Resident | null;
  adminLists: AdminLists;
  allResidents: Resident[];
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

const ResidentForm: React.FC<ResidentFormProps> = ({ onSave, onClose, existingResident, adminLists, allResidents }) => {
  const [resident, setResident] = useState<Omit<Resident, 'id'>>({
    nama: '',
    noKK: '',
    alamat: '',
    nik: '',
    jenisKelamin: 'Laki-laki',
    tempatLahir: '',
    tanggalLahir: '',
    agama: '',
    pendidikan: '',
    pekerjaan: '',
    statusPerkawinan: '',
    tanggalPerkawinanPerceraian: '',
    statusHubungan: '',
    noRumah: '',
    kategoriKK: 'C',
    noHP: '',
  });
  
  const [age, setAge] = useState<number | null>(null);
  const [kepalaKeluargaName, setKepalaKeluargaName] = useState<string | null>(null);

  const isKepalaKeluarga = resident.statusHubungan === 'Kepala Keluarga';
  
  useEffect(() => {
    if (existingResident) {
      setResident({
          ...existingResident,
          kategoriKK: existingResident.kategoriKK || 'C'
      });
      setAge(calculateAge(existingResident.tanggalLahir));
    }
  }, [existingResident]);

  useEffect(() => {
    if (!isKepalaKeluarga && resident.noKK && resident.noKK.length >= 16) {
        const kkKepala = allResidents.find(r => r.noKK === resident.noKK && r.statusHubungan === 'Kepala Keluarga');
        if (kkKepala) {
            setKepalaKeluargaName(kkKepala.nama);
            // Autofill address and house number
            setResident(prev => ({
                ...prev,
                alamat: kkKepala.alamat,
                noRumah: kkKepala.noRumah,
            }));
        } else {
            setKepalaKeluargaName(null);
        }
    } else {
        setKepalaKeluargaName(null);
    }
  }, [resident.noKK, resident.statusHubungan, isKepalaKeluarga, allResidents]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResident(prev => {
        let newState = { ...prev, [name]: value };
        
        // Handle logic when changing status
        if (name === 'statusHubungan') {
            if (value !== 'Kepala Keluarga') {
                newState.kategoriKK = undefined;
            } else {
                // If status becomes Kepala Keluarga, set a default category if not already set
                if (!newState.kategoriKK) newState.kategoriKK = 'C';
                // Also, clear the auto-filled data if they switch back to Kepala Keluarga
                setKepalaKeluargaName(null);
            }
        }
        
        return newState;
    });

    if (name === 'tanggalLahir') {
        setAge(calculateAge(value));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalResident: Resident = {
      ...resident,
      id: existingResident?.id || new Date().toISOString()
    };
    onSave(finalResident);
  };

  const needsMarriageDateField = resident.statusPerkawinan === 'Kawin' || resident.statusPerkawinan === 'Cerai Hidup' || resident.statusPerkawinan === 'Cerai Mati';
  const isAddressLocked = kepalaKeluargaName !== null && !isKepalaKeluarga;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Kolom 1 */}
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" name="nama" value={resident.nama} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor Induk Kependudukan (NIK)</label>
              <input type="text" name="nik" value={resident.nik} onChange={handleChange} required pattern="\d{16}" title="NIK harus terdiri dari 16 digit angka" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Handphone</label>
                <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+62</span>
                    <input
                        type="tel"
                        name="noHP"
                        value={resident.noHP?.startsWith('62') ? resident.noHP.slice(2) : (resident.noHP || '')}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '');
                            const syntheticEvent = {
                                target: {
                                    name: 'noHP',
                                    value: numericValue ? `62${numericValue}` : ''
                                }
                            } as React.ChangeEvent<HTMLInputElement>;
                            handleChange(syntheticEvent);
                        }}
                        placeholder="81234567890"
                        className="block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
              <select name="jenisKelamin" value={resident.jenisKelamin} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
              <input type="text" name="tempatLahir" value={resident.tempatLahir} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input type="date" name="tanggalLahir" value={resident.tanggalLahir} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {age !== null && (
                  <span className="absolute right-3 bottom-2 text-sm text-gray-500 bg-white px-1">{age} tahun</span>
              )}
            </div>
        </div>

        {/* Kolom 2 */}
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Agama</label>
              <select name="agama" value={resident.agama} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Pilih Agama</option>
                {adminLists.agama.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
              <select name="pendidikan" value={resident.pendidikan} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Pilih Pendidikan</option>
                {adminLists.pendidikan.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pekerjaan</label>
              <select name="pekerjaan" value={resident.pekerjaan} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Pilih Pekerjaan</option>
                {adminLists.pekerjaan.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status Perkawinan</label>
              <select name="statusPerkawinan" value={resident.statusPerkawinan} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Pilih Status</option>
                {adminLists.statusPerkawinan.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            {needsMarriageDateField && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Perkawinan/Perceraian</label>
                <input type="date" name="tanggalPerkawinanPerceraian" value={resident.tanggalPerkawinanPerceraian} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            )}
        </div>
        
        {/* Kolom 3 */}
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status Hub. dalam Keluarga</label>
              <select name="statusHubungan" value={resident.statusHubungan} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Pilih Status</option>
                {adminLists.statusHubungan.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Nomor Kartu Keluarga (KK)</label>
              <input type="text" name="noKK" value={resident.noKK} onChange={handleChange} required pattern="\d{16}" title="No. KK harus terdiri dari 16 digit angka" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {kepalaKeluargaName && (
                  <span className="absolute right-3 bottom-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      KK: {kepalaKeluargaName}
                  </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor Rumah</label>
               <select name="noRumah" value={resident.noRumah} onChange={handleChange} required 
                disabled={isAddressLocked}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${isAddressLocked ? 'bg-gray-100' : ''}`}
               >
                <option value="">Pilih No Rumah</option>
                {adminLists.noRumah.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            {isKepalaKeluarga && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori KK</label>
                    <select name="kategoriKK" value={resident.kategoriKK} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
            )}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                <textarea name="alamat" value={resident.alamat} onChange={handleChange} required rows={3} 
                 disabled={isAddressLocked}
                 className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${isAddressLocked ? 'bg-gray-100' : ''}`}
                ></textarea>
            </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Batal
        </button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Simpan
        </button>
      </div>
    </form>
  );
};

export default ResidentForm;
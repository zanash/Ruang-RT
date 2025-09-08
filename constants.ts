
import type { AdminLists, IuranConfig } from './types';

export const INITIAL_ADMIN_LISTS: AdminLists = {
  agama: ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu'],
  pendidikan: ['Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'Diploma', 'S1', 'S2', 'S3'],
  pekerjaan: ['Belum/Tidak Bekerja', 'Pelajar/Mahasiswa', 'PNS', 'TNI/POLRI', 'Karyawan Swasta', 'Wiraswasta', 'Pensiunan'],
  statusPerkawinan: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'],
  statusHubungan: ['Kepala Keluarga', 'Istri', 'Anak', 'Orang Tua', 'Lainnya'],
  noRumah: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
};

export const ADMIN_LIST_CATEGORIES: { key: keyof AdminLists, label: string }[] = [
    { key: 'agama', label: 'Agama' },
    { key: 'pendidikan', label: 'Pendidikan' },
    { key: 'pekerjaan', label: 'Pekerjaan' },
    { key: 'statusPerkawinan', label: 'Status Perkawinan' },
    { key: 'statusHubungan', label: 'Status Hubungan Dalam Keluarga' },
    { key: 'noRumah', label: 'Nomor Rumah' },
];

export const INITIAL_IURAN_CONFIG: IuranConfig = {
  A: { RT: 75000, PKK: 15000 },
  B: { RT: 50000, PKK: 10000 },
  C: { RT: 35000, PKK: 5000 },
  D: { RT: 30000, PKK: 5000 },
};

export const IURAN_LABELS = {
  RT: 'Iuran RT',
  PKK: 'Iuran PKK',
};

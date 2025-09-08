
export interface Resident {
  id: string;
  nama: string;
  noKK: string;
  alamat: string;
  nik: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  statusPerkawinan: string;
  tanggalPerkawinanPerceraian?: string;
  statusHubungan: string;
  noRumah: string;
  kategoriKK?: RumahCategory;
  noHP?: string;
}

export type AdminListCategory = 
  | 'agama' 
  | 'pendidikan' 
  | 'pekerjaan' 
  | 'statusPerkawinan' 
  | 'statusHubungan' 
  | 'noRumah';

export interface AdminLists {
  agama: string[];
  pendidikan: string[];
  pekerjaan: string[];
  statusPerkawinan: string[];
  statusHubungan: string[];
  noRumah: string[];
}

export type Role = 'admin' | 'bendahara';

export interface User {
  username: string;
  role: Role;
}

export type IuranType = 'RT' | 'PKK';

export interface Iuran {
  id: string;
  noKK: string;
  tahun: number;
  bulan: number; // 1-12
  jenis: IuranType;
  jumlah: number;
  tanggalBayar: string; // ISO string date
}

export type RumahCategory = 'A' | 'B' | 'C' | 'D';

export interface IuranCategoryConfig {
  RT: number;
  PKK: number;
}

export interface IuranConfig {
  A: IuranCategoryConfig;
  B: IuranCategoryConfig;
  C: IuranCategoryConfig;
  D: IuranCategoryConfig;
}

export interface Pengeluaran {
  id: string;
  tanggal: string; // ISO date string
  deskripsi: string;
  jumlah: number;
  bukti?: string; // base64 string
}

export interface PemasukanLain {
    id: string;
    tanggal: string; // ISO date string
    deskripsi: string;
    jumlah: number;
}
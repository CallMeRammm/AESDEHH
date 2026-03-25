// Type definitions
export type Status = 'MENUNGGU' | 'DITERIMA' | 'DITOLAK';

export interface BerkasMagang {
    nama: string;
    nim: string;
    perusahaan: string;
    status: Status;
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
    total?: number;
    keyword?: string;
}

// Status colors for UI
export const statusColors: Record<Status, string> = {
    MENUNGGU: 'bg-yellow-100 text-yellow-800',
    DITERIMA: 'bg-green-100 text-green-800',
    DITOLAK: 'bg-red-100 text-red-800'
};
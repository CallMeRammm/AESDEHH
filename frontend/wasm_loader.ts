// Load and initialize WASM module
declare const createVerifikasiModule: any;

export interface VerifikasiController {
    tambahBerkas(nama: string, nim: string, perusahaan: string): string;
    tampilkanAntrean(): string;
    prosesVerifikasi(status: string): string;
    tampilkanRiwayat(): string;
    tampilkanTerakhir(): string;
    cariBerkas(keyword: string): string;
    hapusAntrean(): string;
    resetRiwayat(): string;
    getAntreanCount(): number;
    getRiwayatCount(): number;
    getDiterimaCount(): number;
    getDitolakCount(): number;
}

export class WasmLoader {
    private static instance: VerifikasiController | null = null;
    private static isLoading = false;
    private static callbacks: Array<(controller: VerifikasiController) => void> = [];

    static async load(): Promise<VerifikasiController> {
        if (this.instance) {
            return this.instance;
        }

        if (this.isLoading) {
            return new Promise((resolve) => {
                this.callbacks.push(resolve);
            });
        }

        this.isLoading = true;

        try {
            const Module = await createVerifikasiModule();
            this.instance = new Module.VerifikasiController();
            
            this.callbacks.forEach(cb => cb(this.instance!));
            this.callbacks = [];
            
            return this.instance!;
        } catch (error) {
            console.error('Failed to load WASM module:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    static getInstance(): VerifikasiController | null {
        return this.instance;
    }
}
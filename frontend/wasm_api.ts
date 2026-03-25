import { WasmLoader, VerifikasiController } from './wasm_loader.js';
import { BerkasMagang, ApiResponse } from './types';

class WasmApi {
    private controller: VerifikasiController | null = null;

    private async getController(): Promise<VerifikasiController> {
        if (!this.controller) {
            this.controller = await WasmLoader.load();
        }
        return this.controller;
    }

    private parseResponse(jsonStr: string): ApiResponse {
        try {
            return JSON.parse(jsonStr);
        } catch {
            return { success: false, message: 'Invalid response' };
        }
    }

    async tambahBerkas(nama: string, nim: string, perusahaan: string): Promise<ApiResponse> {
        const controller = await this.getController();
        const response = controller.tambahBerkas(nama, nim, perusahaan);
        return this.parseResponse(response);
    }

    async getAntrean(): Promise<BerkasMagang[]> {
        const controller = await this.getController();
        const response = controller.tampilkanAntrean();
        const parsed = this.parseResponse(response);
        return parsed.data || [];
    }

    async prosesVerifikasi(status: 'DITERIMA' | 'DITOLAK'): Promise<ApiResponse> {
        const controller = await this.getController();
        const response = controller.prosesVerifikasi(status);
        return this.parseResponse(response);
    }

    async getRiwayat(): Promise<BerkasMagang[]> {
        const controller = await this.getController();
        const response = controller.tampilkanRiwayat();
        const parsed = this.parseResponse(response);
        return parsed.data || [];
    }

    async getTerakhir(): Promise<BerkasMagang | null> {
        const controller = await this.getController();
        const response = controller.tampilkanTerakhir();
        const parsed = this.parseResponse(response);
        return parsed.success ? parsed.data : null;
    }

    async cariBerkas(keyword: string): Promise<BerkasMagang[]> {
        const controller = await this.getController();
        const response = controller.cariBerkas(keyword);
        const parsed = this.parseResponse(response);
        return parsed.data || [];
    }

    async hapusAntrean(): Promise<ApiResponse> {
        const controller = await this.getController();
        const response = controller.hapusAntrean();
        return this.parseResponse(response);
    }

    async resetRiwayat(): Promise<ApiResponse> {
        const controller = await this.getController();
        const response = controller.resetRiwayat();
        return this.parseResponse(response);
    }

    async getStats() {
        const controller = await this.getController();
        return {
            antrean: controller.getAntreanCount(),
            riwayat: controller.getRiwayatCount(),
            diterima: controller.getDiterimaCount(),
            ditolak: controller.getDitolakCount()
        };
    }
}

export const wasmApi = new WasmApi();
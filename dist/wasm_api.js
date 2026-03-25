import { WasmLoader } from './wasm_loader.js';
class WasmApi {
    constructor() {
        this.controller = null;
    }
    async getController() {
        if (!this.controller) {
            this.controller = await WasmLoader.load();
        }
        return this.controller;
    }
    parseResponse(jsonStr) {
        try {
            return JSON.parse(jsonStr);
        }
        catch {
            return { success: false, message: 'Invalid response' };
        }
    }
    async tambahBerkas(nama, nim, perusahaan) {
        const controller = await this.getController();
        const response = controller.tambahBerkas(nama, nim, perusahaan);
        return this.parseResponse(response);
    }
    async getAntrean() {
        const controller = await this.getController();
        const response = controller.tampilkanAntrean();
        const parsed = this.parseResponse(response);
        return parsed.data || [];
    }
    async prosesVerifikasi(status) {
        const controller = await this.getController();
        const response = controller.prosesVerifikasi(status);
        return this.parseResponse(response);
    }
    async getRiwayat() {
        const controller = await this.getController();
        const response = controller.tampilkanRiwayat();
        const parsed = this.parseResponse(response);
        return parsed.data || [];
    }
    async getTerakhir() {
        const controller = await this.getController();
        const response = controller.tampilkanTerakhir();
        const parsed = this.parseResponse(response);
        return parsed.success ? parsed.data : null;
    }
    async cariBerkas(keyword) {
        const controller = await this.getController();
        const response = controller.cariBerkas(keyword);
        const parsed = this.parseResponse(response);
        return parsed.data || [];
    }
    async hapusAntrean() {
        const controller = await this.getController();
        const response = controller.hapusAntrean();
        return this.parseResponse(response);
    }
    async resetRiwayat() {
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

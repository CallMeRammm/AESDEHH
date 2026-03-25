export class WasmLoader {
    static async load() {
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
            this.callbacks.forEach(cb => cb(this.instance));
            this.callbacks = [];
            return this.instance;
        }
        catch (error) {
            console.error('Failed to load WASM module:', error);
            throw error;
        }
        finally {
            this.isLoading = false;
        }
    }
    static getInstance() {
        return this.instance;
    }
}
WasmLoader.instance = null;
WasmLoader.isLoading = false;
WasmLoader.callbacks = [];

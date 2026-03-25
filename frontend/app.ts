import { wasmApi } from './wasm_api.js';
import { BerkasMagang } from './types.js';
import { Navbar } from './components/Navbar.js';
import { BerkasCard } from './components/BerkasCard.js';
import { BerkasTable } from './components/BerkasTable.js';
import { AddBerkasModal, ConfirmModal, InfoModal } from './components/Modal.js';

// State
let currentPage: string = 'dashboard';
let navbar: Navbar;

// Toast notification
function showToast(message: string, type: 'success' | 'error' = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Render functions using components
async function renderDashboard() {
    const stats = await wasmApi.getStats();
    const antrean = await wasmApi.getAntrean();
    const riwayat = await wasmApi.getRiwayat();
    const terakhir = await wasmApi.getTerakhir();
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h1 style="color: white; font-size: 1.875rem; font-weight: bold;">Dashboard</h1>
                <button class="btn btn-primary" id="openModalBtn">+ Tambah Berkas Baru</button>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.antrean}</div>
                    <div class="stat-label">Antrean Menunggu</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.riwayat}</div>
                    <div class="stat-label">Total Terverifikasi</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.diterima}</div>
                    <div class="stat-label">Diterima</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.ditolak}</div>
                    <div class="stat-label">Ditolak</div>
                </div>
            </div>
            
            <div id="antreanContainer" class="card"></div>
            <div id="riwayatContainer" class="card" style="margin-top: 1rem;"></div>
            <div id="terakhirContainer" class="card" style="margin-top: 1rem;"></div>
        </div>
    `;
}

async function renderAntrean() {
    const antrean = await wasmApi.getAntrean();
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h1 style="color: white; font-size: 1.875rem; font-weight: bold;">Antrean Verifikasi</h1>
                <button class="btn btn-danger" id="clearAntreanBtn">Hapus Semua</button>
            </div>
            <div id="antreanListContainer" class="card"></div>
        </div>
    `;
}

async function renderVerifikasi() {
    const antrean = await wasmApi.getAntrean();
    const currentBerkas = antrean.length > 0 ? antrean[0] : null;
    
    if (!currentBerkas) {
        return `
            <div class="card" style="text-align: center; padding: 3rem;">
                <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Verifikasi</h1>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">Tidak ada berkas dalam antrean</p>
                <button class="btn btn-primary" id="goToDashboardBtn">Tambah Berkas Baru</button>
            </div>
        `;
    }
    
    return `
        <div>
            <h1 style="color: white; font-size: 1.875rem; font-weight: bold; margin-bottom: 1.5rem; text-align: center;">Verifikasi Berkas</h1>
            <div id="currentBerkasCard" class="card"></div>
            <div class="card" style="margin-top: 1rem;">
                <p>Sisa antrean: <strong>${antrean.length}</strong> berkas</p>
            </div>
        </div>
    `;
}

async function renderRiwayat() {
    const riwayat = await wasmApi.getRiwayat();
    const stats = await wasmApi.getStats();
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h1 style="color: white; font-size: 1.875rem; font-weight: bold;">Riwayat Verifikasi</h1>
                <button class="btn btn-outline" id="resetRiwayatBtn" style="background: white;">Reset Riwayat</button>
            </div>
            <div class="stats-grid" style="margin-bottom: 1.5rem;">
                <div class="stat-card">
                    <div class="stat-value">${riwayat.length}</div>
                    <div class="stat-label">Total Diproses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.diterima}</div>
                    <div class="stat-label">Diterima</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.ditolak}</div>
                    <div class="stat-label">Ditolak</div>
                </div>
            </div>
            <div id="riwayatTableContainer"></div>
        </div>
    `;
}

// Load page
async function loadPage(page: string) {
    currentPage = page;
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    
    navbar.updateCurrentPage(page);
    
    let html = '';
    switch (page) {
        case 'dashboard': html = await renderDashboard(); break;
        case 'antrean': html = await renderAntrean(); break;
        case 'verifikasi': html = await renderVerifikasi(); break;
        case 'riwayat': html = await renderRiwayat(); break;
        default: html = await renderDashboard();
    }
    
    contentDiv.innerHTML = html;
    await attachComponentListeners(page);
}

// Attach component listeners after rendering
async function attachComponentListeners(page: string) {
    // Dashboard components
    if (page === 'dashboard') {
        const antrean = await wasmApi.getAntrean();
        const riwayat = await wasmApi.getRiwayat();
        const terakhir = await wasmApi.getTerakhir();
        
        // Render antrean list
        const antreanContainer = document.getElementById('antreanContainer');
        if (antreanContainer && antrean.length > 0) {
            antreanContainer.innerHTML = `
                <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Antrean Terbaru</h2>
                <div id="antreanCards"></div>
            `;
            const cardsContainer = antreanContainer.querySelector('#antreanCards');
            if (cardsContainer) {
                cardsContainer.innerHTML = antrean.slice(0, 3).map(b => `
                    <div id="card-${b.nim}"></div>
                `).join('');
                
                antrean.slice(0, 3).forEach((b, i) => {
                    new BerkasCard(`card-${b.nim}`, { berkas: b });
                });
            }
        } else if (antreanContainer) {
            antreanContainer.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 2rem;">Tidak ada antrean</p>';
        }
        
        // Render riwayat table
        const riwayatContainer = document.getElementById('riwayatContainer');
        if (riwayatContainer) {
            new BerkasTable('riwayatContainer', { 
                data: riwayat.slice(0, 5),
                title: 'Riwayat Terbaru'
            });
        }
        
        // Render terakhir card
        const terakhirContainer = document.getElementById('terakhirContainer');
        if (terakhirContainer && terakhir) {
            terakhirContainer.innerHTML = `
                <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Terakhir Diproses</h2>
                <div id="terakhirCard"></div>
            `;
            new BerkasCard('terakhirCard', { berkas: terakhir });
        } else if (terakhirContainer) {
            terakhirContainer.remove();
        }
        
        // Add modal button
        const openModalBtn = document.getElementById('openModalBtn');
        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => {
                new AddBerkasModal({
                    onSubmit: async (data) => {
                        const result = await wasmApi.tambahBerkas(data.nama, data.nim, data.perusahaan);
                        if (result.success) {
                            showToast('Berkas berhasil ditambahkan');
                            await loadPage(currentPage);
                        } else {
                            showToast(result.message || 'Gagal menambah berkas', 'error');
                        }
                    }
                }).show();
            });
        }
    }
    
    // Antrean page
    if (page === 'antrean') {
        const antrean = await wasmApi.getAntrean();
        const container = document.getElementById('antreanListContainer');
        if (container) {
            if (antrean.length === 0) {
                container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 2rem;">Tidak ada antrean</p>';
            } else {
                container.innerHTML = '<div id="antreanCardsList"></div>';
                const cardsContainer = container.querySelector('#antreanCardsList');
                if (cardsContainer) {
                    cardsContainer.innerHTML = antrean.map(b => `<div id="card-${b.nim}"></div>`).join('');
                    antrean.forEach(b => {
                        new BerkasCard(`card-${b.nim}`, { berkas: b });
                    });
                }
            }
        }
        
        const clearBtn = document.getElementById('clearAntreanBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                new ConfirmModal('Hapus semua antrean?', async () => {
                    const result = await wasmApi.hapusAntrean();
                    if (result.success) {
                        showToast('Semua antrean dihapus');
                        await loadPage(currentPage);
                    }
                }).show();
            });
        }
    }
    
    // Verifikasi page
    if (page === 'verifikasi') {
        const antrean = await wasmApi.getAntrean();
        const currentBerkas = antrean.length > 0 ? antrean[0] : null;
        
        if (currentBerkas) {
            const cardContainer = document.getElementById('currentBerkasCard');
            if (cardContainer) {
                cardContainer.innerHTML = '<div id="verifikasiCard"></div>';
                new BerkasCard('verifikasiCard', {
                    berkas: currentBerkas,
                    showActions: true,
                    onVerifikasi: async (status) => {
                        const result = await wasmApi.prosesVerifikasi(status);
                        if (result.success) {
                            showToast(`Berkas ${status === 'DITERIMA' ? 'diterima' : 'ditolak'}`);
                            await loadPage('verifikasi');
                        } else {
                            showToast(result.message || 'Gagal verifikasi', 'error');
                        }
                    }
                });
            }
        }
        
        const goToDashboardBtn = document.getElementById('goToDashboardBtn');
        if (goToDashboardBtn) {
            goToDashboardBtn.addEventListener('click', () => loadPage('dashboard'));
        }
    }
    
    // Riwayat page
    if (page === 'riwayat') {
        const riwayat = await wasmApi.getRiwayat();
        const container = document.getElementById('riwayatTableContainer');
        if (container) {
            new BerkasTable('riwayatTableContainer', { data: riwayat, title: 'Semua Riwayat Verifikasi' });
        }
        
        const resetBtn = document.getElementById('resetRiwayatBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                new ConfirmModal('Reset semua riwayat?', async () => {
                    const result = await wasmApi.resetRiwayat();
                    if (result.success) {
                        showToast('Riwayat direset');
                        await loadPage(currentPage);
                    }
                }).show();
            });
        }
    }
}

// Initialize app
async function init() {
    try {
        // Initialize navbar
        navbar = new Navbar('navbar-container', {
            currentPage: 'dashboard',
            onNavigate: (page) => loadPage(page)
        });
        
        // Test WASM connection
        await wasmApi.getStats();
        showToast('✅ Aplikasi siap!', 'success');
        await loadPage('dashboard');
    } catch (error) {
        console.error('Failed to initialize:', error);
        const contentDiv = document.getElementById('app-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <h2 style="color: #dc2626; margin-bottom: 1rem;">❌ Gagal Memuat Aplikasi</h2>
                    <p>Pastikan file verifikasi_magang.js dan verifikasi_magang.wasm berada di folder yang sama.</p>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">Error: ${error}</p>
                </div>
            `;
        }
    }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
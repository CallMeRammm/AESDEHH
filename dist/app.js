// ==========================================
// APP.JS - SISTEM VERIFIKASI MAGANG
// VERSI TANPA IMPORT/EXPORT
// ==========================================

// State
let currentPage = 'dashboard';
let controller = null;

// ==========================================
// Utility Functions
// ==========================================

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getBadgeClass(status) {
    switch (status) {
        case 'MENUNGGU': return 'badge-menunggu';
        case 'DITERIMA': return 'badge-diterima';
        case 'DITOLAK': return 'badge-ditolak';
        default: return '';
    }
}

// ==========================================
// Render Functions
// ==========================================

function renderBerkasCard(berkas) {
    const badgeClass = getBadgeClass(berkas.status);
    return `
        <div style="background: #f9fafb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h3 style="font-weight: 600; margin: 0 0 0.25rem 0;">${escapeHtml(berkas.nama)}</h3>
                    <p style="color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0;">NIM: ${escapeHtml(berkas.nim)}</p>
                    <p style="color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0;">Perusahaan: ${escapeHtml(berkas.perusahaan)}</p>
                </div>
                <span class="badge ${badgeClass}">${berkas.status}</span>
            </div>
        </div>
    `;
}

function renderBerkasTable(berkasList) {
    if (!berkasList || berkasList.length === 0) {
        return '<p style="color: #9ca3af; text-align: center; padding: 2rem;">Tidak ada data</p>';
    }
    
    return `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f7fafc;">
                        <th style="padding: 0.75rem 1rem; text-align: left;">Nama</th>
                        <th style="padding: 0.75rem 1rem; text-align: left;">NIM</th>
                        <th style="padding: 0.75rem 1rem; text-align: left;">Perusahaan</th>
                        <th style="padding: 0.75rem 1rem; text-align: left;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${berkasList.map(b => `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 0.75rem 1rem;">${escapeHtml(b.nama)}</td>
                            <td style="padding: 0.75rem 1rem;">${escapeHtml(b.nim)}</td>
                            <td style="padding: 0.75rem 1rem;">${escapeHtml(b.perusahaan)}</td>
                            <td style="padding: 0.75rem 1rem;"><span class="badge ${getBadgeClass(b.status)}">${b.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ==========================================
// Page Renderers
// ==========================================

async function renderDashboard() {
    if (!controller) return '<div class="card">Loading...</div>';
    
    try {
        const stats = {
            antrean: controller.getAntreanCount(),
            riwayat: controller.getRiwayatCount(),
            diterima: controller.getDiterimaCount(),
            ditolak: controller.getDitolakCount()
        };
        
        const antreanStr = controller.tampilkanAntrean();
        const antreanData = JSON.parse(antreanStr);
        
        const riwayatStr = controller.tampilkanRiwayat();
        const riwayatData = JSON.parse(riwayatStr);
        
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
                
                <div class="card">
                    <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Antrean Terbaru</h2>
                    ${antreanData.data && antreanData.data.length > 0 ? 
                        antreanData.data.slice(0, 3).map(b => renderBerkasCard(b)).join('') : 
                        '<p style="color: #9ca3af; text-align: center; padding: 2rem;">Tidak ada antrean</p>'
                    }
                </div>
                
                <div class="card" style="margin-top: 1rem;">
                    <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Riwayat Terbaru</h2>
                    ${renderBerkasTable(riwayatData.data ? riwayatData.data.slice(0, 5) : [])}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Render dashboard error:', error);
        return `<div class="card"><p style="color: red;">Error: ${error.message}</p></div>`;
    }
}

async function renderAntrean() {
    if (!controller) return '<div class="card">Loading...</div>';
    
    try {
        const antreanStr = controller.tampilkanAntrean();
        const antreanData = JSON.parse(antreanStr);
        const antrean = antreanData.data || [];
        
        return `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h1 style="color: white; font-size: 1.875rem; font-weight: bold;">Antrean Verifikasi</h1>
                    <button class="btn btn-danger" id="clearAntreanBtn">Hapus Semua</button>
                </div>
                <div class="card">
                    ${antrean.length === 0 ? 
                        '<p style="color: #9ca3af; text-align: center; padding: 2rem;">Tidak ada antrean</p>' : 
                        antrean.map(b => renderBerkasCard(b)).join('')
                    }
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="card"><p style="color: red;">Error: ${error.message}</p></div>`;
    }
}

async function renderVerifikasi() {
    if (!controller) return '<div class="card">Loading...</div>';
    
    try {
        const antreanStr = controller.tampilkanAntrean();
        const antreanData = JSON.parse(antreanStr);
        const antrean = antreanData.data || [];
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
                <div class="card">
                    ${renderBerkasCard(currentBerkas)}
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button class="btn btn-success" id="terimaBtn" style="flex: 1;">✓ Terima</button>
                        <button class="btn btn-danger" id="tolakBtn" style="flex: 1;">✗ Tolak</button>
                    </div>
                </div>
                <div class="card" style="margin-top: 1rem;">
                    <p>Sisa antrean: <strong>${antrean.length}</strong> berkas</p>
                </div>
            </div>
        `;
    } catch (error) {
        return `<div class="card"><p style="color: red;">Error: ${error.message}</p></div>`;
    }
}

async function renderRiwayat() {
    if (!controller) return '<div class="card">Loading...</div>';
    
    try {
        const riwayatStr = controller.tampilkanRiwayat();
        const riwayatData = JSON.parse(riwayatStr);
        const riwayat = riwayatData.data || [];
        
        const stats = {
            diterima: controller.getDiterimaCount(),
            ditolak: controller.getDitolakCount()
        };
        
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
                ${renderBerkasTable(riwayat)}
            </div>
        `;
    } catch (error) {
        return `<div class="card"><p style="color: red;">Error: ${error.message}</p></div>`;
    }
}

// ==========================================
// Page Loader
// ==========================================

async function loadPage(page) {
    currentPage = page;
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    
    let html = '';
    
    switch (page) {
        case 'dashboard':
            html = await renderDashboard();
            break;
        case 'antrean':
            html = await renderAntrean();
            break;
        case 'verifikasi':
            html = await renderVerifikasi();
            break;
        case 'riwayat':
            html = await renderRiwayat();
            break;
        default:
            html = await renderDashboard();
    }
    
    contentDiv.innerHTML = html;
    
    // Attach event listeners
    attachEventListeners(page);
}

function attachEventListeners(page) {
    // Open modal button
    const openModalBtn = document.getElementById('openModalBtn');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', showAddModal);
    }
    
    // Clear antrean button
    const clearAntreanBtn = document.getElementById('clearAntreanBtn');
    if (clearAntreanBtn) {
        clearAntreanBtn.addEventListener('click', async () => {
            if (confirm('Hapus semua antrean?')) {
                const result = controller.hapusAntrean();
                const parsed = JSON.parse(result);
                if (parsed.success) {
                    showToast('Semua antrean dihapus');
                    await loadPage(currentPage);
                }
            }
        });
    }
    
    // Reset riwayat button
    const resetRiwayatBtn = document.getElementById('resetRiwayatBtn');
    if (resetRiwayatBtn) {
        resetRiwayatBtn.addEventListener('click', async () => {
            if (confirm('Reset semua riwayat?')) {
                const result = controller.resetRiwayat();
                const parsed = JSON.parse(result);
                if (parsed.success) {
                    showToast('Riwayat direset');
                    await loadPage(currentPage);
                }
            }
        });
    }
    
    // Verifikasi buttons
    const terimaBtn = document.getElementById('terimaBtn');
    const tolakBtn = document.getElementById('tolakBtn');
    
    if (terimaBtn) {
        terimaBtn.addEventListener('click', async () => {
            const result = controller.prosesVerifikasi('DITERIMA');
            const parsed = JSON.parse(result);
            if (parsed.success) {
                showToast(`Berkas ${parsed.data?.nama} diterima`);
                await loadPage('verifikasi');
            } else {
                showToast(parsed.message || 'Gagal verifikasi', 'error');
            }
        });
    }
    
    if (tolakBtn) {
        tolakBtn.addEventListener('click', async () => {
            const result = controller.prosesVerifikasi('DITOLAK');
            const parsed = JSON.parse(result);
            if (parsed.success) {
                showToast(`Berkas ${parsed.data?.nama} ditolak`);
                await loadPage('verifikasi');
            } else {
                showToast(parsed.message || 'Gagal verifikasi', 'error');
            }
        });
    }
    
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    if (goToDashboardBtn) {
        goToDashboardBtn.addEventListener('click', () => loadPage('dashboard'));
    }
}

// ==========================================
// Modal Functions
// ==========================================

function showAddModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 style="font-size: 1.25rem; font-weight: bold;">Tambah Berkas Baru</h2>
                <button class="btn btn-outline" id="closeModalBtn" style="padding: 0.25rem 0.75rem;">✕</button>
            </div>
            <div class="modal-body">
                <form id="tambahBerkasForm">
                    <div class="form-group">
                        <label class="form-label">Nama Mahasiswa</label>
                        <input type="text" id="nama" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">NIM</label>
                        <input type="text" id="nim" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Perusahaan Tujuan</label>
                        <input type="text" id="perusahaan" class="form-input" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="cancelModalBtn">Batal</button>
                <button class="btn btn-primary" id="submitModalBtn">Simpan</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('submitModalBtn')?.addEventListener('click', async () => {
        const nama = document.getElementById('nama').value;
        const nim = document.getElementById('nim').value;
        const perusahaan = document.getElementById('perusahaan').value;
        
        if (!nama || !nim || !perusahaan) {
            showToast('Semua field harus diisi', 'error');
            return;
        }
        
        const result = controller.tambahBerkas(nama, nim, perusahaan);
        const parsed = JSON.parse(result);
        
        if (parsed.success) {
            showToast('Berkas berhasil ditambahkan');
            closeModal();
            await loadPage(currentPage);
        } else {
            showToast(parsed.message || 'Gagal menambah berkas', 'error');
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ==========================================
// Navigation
// ==========================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) loadPage(page);
        });
    });
}

// ==========================================
// Initialize App
// ==========================================

async function init() {
    console.log('Initializing app...');
    
    // Check if createVerifikasiModule exists
    if (typeof createVerifikasiModule === 'undefined') {
        console.error('createVerifikasiModule not found!');
        document.getElementById('app-content').innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <h2 style="color: #dc2626;">❌ Error</h2>
                <p>File verifikasi_magang.js tidak ditemukan atau tidak terload.</p>
                <p style="font-size: 0.875rem; margin-top: 1rem;">Pastikan file verifikasi_magang.js dan verifikasi_magang.wasm ada di folder yang sama.</p>
            </div>
        `;
        return;
    }
    
    try {
        // Load WASM module
        const module = await createVerifikasiModule();
        controller = new module.VerifikasiController();
        console.log('✅ WASM loaded successfully');
        
        // Test connection
        const test = controller.getAntreanCount();
        console.log('✅ Backend connected, antrean count:', test);
        
        // Setup navigation
        setupNavigation();
        
        // Load dashboard
        await loadPage('dashboard');
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        document.getElementById('app-content').innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <h2 style="color: #dc2626;">❌ Error: ${error.message}</h2>
                <p style="margin-top: 1rem;">Pastikan file verifikasi_magang.wasm ada di folder yang sama.</p>
                <p style="font-size: 0.875rem; color: #6b7280;">Details: ${error.stack || error}</p>
            </div>
        `;
    }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
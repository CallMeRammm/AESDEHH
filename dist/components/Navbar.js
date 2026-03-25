/**
 * Navbar Component
 * Menampilkan navigasi menu aplikasi
 */
export class Navbar {
    constructor(containerId, props) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        this.container = element;
        this.currentPage = props.currentPage;
        this.onNavigate = props.onNavigate;
        this.render();
    }
    render() {
        this.container.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="#" class="navbar-brand" data-page="dashboard">
                        📋 Verifikasi Magang
                    </a>
                    <div class="navbar-menu">
                        <a href="#" class="navbar-link ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                            Dashboard
                        </a>
                        <a href="#" class="navbar-link ${this.currentPage === 'antrean' ? 'active' : ''}" data-page="antrean">
                            Antrean
                        </a>
                        <a href="#" class="navbar-link ${this.currentPage === 'verifikasi' ? 'active' : ''}" data-page="verifikasi">
                            Verifikasi
                        </a>
                        <a href="#" class="navbar-link ${this.currentPage === 'riwayat' ? 'active' : ''}" data-page="riwayat">
                            Riwayat
                        </a>
                    </div>
                </div>
            </nav>
        `;
        // Attach event listeners
        this.container.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.onNavigate(page);
                }
            });
        });
    }
    updateCurrentPage(page) {
        this.currentPage = page;
        this.render();
    }
}

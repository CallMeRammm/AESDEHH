/**
 * BerkasCard Component
 * Menampilkan satu berkas dalam bentuk card
 */
export class BerkasCard {
    constructor(containerId, props) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        this.container = element;
        this.props = props;
        this.render();
    }
    getBadgeClass(status) {
        switch (status) {
            case 'MENUNGGU': return 'badge-menunggu';
            case 'DITERIMA': return 'badge-diterima';
            case 'DITOLAK': return 'badge-ditolak';
            default: return '';
        }
    }
    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    render() {
        const { berkas, showActions = false } = this.props;
        const badgeClass = this.getBadgeClass(berkas.status);
        this.container.innerHTML = `
            <div class="berkas-card">
                <div class="berkas-card-header">
                    <div>
                        <h3 class="berkas-card-title">${this.escapeHtml(berkas.nama)}</h3>
                        <p class="berkas-card-subtitle">NIM: ${this.escapeHtml(berkas.nim)}</p>
                    </div>
                    <span class="badge ${badgeClass}">${berkas.status}</span>
                </div>
                
                <div class="berkas-card-body">
                    <p>
                        <span class="berkas-card-label">Perusahaan:</span>
                        ${this.escapeHtml(berkas.perusahaan)}
                    </p>
                </div>
                
                ${showActions && berkas.status === 'MENUNGGU' ? `
                    <div class="berkas-card-actions">
                        <button class="btn btn-success btn-sm" id="terimaBtn-${Date.now()}">
                            ✓ Terima
                        </button>
                        <button class="btn btn-danger btn-sm" id="tolakBtn-${Date.now()}">
                            ✗ Tolak
                        </button>
                    </div>
                ` : ''}
                
                ${this.props.onDelete ? `
                    <div class="berkas-card-delete">
                        <button class="btn btn-outline btn-sm" id="deleteBtn-${Date.now()}">
                            Hapus
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        // Attach event listeners for actions
        if (showActions && berkas.status === 'MENUNGGU' && this.props.onVerifikasi) {
            const terimaBtn = this.container.querySelector('[id^="terimaBtn"]');
            const tolakBtn = this.container.querySelector('[id^="tolakBtn"]');
            if (terimaBtn) {
                terimaBtn.addEventListener('click', () => {
                    this.props.onVerifikasi('DITERIMA');
                });
            }
            if (tolakBtn) {
                tolakBtn.addEventListener('click', () => {
                    this.props.onVerifikasi('DITOLAK');
                });
            }
        }
        if (this.props.onDelete) {
            const deleteBtn = this.container.querySelector('[id^="deleteBtn"]');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.props.onDelete();
                });
            }
        }
    }
    updateProps(props) {
        this.props = { ...this.props, ...props };
        this.render();
    }
}
// CSS untuk card (tambahkan ke styles.css)
export const cardStyles = `
.berkas-card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.berkas-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.berkas-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.berkas-card-title {
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0 0.25rem 0;
    color: #2d3748;
}

.berkas-card-subtitle {
    font-size: 0.875rem;
    color: #718096;
    margin: 0;
}

.berkas-card-body {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: #4a5568;
}

.berkas-card-label {
    font-weight: 500;
    color: #2d3748;
}

.berkas-card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e2e8f0;
}

.berkas-card-delete {
    margin-top: 0.5rem;
    text-align: right;
}

.btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
}
`;

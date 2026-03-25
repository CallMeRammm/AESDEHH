/**
 * BerkasTable Component
 * Menampilkan daftar berkas dalam bentuk tabel
 */

import { BerkasMagang } from '../types.js';

export interface BerkasTableProps {
    data: BerkasMagang[];
    title?: string;
    showActions?: boolean;
    onVerifikasi?: (status: 'DITERIMA' | 'DITOLAK', nim: string) => void;
}

export class BerkasTable {
    private container: HTMLElement;
    private props: BerkasTableProps;

    constructor(containerId: string, props: BerkasTableProps) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        this.container = element;
        this.props = props;
        this.render();
    }

    private getBadgeClass(status: string): string {
        switch (status) {
            case 'MENUNGGU': return 'badge-menunggu';
            case 'DITERIMA': return 'badge-diterima';
            case 'DITOLAK': return 'badge-ditolak';
            default: return '';
        }
    }

    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private render(): void {
        const { data, title, showActions = false } = this.props;

        if (data.length === 0) {
            this.container.innerHTML = `
                <div class="card">
                    ${title ? `<h2 class="table-title">${this.escapeHtml(title)}</h2>` : ''}
                    <p class="empty-data">Tidak ada data</p>
                </div>
            `;
            return;
        }

        this.container.innerHTML = `
            <div class="card">
                ${title ? `<h2 class="table-title">${this.escapeHtml(title)}</h2>` : ''}
                <div class="table-container">
                    <table class="berkas-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>NIM</th>
                                <th>Perusahaan</th>
                                <th>Status</th>
                                ${showActions ? '<th>Aksi</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((item, index) => `
                                <tr data-nim="${this.escapeHtml(item.nim)}">
                                    <td>${index + 1}</td>
                                    <td>${this.escapeHtml(item.nama)}</td>
                                    <td>${this.escapeHtml(item.nim)}</td>
                                    <td>${this.escapeHtml(item.perusahaan)}</td>
                                    <td>
                                        <span class="badge ${this.getBadgeClass(item.status)}">
                                            ${item.status}
                                        </span>
                                    </td>
                                    ${showActions && item.status === 'MENUNGGU' ? `
                                        <td class="table-actions">
                                            <button class="btn btn-success btn-sm terima-btn" data-nim="${this.escapeHtml(item.nim)}">
                                                ✓ Terima
                                            </button>
                                            <button class="btn btn-danger btn-sm tolak-btn" data-nim="${this.escapeHtml(item.nim)}">
                                                ✗ Tolak
                                            </button>
                                        </td>
                                    ` : showActions ? `
                                        <td class="table-actions">
                                            <span class="badge ${this.getBadgeClass(item.status)}">
                                                ${item.status}
                                            </span>
                                        </td>
                                    ` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="table-footer">
                    <span>Total: ${data.length} data</span>
                </div>
            </div>
        `;

        // Attach event listeners for actions
        if (showActions && this.props.onVerifikasi) {
            this.container.querySelectorAll('.terima-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const nim = btn.getAttribute('data-nim');
                    if (nim) {
                        this.props.onVerifikasi!('DITERIMA', nim);
                    }
                });
            });

            this.container.querySelectorAll('.tolak-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const nim = btn.getAttribute('data-nim');
                    if (nim) {
                        this.props.onVerifikasi!('DITOLAK', nim);
                    }
                });
            });
        }
    }

    public updateData(data: BerkasMagang[]): void {
        this.props.data = data;
        this.render();
    }

    public updateProps(props: Partial<BerkasTableProps>): void {
        this.props = { ...this.props, ...props };
        this.render();
    }
}

// CSS untuk table (tambahkan ke styles.css)
export const tableStyles = `
.table-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #2d3748;
}

.berkas-table {
    width: 100%;
    border-collapse: collapse;
}

.berkas-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    background: #f7fafc;
    font-weight: 600;
    color: #4a5568;
    border-bottom: 2px solid #e2e8f0;
}

.berkas-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.berkas-table tr:hover {
    background: #f7fafc;
}

.table-actions {
    display: flex;
    gap: 0.5rem;
}

.table-footer {
    margin-top: 1rem;
    padding-top: 0.75rem;
    text-align: right;
    font-size: 0.875rem;
    color: #718096;
    border-top: 1px solid #e2e8f0;
}

.empty-data {
    text-align: center;
    padding: 2rem;
    color: #9ca3af;
}
`;
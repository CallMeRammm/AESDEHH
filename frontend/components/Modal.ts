/**
 * Modal Component
 * Modal dialog untuk form input dan konfirmasi
 */

export interface ModalProps {
    title: string;
    content: string | HTMLElement;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showConfirm?: boolean;
    showCancel?: boolean;
}

export class Modal {
    private modalElement: HTMLElement | null = null;
    private props: ModalProps;

    constructor(props: ModalProps) {
        this.props = {
            confirmText: 'Simpan',
            cancelText: 'Batal',
            showConfirm: true,
            showCancel: true,
            ...props
        };
    }

    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private createModal(): HTMLElement {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const contentHtml = typeof this.props.content === 'string' 
            ? this.escapeHtml(this.props.content) 
            : '';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${this.escapeHtml(this.props.title)}</h2>
                    <button class="modal-close-btn" id="modalCloseBtn">✕</button>
                </div>
                <div class="modal-body">
                    ${typeof this.props.content === 'string' ? contentHtml : ''}
                </div>
                <div class="modal-footer">
                    ${this.props.showCancel ? `
                        <button class="btn btn-outline" id="modalCancelBtn">
                            ${this.escapeHtml(this.props.cancelText!)}
                        </button>
                    ` : ''}
                    ${this.props.showConfirm ? `
                        <button class="btn btn-primary" id="modalConfirmBtn">
                            ${this.escapeHtml(this.props.confirmText!)}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Jika content berupa HTMLElement, append ke modal-body
        if (typeof this.props.content !== 'string' && this.props.content instanceof HTMLElement) {
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = '';
                modalBody.appendChild(this.props.content);
            }
        }

        return modal;
    }

    private attachEvents(modal: HTMLElement): void {
        const closeBtn = modal.querySelector('#modalCloseBtn');
        const cancelBtn = modal.querySelector('#modalCancelBtn');
        const confirmBtn = modal.querySelector('#modalConfirmBtn');

        const closeModal = () => {
            modal.remove();
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn && this.props.onCancel) {
            cancelBtn.addEventListener('click', () => {
                this.props.onCancel!();
                closeModal();
            });
        } else if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (confirmBtn && this.props.onConfirm) {
            confirmBtn.addEventListener('click', () => {
                this.props.onConfirm!();
                closeModal();
            });
        }

        // Close when clicking overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    public show(): void {
        // Remove existing modal if any
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        this.modalElement = this.createModal();
        this.attachEvents(this.modalElement);
        document.body.appendChild(this.modalElement);
    }

    public close(): void {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
    }
}

// Modal untuk form tambah berkas
export interface AddBerkasModalProps {
    onSubmit: (data: { nama: string; nim: string; perusahaan: string }) => void;
    onCancel?: () => void;
}

export class AddBerkasModal extends Modal {
    constructor(props: AddBerkasModalProps) {
        // Create form element
        const form = document.createElement('form');
        form.id = 'tambahBerkasForm';
        form.innerHTML = `
            <div class="form-group">
                <label class="form-label">Nama Mahasiswa</label>
                <input type="text" id="nama" class="form-input" placeholder="Masukkan nama lengkap" required>
            </div>
            <div class="form-group">
                <label class="form-label">NIM</label>
                <input type="text" id="nim" class="form-input" placeholder="Masukkan NIM" required>
            </div>
            <div class="form-group">
                <label class="form-label">Perusahaan Tujuan</label>
                <input type="text" id="perusahaan" class="form-input" placeholder="Masukkan nama perusahaan" required>
            </div>
        `;

        super({
            title: 'Tambah Berkas Baru',
            content: form,
            confirmText: 'Simpan',
            cancelText: 'Batal',
            onConfirm: () => {
                const nama = (form.querySelector('#nama') as HTMLInputElement)?.value;
                const nim = (form.querySelector('#nim') as HTMLInputElement)?.value;
                const perusahaan = (form.querySelector('#perusahaan') as HTMLInputElement)?.value;

                if (!nama || !nim || !perusahaan) {
                    this.showErrorToast('Semua field harus diisi');
                    return;
                }

                props.onSubmit({ nama, nim, perusahaan });
            },
            onCancel: props.onCancel
        });
    }

    private showErrorToast(message: string): void {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Modal untuk konfirmasi
export class ConfirmModal extends Modal {
    constructor(message: string, onConfirm: () => void, onCancel?: () => void) {
        super({
            title: 'Konfirmasi',
            content: `<p>${message}</p>`,
            confirmText: 'Ya',
            cancelText: 'Tidak',
            onConfirm,
            onCancel
        });
    }
}

// Modal untuk informasi
export class InfoModal extends Modal {
    constructor(title: string, message: string, onClose?: () => void) {
        super({
            title,
            content: `<p>${message}</p>`,
            confirmText: 'Tutup',
            showCancel: false,
            onConfirm: onClose
        });
    }
}

// CSS untuk modal (tambahkan ke styles.css)
export const modalStyles = `
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

.modal {
    background: white;
    border-radius: 0.5rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
}

.modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0;
}

.modal-close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #a0aec0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
}

.modal-close-btn:hover {
    background: #f7fafc;
    color: #4a5568;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
`;
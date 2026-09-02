/**
 * Modal Dialog Manager
 */
export class Modal {
    static activeModal = null;

    static init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    }

    static open({ title, content, footer = '', size = 'medium', onClose = null }) {
        this.close(); // Close any currently open modal

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = 'active-modal-backdrop';

        const modalBox = document.createElement('div');
        modalBox.className = `modal-box modal-${size}`;

        modalBox.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close-btn" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        `;

        backdrop.appendChild(modalBox);
        document.body.appendChild(backdrop);
        document.body.classList.add('modal-open');

        this.activeModal = { backdrop, modalBox, onClose };

        // Event bindings
        const closeBtn = modalBox.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.close();
            }
        });

        // Trigger animation
        requestAnimationFrame(() => {
            backdrop.classList.add('modal-backdrop-show');
            modalBox.classList.add('modal-box-show');
        });

        return modalBox;
    }

    static close() {
        if (!this.activeModal) return;

        const { backdrop, modalBox, onClose } = this.activeModal;
        backdrop.classList.remove('modal-backdrop-show');
        modalBox.classList.remove('modal-box-show');

        setTimeout(() => {
            if (backdrop.parentElement) {
                backdrop.parentElement.removeChild(backdrop);
            }
            document.body.classList.remove('modal-open');
            if (typeof onClose === 'function') {
                onClose();
            }
            this.activeModal = null;
        }, 250);
    }

    static confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-danger', onConfirm }) {
        const content = `<p class="modal-confirm-msg">${message}</p>`;
        const footer = `
            <button class="btn btn-secondary" id="modal-cancel-action">${cancelText}</button>
            <button class="btn ${confirmClass}" id="modal-confirm-action">${confirmText}</button>
        `;

        const modalBox = this.open({
            title: title || 'Confirmation',
            content,
            footer,
            size: 'small'
        });

        const cancelBtn = modalBox.querySelector('#modal-cancel-action');
        const confirmBtn = modalBox.querySelector('#modal-confirm-action');

        cancelBtn.addEventListener('click', () => this.close());
        confirmBtn.addEventListener('click', () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            this.close();
        });
    }
}

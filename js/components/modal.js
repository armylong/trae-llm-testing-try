class Modal {
    constructor() {
        this.modalOverlay = document.getElementById('modalOverlay');
        this.confirmOverlay = document.getElementById('confirmOverlay');
        this.taskForm = document.getElementById('taskForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.modalClose = document.getElementById('modalClose');
        this.confirmCancel = document.getElementById('confirmCancel');
        this.confirmDelete = document.getElementById('confirmDelete');
        
        this.currentTaskId = null;
        this.deleteCallback = null;
        
        this.init();
    }

    init() {
        this.cancelBtn.addEventListener('click', () => this.hide());
        this.modalClose.addEventListener('click', () => this.hide());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.hide();
        });
        
        this.confirmCancel.addEventListener('click', () => this.hideConfirm());
        this.confirmOverlay.addEventListener('click', (e) => {
            if (e.target === this.confirmOverlay) this.hideConfirm();
        });
    }

    showTaskModal(task = null) {
        this.currentTaskId = task ? task.id : null;
        this.modalTitle.textContent = task ? '编辑任务' : '新增任务';
        
        document.getElementById('taskTitle').value = task ? task.title : '';
        document.getElementById('taskDesc').value = task ? task.description : '';
        document.getElementById('taskDueDate').value = task ? task.dueDate : '';
        
        const dateInput = document.getElementById('taskDueDate');
        dateInput.min = getTodayDateStr();
        
        this.modalOverlay.classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    hide() {
        this.modalOverlay.classList.remove('active');
        this.taskForm.reset();
        this.currentTaskId = null;
    }

    showConfirm(callback) {
        this.deleteCallback = callback;
        this.confirmOverlay.classList.add('active');
    }

    hideConfirm() {
        this.confirmOverlay.classList.remove('active');
        this.deleteCallback = null;
    }

    confirmDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
        }
        this.hideConfirm();
    }

    getFormData() {
        return {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDesc').value.trim(),
            dueDate: document.getElementById('taskDueDate').value
        };
    }
}

const modal = new Modal();

document.addEventListener('DOMContentLoaded', () => {
    modal.confirmDelete = modal.confirmDelete.bind(modal);
    document.getElementById('confirmDelete').addEventListener('click', modal.confirmDelete);
});

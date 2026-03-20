class DragManager {
    constructor() {
        this.draggedElement = null;
        this.placeholder = null;
        this.dragOverData = {
            container: null,
            afterId: null
        };
    }

    init() {
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
    }

    handleDragStart(e) {
        if (!e.target.classList.contains('task-card')) return;
        
        this.draggedElement = e.target;
        
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    }

    handleDragEnd(e) {
        if (!e.target.classList.contains('task-card')) return;
        
        e.target.classList.remove('dragging');
        e.target.style.opacity = '1';
        
        this.removePlaceholder();
        this.draggedElement = null;
        this.dragOverData = { container: null, afterId: null };
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const container = e.target.closest('.card-list');
        if (!container) return;
        
        const afterElement = this.getDragAfterElement(container, e.clientY);
        
        this.dragOverData.container = container;
        this.dragOverData.afterId = afterElement ? afterElement.dataset.id : null;
        
        if (afterElement) {
            container.insertBefore(this.getPlaceholder(), afterElement);
        } else {
            container.appendChild(this.getPlaceholder());
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const taskId = e.dataTransfer.getData('text/plain');
        const container = this.dragOverData.container || e.target.closest('.card-list');
        
        if (!container || !taskId) return;
        
        const newStatus = container.dataset.status;
        
        this.removePlaceholder();
        
        let orderedIds = [];
        const cards = container.querySelectorAll('.task-card');
        
        cards.forEach(card => {
            if (!card.classList.contains('dragging')) {
                orderedIds.push(card.dataset.id);
            }
        });
        
        const afterId = this.dragOverData.afterId;
        
        if (afterId) {
            const afterIdx = orderedIds.indexOf(afterId);
            if (afterIdx > -1) {
                orderedIds.splice(afterIdx, 0, taskId);
            } else {
                orderedIds.unshift(taskId);
            }
        } else {
            if (!orderedIds.includes(taskId)) {
                orderedIds.push(taskId);
            }
        }
        
        if (orderedIds.length === 0) {
            orderedIds = [taskId];
        }
        
        if (typeof window.handleTaskDrop === 'function') {
            window.handleTaskDrop(taskId, newStatus, orderedIds);
        }
        
        this.dragOverData = { container: null, afterId: null };
    }

    getPlaceholder() {
        if (!this.placeholder) {
            this.placeholder = document.createElement('div');
            this.placeholder.className = 'drag-placeholder';
            this.placeholder.textContent = '拖放到这里';
        }
        return this.placeholder;
    }

    removePlaceholder() {
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

const dragManager = new DragManager();

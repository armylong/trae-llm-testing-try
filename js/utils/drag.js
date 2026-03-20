class DragManager {
    constructor() {
        this.draggedElement = null;
        this.placeholder = null;
        this.sourceContainer = null;
        this.currentContainer = null;
        this.dragItems = [];
    }

    init(containerSelector) {
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
    }

    handleDragStart(e) {
        if (!e.target.classList.contains('task-card')) return;
        
        this.draggedElement = e.target;
        this.sourceContainer = e.target.parentElement;
        
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        
        this.createPlaceholder(e.target);
        
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
        this.sourceContainer = null;
        this.currentContainer = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const container = e.target.closest('.card-list');
        if (!container) return;
        
        this.currentContainer = container;
        
        const afterElement = this.getDragAfterElement(container, e.clientY);
        
        if (this.placeholder && this.placeholder.parentNode === container) {
            if (afterElement) {
                container.insertBefore(this.placeholder, afterElement);
            } else {
                container.appendChild(this.placeholder);
            }
        }
    }

    handleDragLeave(e) {
        const container = e.target.closest('.card-list');
        if (container && !container.contains(e.relatedTarget)) {
            this.removePlaceholder();
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const taskId = e.dataTransfer.getData('text/plain');
        const container = e.target.closest('.card-list');
        
        if (!container || !taskId) return;
        
        const newStatus = container.dataset.status;
        
        this.removePlaceholder();
        
        const orderedIds = Array.from(container.querySelectorAll('.task-card:not(.dragging)'))
            .map(card => card.dataset.id);
        
        if (this.draggedElement) {
            orderedIds.splice(orderedIds.indexOf(taskId), 1);
            orderedIds.unshift(taskId);
        }
        
        if (typeof window.handleTaskDrop === 'function') {
            window.handleTaskDrop(taskId, newStatus, orderedIds);
        }
    }

    createPlaceholder(element) {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drag-placeholder';
        this.placeholder.style.height = element.offsetHeight + 'px';
        element.parentElement.insertBefore(this.placeholder, element);
    }

    removePlaceholder() {
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
        this.placeholder = null;
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

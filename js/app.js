class TodoApp {
    constructor() {
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDragHandler();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            modal.showTaskModal();
        });

        modal.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportTasks();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importTasks(e.target.files[0]);
            e.target.value = '';
        });
    }

    setupDragHandler() {
        dragManager.init();
        
        window.handleTaskDrop = (taskId, newStatus, orderedIds) => {
            taskStorage.moveTask(taskId, newStatus);
            taskStorage.reorderTasks(newStatus, orderedIds);
            this.render();
            this.updateStats();
        };
    }

    handleFormSubmit() {
        const data = modal.getFormData();
        
        if (!data.title || !data.dueDate) {
            alert('请填写必填项');
            return;
        }

        if (modal.currentTaskId) {
            taskStorage.updateTask(modal.currentTaskId, data);
        } else {
            taskStorage.addTask({ ...data, status: 'todo' });
        }

        modal.hide();
        this.render();
        this.updateStats();
    }

    openEditModal(task) {
        modal.showTaskModal(task);
    }

    openDeleteConfirm(task) {
        modal.showConfirm(() => {
            taskStorage.deleteTask(task.id);
            this.render();
            this.updateStats();
        });
    }

    render() {
        const allTasks = taskStorage.getAllTasks();
        
        const filteredTasks = allTasks.filter(task => {
            if (!this.searchQuery) return true;
            return task.title.toLowerCase().includes(this.searchQuery) ||
                   task.description.toLowerCase().includes(this.searchQuery);
        });

        const statusGroups = {
            'todo': filteredTasks.filter(t => t.status === 'todo'),
            'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
            'completed': filteredTasks.filter(t => t.status === 'completed'),
            'abandoned': filteredTasks.filter(t => t.status === 'abandoned')
        };

        Object.keys(statusGroups).forEach(status => {
            card.renderCards(statusGroups[status], status);
        });

        const counts = {
            'todo': statusGroups['todo'].length,
            'in-progress': statusGroups['in-progress'].length,
            'completed': statusGroups['completed'].length,
            'abandoned': statusGroups['abandoned'].length
        };

        tabManager.updateCounts(counts);
    }

    updateStats() {
        const stats = taskStorage.getStats();
        
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completionRate').textContent = stats.rate + '%';
        document.getElementById('todayDue').textContent = stats.todayDue;
    }

    exportTasks() {
        const data = taskStorage.exportTasks();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-board-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importTasks(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!Array.isArray(data)) {
                    alert('导入格式错误：数据不是数组');
                    return;
                }

                const validTasks = data.every(task => {
                    return task && 
                           typeof task.id === 'string' &&
                           typeof task.title === 'string' &&
                           ['todo', 'in-progress', 'completed', 'abandoned'].includes(task.status);
                });

                if (!validTasks) {
                    alert('导入格式错误：任务数据格式不正确');
                    return;
                }

                taskStorage.importTasks(data);
                this.render();
                this.updateStats();
                alert('导入成功！');
            } catch (err) {
                alert('导入失败：' + err.message);
            }
        };
        reader.readAsText(file);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.openEditModal = (task) => app.openEditModal(task);
    window.openDeleteConfirm = (task) => app.openDeleteConfirm(task);
    
    const app = new TodoApp();
});

class TaskStorage {
    constructor() {
        this.STORAGE_KEY = 'todo_board_tasks';
        this.tasks = this.loadTasks();
    }

    loadTasks() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse tasks:', e);
                return [];
            }
        }
        return [];
    }

    saveTasks() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getAllTasks() {
        return [...this.tasks];
    }

    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    addTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            dueDate: taskData.dueDate,
            status: taskData.status || 'todo',
            createdAt: new Date().toISOString(),
            completedAt: null,
            order: this.tasks.filter(t => t.status === (taskData.status || 'todo')).length
        };
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    updateTask(id, taskData) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                ...taskData,
                id: this.tasks[index].id,
                createdAt: this.tasks[index].createdAt
            };
            this.saveTasks();
            return this.tasks[index];
        }
        return null;
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.saveTasks();
            return true;
        }
        return false;
    }

    moveTask(id, newStatus) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            if (newStatus === 'completed') {
                task.completedAt = new Date().toISOString();
            }
            this.saveTasks();
            return task;
        }
        return null;
    }

    reorderTasks(status, orderedIds) {
        orderedIds.forEach((id, index) => {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.order = index;
            }
        });
        this.saveTasks();
    }

    importTasks(newTasks) {
        this.tasks = newTasks;
        this.saveTasks();
    }

    exportTasks() {
        return JSON.stringify(this.tasks, null, 2);
    }

    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const today = new Date().toISOString().split('T')[0];
        const todayDue = this.tasks.filter(t => {
            return t.dueDate === today && t.status !== 'completed' && t.status !== 'abandoned';
        }).length;

        return { total, completed, rate, todayDue };
    }
}

const taskStorage = new TaskStorage();

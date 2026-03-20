// 任务数据管理
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentTab = 'todo';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    loadTasks() {
        const tasks = localStorage.getItem('todo-tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    saveTasks() {
        localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
    }

    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description,
            deadline: taskData.deadline,
            status: 'todo',
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        this.tasks.unshift(task);
        this.saveTasks();
        return task;
    }

    updateTask(taskId, taskData) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.title = taskData.title;
            task.description = taskData.description;
            task.deadline = taskData.deadline;
            this.saveTasks();
        }
        return task;
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
    }

    updateTaskStatus(taskId, status) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            if (status === 'completed') {
                task.completedAt = new Date().toISOString();
            }
            this.saveTasks();
        }
        return task;
    }

    getTasksByStatus(status) {
        return this.tasks.filter(t => t.status === status);
    }

    searchTasks(keyword) {
        if (!keyword) return this.tasks;
        return this.tasks.filter(task => 
            task.title.toLowerCase().includes(keyword.toLowerCase()) ||
            task.description.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const today = new Date().toISOString().split('T')[0];
        const todayDeadlines = this.tasks.filter(t => t.deadline === today).length;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        document.getElementById('today-deadlines').textContent = todayDeadlines;

        // 更新tab计数
        ['todo', 'in-progress', 'completed', 'abandoned'].forEach(status => {
            const count = this.getTasksByStatus(status).length;
            document.getElementById(`${status}-count`).textContent = count;
        });
    }

    renderTasks() {
        const searchKeyword = document.getElementById('search-input').value;
        const filteredTasks = this.searchTasks(searchKeyword);

        ['todo', 'in-progress', 'completed', 'abandoned'].forEach(status => {
            const taskList = document.getElementById(`${status}-list`);
            taskList.innerHTML = '';

            const tasks = filteredTasks.filter(t => t.status === status);
            tasks.forEach(task => {
                const taskCard = this.createTaskCard(task);
                taskList.appendChild(taskCard);
            });
        });
    }

    createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.dataset.taskId = task.id;

        // 检查是否过期
        const today = new Date().toISOString().split('T')[0];
        if (task.deadline < today && task.status !== 'completed') {
            taskCard.classList.add('expired');
        }

        taskCard.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-deadline">截止日期: ${task.deadline}</div>
            <div class="task-actions">
                <button class="btn btn-secondary edit-btn" data-task-id="${task.id}">编辑</button>
                <button class="btn btn-danger delete-btn" data-task-id="${task.id}">删除</button>
            </div>
        `;

        // 拖拽事件
        taskCard.draggable = true;
        taskCard.addEventListener('dragstart', this.handleDragStart.bind(this));
        taskCard.addEventListener('dragend', this.handleDragEnd.bind(this));

        // 编辑和删除按钮事件
        taskCard.querySelector('.edit-btn').addEventListener('click', () => this.openEditModal(task.id));
        taskCard.querySelector('.delete-btn').addEventListener('click', () => this.openDeleteModal(task.id));

        return taskCard;
    }

    bindEvents() {
        // Tab切换
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
            });
        });

        // 新增任务按钮
        document.getElementById('add-task-btn').addEventListener('click', () => this.openAddModal());

        // 搜索输入
        document.getElementById('search-input').addEventListener('input', () => this.renderTasks());

        // 导出按钮
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());

        // 导入按钮
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        // 导入文件
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));

        // 拖拽事件
        document.querySelectorAll('.task-list').forEach(list => {
            list.addEventListener('dragover', this.handleDragOver.bind(this));
            list.addEventListener('dragenter', this.handleDragEnter.bind(this));
            list.addEventListener('dragleave', this.handleDragLeave.bind(this));
            list.addEventListener('drop', this.handleDrop.bind(this));
        });

        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal());

        // 表单提交
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // 删除确认
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancel-delete').addEventListener('click', () => this.closeDeleteModal());
    }

    openAddModal() {
        document.getElementById('modal-title').textContent = '新增任务';
        document.getElementById('task-id').value = '';
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-deadline').value = new Date().toISOString().split('T')[0];
        document.getElementById('task-modal').style.display = 'block';
    }

    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('modal-title').textContent = '编辑任务';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-deadline').value = task.deadline;
            document.getElementById('task-modal').style.display = 'block';
        }
    }

    closeModal() {
        document.getElementById('task-modal').style.display = 'none';
    }

    openDeleteModal(taskId) {
        this.currentDeleteId = taskId;
        document.getElementById('delete-modal').style.display = 'block';
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').style.display = 'none';
    }

    confirmDelete() {
        if (this.currentDeleteId) {
            this.deleteTask(this.currentDeleteId);
            this.renderTasks();
            this.updateStats();
            this.closeDeleteModal();
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const taskId = document.getElementById('task-id').value;
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            deadline: document.getElementById('task-deadline').value
        };

        if (taskId) {
            this.updateTask(taskId, taskData);
        } else {
            this.addTask(taskData);
        }

        this.renderTasks();
        this.updateStats();
        this.closeModal();
    }

    handleDragStart(e) {
        this.draggedTaskId = e.target.dataset.taskId;
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedTaskId = null;
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');

        const column = e.target.closest('.column');
        if (column && this.draggedTaskId) {
            const newStatus = column.dataset.column;
            this.updateTaskStatus(this.draggedTaskId, newStatus);
            this.renderTasks();
            this.updateStats();
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    // 格式校验
                    if (Array.isArray(importedTasks) && importedTasks.every(t => t.id && t.title && t.deadline)) {
                        this.tasks = importedTasks;
                        this.saveTasks();
                        this.renderTasks();
                        this.updateStats();
                        alert('导入成功！');
                    } else {
                        alert('导入失败：数据格式不正确！');
                    }
                } catch (error) {
                    alert('导入失败：JSON解析错误！');
                }
            };
            reader.readAsText(file);
        }
    }
}

// 初始化应用
const app = new TaskManager();
class Card {
    constructor() {
        this.cardList = document.querySelectorAll('.card-list');
    }

    createCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.dataset.id = task.id;
        
        const isExpired = task.status !== 'completed' && task.status !== 'abandoned' && isOverdue(task.dueDate);
        
        if (isExpired) {
            card.classList.add('expired');
        }
        
        let dueDateDisplay = '';
        if (task.dueDate) {
            if (isExpired) {
                dueDateDisplay = `<span class="card-due-date overdue">已过期: ${formatDisplayDate(task.dueDate)}</span>`;
            } else if (isToday(task.dueDate)) {
                dueDateDisplay = `<span class="card-due-date today">今日到期</span>`;
            } else {
                dueDateDisplay = `<span class="card-due-date">截止: ${formatDisplayDate(task.dueDate)}</span>`;
            }
        }
        
        let completedInfo = '';
        if (task.status === 'completed' && task.completedAt) {
            const completedDate = new Date(task.completedAt);
            const month = completedDate.getMonth() + 1;
            const day = completedDate.getDate();
            completedInfo = `<span class="completed-info">✓ 已完成 ${month}月${day}日</span>`;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${this.escapeHtml(task.title)}</h3>
                <div class="card-actions">
                    <button class="card-action edit" title="编辑">✎</button>
                    <button class="card-action delete" title="删除">✕</button>
                </div>
            </div>
            ${task.description ? `<p class="card-desc">${this.escapeHtml(task.description)}</p>` : ''}
            <div class="card-footer">
                ${dueDateDisplay}
                ${completedInfo}
            </div>
        `;
        
        card.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleEdit(task);
        });
        
        card.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleDelete(task);
        });
        
        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleEdit(task) {
        if (typeof window.openEditModal === 'function') {
            window.openEditModal(task);
        }
    }

    handleDelete(task) {
        if (typeof window.openDeleteConfirm === 'function') {
            window.openDeleteConfirm(task);
        }
    }

    renderCards(tasks, status) {
        const container = document.querySelector(`.card-list[data-status="${status}"]`);
        if (!container) return;
        
        container.innerHTML = '';
        
        const sortedTasks = [...tasks].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedTasks.forEach(task => {
            const card = this.createCard(task);
            container.appendChild(card);
        });
    }
}

const card = new Card();

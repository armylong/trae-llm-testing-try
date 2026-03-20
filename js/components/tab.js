class TabManager {
    constructor() {
        this.activeTab = 'todo';
    }

    updateCounts(counts) {
        Object.keys(counts).forEach(status => {
            const countEl = document.querySelector(`.column-count[data-count="${status}"]`);
            if (countEl) {
                countEl.textContent = counts[status];
            }
        });
    }

    getActiveTab() {
        return this.activeTab;
    }
}

const tabManager = new TabManager();

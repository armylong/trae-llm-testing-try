class TabManager {
    constructor() {
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.activeTab = 'todo';
        
        this.init();
    }

    init() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        this.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.tabPanels.forEach(panel => {
            const panelId = panel.id.replace('panel-', '');
            if (panelId === tabName) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    updateCounts(counts) {
        Object.keys(counts).forEach(status => {
            const countEl = document.querySelector(`.tab-count[data-count="${status}"]`);
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

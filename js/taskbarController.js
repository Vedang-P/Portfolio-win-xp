const Taskbar = {
    buttons: {},

    init() {
        const startBtn = document.getElementById('start-button');
        const menu = document.getElementById('start-menu');
        const userName = document.querySelector('.user-name');

        if (userName) {
            userName.textContent = AppsRegistry.getProfileName();
        }

        startBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            SoundManager.play('click');
            if (menu.classList.contains('visible')) {
                this.closeStartMenu();
            } else {
                this.openStartMenu();
            }
        });

        document.addEventListener('click', (event) => {
            if (menu.classList.contains('visible') &&
                !menu.contains(event.target) &&
                !startBtn.contains(event.target)) {
                this.closeStartMenu();
            }
        });

        document.querySelectorAll('#start-menu li[data-app]').forEach(item => {
            item.addEventListener('click', () => {
                SoundManager.play('click');
                WindowManager.open(item.dataset.app);
                this.closeStartMenu();
            });
        });

        document.querySelectorAll('#start-menu li[data-action]').forEach(item => {
            item.addEventListener('click', () => {
                SoundManager.play('click');
                this.handleAction(item.dataset.action);
            });
        });

        document.querySelectorAll('#quick-launch [data-open-app]').forEach(btn => {
            btn.addEventListener('click', () => {
                SoundManager.play('click');
                this.closeStartMenu();
                Clock.hidePopup();
                WindowManager.open(btn.dataset.openApp);
            });
        });

        document.querySelectorAll('#quick-launch [data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                SoundManager.play('click');
                this.closeStartMenu();
                Clock.hidePopup();
                if (btn.dataset.action === 'show-desktop') {
                    WindowManager.minimizeAll();
                }
            });
        });

        const soundIcon = document.querySelector('[data-tray="sound"]');
        if (soundIcon) {
            soundIcon.addEventListener('click', () => {
                SoundManager.toggle();
            });
        }
    },

    handleAction(action) {
        if (action === 'shutdown') {
            this.closeStartMenu();
            SessionManager.shutdown();
        } else if (action === 'logoff') {
            this.closeStartMenu();
            SessionManager.logOff();
        }
    },

    openStartMenu() {
        Clock.hidePopup();
        document.getElementById('start-menu').classList.add('visible');
        document.getElementById('start-button').classList.add('active');
    },

    closeStartMenu() {
        document.getElementById('start-menu').classList.remove('visible');
        document.getElementById('start-button').classList.remove('active');
    },

    addButton(id, title, icon) {
        const container = document.getElementById('taskbar-apps');
        const btn = document.createElement('div');
        btn.className = 'taskbar-app active';
        btn.dataset.id = id;
        btn.innerHTML = `<img src="${icon}" class="app-icon"><span class="app-title">${title}</span>`;
        btn.addEventListener('click', () => WindowManager.toggle(id));
        container.appendChild(btn);
        this.buttons[id] = btn;
    },

    removeButton(id) {
        if (this.buttons[id]) {
            this.buttons[id].remove();
            delete this.buttons[id];
        }
    },

    setActive(id) {
        Object.keys(this.buttons).forEach(key => {
            this.buttons[key].classList.toggle('active', key === id);
        });
    },

    setMinimized(id, minimized) {
        if (this.buttons[id]) {
            this.buttons[id].classList.toggle('minimized', minimized);
        }
    }
};

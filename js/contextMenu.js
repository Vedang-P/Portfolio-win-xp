const ContextMenu = {
    init() {
        this.desktop = document.getElementById('desktop');
        this.menu = document.getElementById('desktop-context-menu');
        if (!this.desktop || !this.menu) return;

        this.desktop.addEventListener('contextmenu', (event) => {
            if (!SessionManager.loggedIn) return;
            event.preventDefault();
            WindowManager.clearIconSelection();
            this.open(event.clientX, event.clientY);
        });

        document.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.close();
        });

        this.menu.querySelectorAll('li[data-action]').forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                this.handleAction(item.dataset.action);
                this.close();
            });
        });

        this.updateSoundText();
    },

    open(x, y) {
        Taskbar.closeStartMenu();
        Clock.hidePopup();
        this.updateSoundText();

        this.menu.classList.add('visible');

        const rect = this.menu.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 8;
        const maxY = window.innerHeight - rect.height - 8;

        this.menu.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
        this.menu.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
    },

    close() {
        this.menu.classList.remove('visible');
    },

    updateSoundText() {
        const soundItem = this.menu.querySelector('[data-action="toggle-sound"]');
        if (!soundItem) return;
        soundItem.textContent = SoundManager.isEnabled() ? 'Mute Sounds' : 'Enable Sounds';
    },

    handleAction(action) {
        SoundManager.play('click');

        if (action === 'refresh') {
            const icons = document.getElementById('desktop-icons');
            icons.classList.remove('desktop-refresh');
            void icons.offsetWidth;
            icons.classList.add('desktop-refresh');
        } else if (action === 'show-desktop') {
            WindowManager.minimizeAll();
        } else if (action === 'about') {
            WindowManager.open('about');
        } else if (action === 'paint') {
            WindowManager.open('paint');
        } else if (action === 'personalize') {
            WindowManager.open('control');
        } else if (action === 'toggle-sound') {
            SoundManager.toggle();
            this.updateSoundText();
        }
    }
};

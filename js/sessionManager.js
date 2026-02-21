const SessionManager = {
    initialized: false,
    loggedIn: false,
    hasLoggedInOnce: false,

    init() {
        this.cacheElements();
        Personalization.init();
        SoundManager.init();
        this.hideShell();
        this.bindLogin();

        BootScreen.init(() => {
            this.showLogin();
        });
    },

    cacheElements() {
        this.desktop = document.getElementById('desktop');
        this.taskbar = document.getElementById('taskbar');
        this.startMenu = document.getElementById('start-menu');
        this.loginScreen = document.getElementById('login-screen');
        this.loginName = document.getElementById('login-user-name');
        this.loginButton = document.getElementById('login-btn');
        this.shutdownScreen = document.getElementById('shutdown-screen');
        this.shutdownTitle = document.getElementById('shutdown-title');
        this.shutdownMessage = document.getElementById('shutdown-message');
        this.shutdownBar = document.getElementById('shutdown-bar-fill');
        this.restartBtn = document.getElementById('restart-btn');
    },

    bindLogin() {
        const profileName = AppsRegistry.getProfileName();
        if (this.loginName) {
            this.loginName.textContent = profileName;
        }

        if (this.loginButton) {
            this.loginButton.addEventListener('click', () => this.login());
        }

        const tile = this.loginScreen ? this.loginScreen.querySelector('.login-tile') : null;
        if (tile) {
            tile.addEventListener('dblclick', () => this.login());
        }

        document.addEventListener('keydown', (event) => {
            if (!this.loginScreen || !this.loginScreen.classList.contains('visible')) return;
            if (event.key === 'Enter') {
                this.login();
            }
        });
    },

    showLogin() {
        if (!this.loginScreen) return;
        this.loginScreen.classList.remove('hidden');
        this.loginScreen.classList.add('visible');
    },

    hideLogin() {
        if (!this.loginScreen) return;
        this.loginScreen.classList.remove('visible');
        this.loginScreen.classList.add('hidden');
    },

    showShell() {
        this.desktop.classList.remove('session-hidden');
        this.taskbar.classList.remove('session-hidden');
    },

    hideShell() {
        this.desktop.classList.add('session-hidden');
        this.taskbar.classList.add('session-hidden');
        this.startMenu.classList.remove('visible');
        Clock.hidePopup();
    },

    login() {
        if (this.loggedIn) return;

        if (!this.initialized) {
            WindowManager.init();
            Taskbar.init();
            Clock.init();
            ContextMenu.init();
            this.initialized = true;
        }

        this.hideLogin();
        this.showShell();
        this.loggedIn = true;
        if (this.hasLoggedInOnce) {
            SoundManager.play('login');
        } else {
            SoundManager.play('startup');
            this.hasLoggedInOnce = true;
        }
    },

    logOff() {
        if (!this.loggedIn) return;
        ContextMenu.close();
        WindowManager.closeAll();
        this.hideShell();
        this.showLogin();
        this.loggedIn = false;
        SoundManager.play('logoff');
    },

    shutdown() {
        ContextMenu.close();
        WindowManager.closeAll();
        this.hideShell();
        this.loggedIn = false;

        this.shutdownTitle.textContent = 'Windows XP';
        this.shutdownMessage.textContent = 'Windows is shutting down...';
        this.shutdownScreen.classList.add('visible');

        this.shutdownBar.style.width = '0%';
        this.restartBtn.classList.remove('visible');

        setTimeout(() => {
            this.shutdownBar.style.width = '100%';
            SoundManager.play('shutdown');
        }, 80);

        setTimeout(() => {
            this.restartBtn.textContent = 'Turn On';
            this.restartBtn.classList.add('visible');
        }, 750);

        this.restartBtn.onclick = () => {
            location.reload();
        };
    }
};

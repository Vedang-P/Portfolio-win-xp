const WindowManager = {
    windows: {},
    activeId: null,
    zIndex: 100,
    counter: 0,
    selectedIcon: null,
    clickTimer: null,
    selection: {
        active: false,
        started: false,
        startX: 0,
        startY: 0,
        desktopRect: null,
        boxEl: null,
        moved: false
    },

    init() {
        DragController.init();
        this.setupDesktopInteraction();
        this.setupKeyboardShortcuts();
        this.renderIcons();
    },

    setupDesktopInteraction() {
        const desktop = document.getElementById('desktop');
        const iconContainer = document.getElementById('desktop-icons');

        desktop.addEventListener('click', (event) => {
            if (this.selection.moved) {
                this.selection.moved = false;
                return;
            }

            if (event.target === desktop || event.target === iconContainer) {
                this.clearIconSelection();
            }
        });

        desktop.addEventListener('mousedown', (event) => {
            if (event.button !== 0) return;
            if (event.target.closest('.desktop-icon')) return;
            if (event.target.closest('.window')) return;
            this.beginSelection(event);
        });

        document.addEventListener('mousemove', (event) => this.updateSelection(event));
        document.addEventListener('mouseup', () => this.finishSelection());
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (!SessionManager.loggedIn) return;

            const target = event.target;
            const typing = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            );

            if (event.key === 'Escape') {
                Taskbar.closeStartMenu();
                ContextMenu.close();
                Clock.hidePopup();
                return;
            }

            if (typing) return;

            if (event.ctrlKey && event.key === 'Escape') {
                event.preventDefault();
                const menu = document.getElementById('start-menu');
                if (menu.classList.contains('visible')) {
                    Taskbar.closeStartMenu();
                } else {
                    Taskbar.openStartMenu();
                    SoundManager.play('click');
                }
                return;
            }

            if (event.altKey && event.key === 'F4') {
                event.preventDefault();
                if (this.activeId) {
                    this.close(this.activeId);
                } else {
                    SoundManager.play('stop');
                }
                return;
            }

            if (event.ctrlKey && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                this.minimizeAll();
                return;
            }

            if (event.key === 'Enter' && this.selectedIcon) {
                event.preventDefault();
                this.open(this.selectedIcon.dataset.app);
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                this.moveIconSelection(event.key);
            }
        });
    },

    beginSelection(event) {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const rect = desktop.getBoundingClientRect();
        this.selection.active = true;
        this.selection.started = false;
        this.selection.desktopRect = rect;
        this.selection.startX = Math.max(rect.left, Math.min(event.clientX, rect.right));
        this.selection.startY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));

        if (this.selection.boxEl) {
            this.selection.boxEl.remove();
            this.selection.boxEl = null;
        }
    },

    updateSelection(event) {
        if (!this.selection.active) return;
        if (!this.selection.desktopRect) return;

        const rect = this.selection.desktopRect;
        const clampedX = Math.max(rect.left, Math.min(event.clientX, rect.right));
        const clampedY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));

        const dx = Math.abs(clampedX - this.selection.startX);
        const dy = Math.abs(clampedY - this.selection.startY);

        if (!this.selection.started && dx < 3 && dy < 3) {
            return;
        }

        if (!this.selection.started) {
            this.selection.started = true;
            this.selection.moved = true;
            this.clearIconSelection();

            const box = document.createElement('div');
            box.className = 'desktop-selection-box';
            document.getElementById('desktop').appendChild(box);
            this.selection.boxEl = box;
        }

        const left = Math.min(this.selection.startX, clampedX);
        const top = Math.min(this.selection.startY, clampedY);
        const width = Math.abs(clampedX - this.selection.startX);
        const height = Math.abs(clampedY - this.selection.startY);

        const box = this.selection.boxEl;
        if (!box) return;

        box.style.left = `${left - rect.left}px`;
        box.style.top = `${top - rect.top}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;

        this.selectIconsInRect({ left, top, right: left + width, bottom: top + height });
    },

    finishSelection() {
        if (!this.selection.active) return;

        this.selection.active = false;
        this.selection.started = false;
        this.selection.desktopRect = null;

        if (this.selection.boxEl) {
            this.selection.boxEl.remove();
            this.selection.boxEl = null;
        }
    },

    selectIconsInRect(rect) {
        let first = null;

        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            const intersects = !(
                iconRect.right < rect.left ||
                iconRect.left > rect.right ||
                iconRect.bottom < rect.top ||
                iconRect.top > rect.bottom
            );

            icon.classList.toggle('selected', intersects);

            if (intersects && !first) {
                first = icon;
            }
        });

        this.selectedIcon = first;
    },

    clearIconSelection() {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.classList.remove('selected');
        });
        this.selectedIcon = null;
    },

    selectIcon(iconEl) {
        this.clearIconSelection();
        iconEl.classList.add('selected');
        this.selectedIcon = iconEl;
    },

    moveIconSelection(direction) {
        const icons = Array.from(document.querySelectorAll('.desktop-icon'));
        if (!icons.length) return;

        let index = icons.indexOf(this.selectedIcon);
        if (index < 0) {
            index = 0;
        } else if (direction === 'ArrowUp' || direction === 'ArrowLeft') {
            index = Math.max(0, index - 1);
        } else {
            index = Math.min(icons.length - 1, index + 1);
        }

        this.selectIcon(icons[index]);
    },

    handleIconClick(iconEl) {
        if (this.clickTimer) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
        }

        this.selectIcon(iconEl);
        SoundManager.play('click');

        this.clickTimer = setTimeout(() => {
            this.clickTimer = null;
        }, 300);
    },

    handleIconDoubleClick(appId) {
        if (this.clickTimer) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
        }

        this.open(appId);
    },

    renderIcons() {
        const container = document.getElementById('desktop-icons');
        container.innerHTML = '';

        AppsRegistry.getDesktopApps().forEach((app, index) => {
            const el = document.createElement('div');
            el.className = 'desktop-icon';
            el.dataset.app = app.appId;
            el.dataset.index = String(index);
            el.innerHTML = `
                <div class="icon-img">
                    <img src="${app.icon}" alt="${app.name}">
                </div>
                <div class="icon-label">${app.name}</div>
            `;

            el.addEventListener('click', (event) => {
                event.stopPropagation();
                this.handleIconClick(el);
            });

            el.addEventListener('dblclick', (event) => {
                event.stopPropagation();
                this.handleIconDoubleClick(app.appId);
            });

            container.appendChild(el);
        });
    },

    open(appId) {
        const existing = Object.values(this.windows).find(w => w.appId === appId && !w.closed);
        if (existing) {
            existing.minimized ? this.restore(existing.id) : this.focus(existing.id);
            return;
        }

        const app = AppsRegistry.getApp(appId);
        if (!app) {
            SoundManager.play('stop');
            return;
        }

        const id = `win-${++this.counter}`;
        const win = document.createElement('div');
        win.className = 'window active';
        win.dataset.windowId = id;

        const desktopRect = document.getElementById('desktop').getBoundingClientRect();
        const maxWidth = Math.max(260, desktopRect.width - 24);
        const maxHeight = Math.max(200, desktopRect.height - 24);
        const width = Math.min(app.width, maxWidth);
        const height = Math.min(app.height, maxHeight);

        const offset = Object.keys(this.windows).length;
        const x = Math.max(0, Math.min(70 + (offset * 25) % 150, desktopRect.width - width));
        const y = Math.max(0, Math.min(48 + (offset * 25) % 100, desktopRect.height - height));

        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
        win.style.zIndex = ++this.zIndex;

        win.innerHTML = `
            <div class="window-titlebar">
                <div class="window-title">
                    <img src="${app.icon}" alt="">
                    <span>${app.name}</span>
                </div>
                <div class="window-controls">
                    <button class="window-btn minimize-btn" title="Minimize"><span class="window-glyph">0</span></button>
                    <button class="window-btn maximize-btn" title="Maximize"><span class="window-glyph">1</span></button>
                    <button class="window-btn close-btn" title="Close"><span class="window-glyph">r</span></button>
                </div>
            </div>
            <div class="window-content">${AppsRegistry.generateContent(app)}</div>
        `;

        const titlebar = win.querySelector('.window-titlebar');
        titlebar.addEventListener('mousedown', event => {
            if (!event.target.closest('.window-btn')) {
                this.focus(id);
                DragController.start(win, event);
            }
        });

        titlebar.addEventListener('dblclick', event => {
            if (!event.target.closest('.window-btn')) {
                this.toggleMaximize(id);
            }
        });

        win.addEventListener('mousedown', () => this.focus(id));

        win.querySelector('.minimize-btn').onclick = () => this.minimize(id);
        win.querySelector('.maximize-btn').onclick = () => this.toggleMaximize(id);
        win.querySelector('.close-btn').onclick = () => this.close(id);

        if (app.id === 'projects') {
            setTimeout(() => this.initProjects(win), 0);
        }

        if (app.id === 'control') {
            setTimeout(() => this.initControlPanel(win), 0);
        }

        if (app.id === 'paint') {
            setTimeout(() => this.initPaint(win), 0);
        }

        if (app.isTerminal) {
            setTimeout(() => this.initTerminal(win, id), 0);
        }

        document.getElementById('windows-container').appendChild(win);

        this.windows[id] = {
            id,
            appId,
            el: win,
            x,
            y,
            width,
            height,
            zIndex: this.zIndex,
            active: true,
            minimized: false,
            maximized: false,
            closed: false
        };

        this.focus(id);
        Taskbar.addButton(id, app.name, app.icon);
        SoundManager.play('open');
    },

    initProjects(win) {
        win.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', () => {
                win.querySelectorAll('.project-item').forEach(node => node.classList.remove('selected'));
                item.classList.add('selected');
            });

            item.addEventListener('dblclick', () => {
                const link = item.dataset.link;
                if (link) {
                    window.open(link, '_blank');
                }
            });
        });
    },

    initControlPanel(win) {
        const panel = win.querySelector('.control-panel');
        if (!panel) return;

        const sync = () => {
            panel.querySelectorAll('[data-theme]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === Personalization.getTheme());
            });

            panel.querySelectorAll('[data-wallpaper-key]').forEach(btn => {
                const key = btn.dataset.wallpaperKey;
                const wallpaper = Personalization.getWallpaperByKey(key);
                btn.classList.toggle('active', wallpaper === Personalization.getWallpaper());
            });

            const soundBtn = panel.querySelector('[data-sound-toggle]');
            if (soundBtn) {
                soundBtn.textContent = SoundManager.isEnabled() ? 'Disable Sounds' : 'Enable Sounds';
            }
        };

        panel.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                Personalization.applyTheme(btn.dataset.theme);
                SoundManager.play('click');
                sync();
            });
        });

        panel.querySelectorAll('[data-wallpaper-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                const wallpaper = Personalization.getWallpaperByKey(btn.dataset.wallpaperKey);
                if (wallpaper) {
                    Personalization.applyWallpaper(wallpaper);
                    SoundManager.play('click');
                    sync();
                }
            });
        });

        const soundBtn = panel.querySelector('[data-sound-toggle]');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                SoundManager.toggle();
                sync();
            });
        }

        sync();
    },

    initPaint(win) {
        const canvas = win.querySelector('.paint-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let drawing = false;
        let brushColor = '#000000';
        let brushSize = 4;

        const getCanvasPoint = (event) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (event.clientX - rect.left) * scaleX,
                y: (event.clientY - rect.top) * scaleY
            };
        };

        const startDraw = (event) => {
            drawing = true;
            const point = getCanvasPoint(event);
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            canvas.setPointerCapture(event.pointerId);
        };

        const draw = (event) => {
            if (!drawing) return;
            const point = getCanvasPoint(event);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        };

        const stopDraw = (event) => {
            if (!drawing) return;
            drawing = false;
            ctx.closePath();
            if (event.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) {
                canvas.releasePointerCapture(event.pointerId);
            }
        };

        canvas.addEventListener('pointerdown', startDraw);
        canvas.addEventListener('pointermove', draw);
        canvas.addEventListener('pointerup', stopDraw);
        canvas.addEventListener('pointercancel', stopDraw);
        canvas.addEventListener('pointerleave', stopDraw);

        win.querySelectorAll('.paint-swatch').forEach(btn => {
            btn.addEventListener('click', () => {
                win.querySelectorAll('.paint-swatch').forEach(node => node.classList.remove('active'));
                btn.classList.add('active');
                brushColor = btn.dataset.color;
            });
        });

        const sizeSelect = win.querySelector('[data-paint-size]');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => {
                brushSize = parseInt(sizeSelect.value, 10);
            });
        }

        win.querySelectorAll('[data-paint-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.paintAction;

                if (action === 'eraser') {
                    brushColor = '#ffffff';
                    win.querySelectorAll('.paint-swatch').forEach(node => node.classList.remove('active'));
                } else if (action === 'clear') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (action === 'save') {
                    const link = document.createElement('a');
                    link.download = 'paint-drawing.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            });
        });
    },

    initTerminal(win, id) {
        const term = win.querySelector('.cmd-terminal');
        const input = win.querySelector('.cmd-input');
        if (!input) return;

        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                const cmd = input.value;
                this.runCommand(cmd, id);
                input.value = '';
            }
        });

        term.addEventListener('click', () => input.focus());
    },

    runCommand(cmd, id) {
        const win = this.windows[id];
        if (!win) return;

        const term = win.el.querySelector('.cmd-terminal');
        const inputText = cmd.trim();
        if (!inputText) return;

        const cmdLine = document.createElement('div');
        cmdLine.className = 'cmd-line';
        cmdLine.innerHTML = `<span class="cmd-prompt">C:\\>${inputText}</span>`;
        term.insertBefore(cmdLine, term.querySelector('.cmd-input-line'));

        let output = '';
        let isError = false;
        let feedbackSound = '';

        const [baseCommand, ...args] = inputText.split(/\s+/);
        const command = baseCommand.toLowerCase();
        const argument = args.join(' ').toLowerCase();

        if (command === 'help') {
            output = `Available commands:\n  help        - Show this help message\n  whoami      - Display profile name\n  about       - Show summary\n  skills      - List core skills\n  projects    - List projects\n  contact     - List contact links\n  resume      - Show resume file title\n  theme       - Set theme [blue|olive|silver]\n  wallpaper   - Set wallpaper [bliss|redbull|redcar|verstappen|night|sunset]\n  sound       - Set sound [on|off]\n  open        - Open app (about/projects/skills/resume/contact/control/paint)\n  clear       - Clear the terminal\n  date        - Show current date\n  time        - Show current time\n  hostname    - Display computer name`;
        } else if (command === 'whoami') {
            output = AppsRegistry.profile.displayName;
        } else if (command === 'about') {
            output = `${AppsRegistry.profile.displayName} - ${AppsRegistry.profile.role}\n${AppsRegistry.profile.summary}`;
        } else if (command === 'skills') {
            output = `Core Skills:\n${AppsRegistry.profile.skills.map(skill => `  - ${skill}`).join('\n')}`;
        } else if (command === 'projects') {
            output = `Projects:\n${AppsRegistry.profile.projects.map(project => `  - ${project.name}`).join('\n')}`;
        } else if (command === 'contact') {
            output = `Contact:\n${AppsRegistry.profile.contacts.map(contact => `  - ${contact.label}: ${contact.value}`).join('\n')}`;
        } else if (command === 'resume') {
            output = AppsRegistry.profile.resume.title;
        } else if (command === 'theme') {
            const map = { blue: 'luna-blue', olive: 'olive', silver: 'silver' };
            const theme = map[argument];
            if (theme) {
                Personalization.applyTheme(theme);
                output = `Theme set to ${theme}.`;
            } else {
                output = 'Usage: theme [blue|olive|silver]';
                isError = true;
                feedbackSound = 'stop';
            }
        } else if (command === 'wallpaper') {
            const wallpaper = Personalization.getWallpaperByKey(argument);
            if (wallpaper) {
                Personalization.applyWallpaper(wallpaper);
                output = `Wallpaper set to ${argument}.`;
            } else {
                output = 'Usage: wallpaper [bliss|redbull|redcar|verstappen|night|sunset]';
                isError = true;
                feedbackSound = 'stop';
            }
        } else if (command === 'sound') {
            if (argument === 'on') {
                SoundManager.setEnabled(true);
                SoundManager.play('click');
                output = 'Sounds enabled.';
            } else if (argument === 'off') {
                SoundManager.setEnabled(false);
                output = 'Sounds muted.';
            } else {
                output = 'Usage: sound [on|off]';
                isError = true;
                feedbackSound = 'stop';
            }
        } else if (command === 'open') {
            const appAliases = {
                about: 'about',
                projects: 'projects',
                skills: 'skills',
                resume: 'resume',
                contact: 'contact',
                control: 'control',
                paint: 'paint'
            };

            const appId = appAliases[argument];
            if (appId) {
                this.open(appId);
                output = `Opening ${AppsRegistry.getApp(appId).name}...`;
            } else {
                output = 'Usage: open [about|projects|skills|resume|contact|control|paint]';
                isError = true;
                feedbackSound = 'stop';
            }
        } else if (command === 'clear') {
            win.el.querySelector('.window-content').innerHTML = AppsRegistry.generateContent(AppsRegistry.getApp(win.appId));
            setTimeout(() => this.initTerminal(win.el, id), 0);
            return;
        } else if (command === 'date') {
            output = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (command === 'time') {
            output = new Date().toLocaleTimeString();
        } else if (command === 'hostname') {
            output = 'XP-DESKTOP';
        } else {
            output = `'${command}' is not recognized as an internal or external command, operable program or batch file.`;
            isError = true;
            feedbackSound = 'error';
        }

        const outLine = document.createElement('div');
        outLine.className = `cmd-output ${isError ? 'error' : ''}`;
        outLine.textContent = output;
        term.insertBefore(outLine, term.querySelector('.cmd-input-line'));
        term.scrollTop = term.scrollHeight;

        if (isError) {
            SoundManager.play(feedbackSound || 'error');
        }
    },

    focus(id) {
        const win = this.windows[id];
        if (!win || win.minimized || win.closed) return;

        if (this.activeId && this.windows[this.activeId]) {
            this.windows[this.activeId].el.classList.remove('active');
            this.windows[this.activeId].el.classList.add('inactive');
            this.windows[this.activeId].active = false;
        }

        win.el.classList.remove('inactive');
        win.el.classList.add('active');
        win.el.style.zIndex = ++this.zIndex;
        win.zIndex = this.zIndex;
        win.active = true;
        this.activeId = id;
        Taskbar.setActive(id);
    },

    minimize(id, playSound = true) {
        const win = this.windows[id];
        if (!win) return;

        win.minimized = true;
        win.el.classList.add('minimized');
        Taskbar.setMinimized(id, true);

        if (playSound) {
            SoundManager.play('minimize');
        }

        if (this.activeId === id) {
            this.activeId = null;
            const visible = Object.values(this.windows).filter(w => !w.minimized && !w.closed);
            if (visible.length) {
                this.focus(visible[visible.length - 1].id);
            }
        }
    },

    restore(id) {
        const win = this.windows[id];
        if (!win) return;

        win.minimized = false;
        win.el.classList.remove('minimized');
        Taskbar.setMinimized(id, false);
        this.focus(id);
        SoundManager.play('restore');
    },

    toggleMaximize(id) {
        const win = this.windows[id];
        if (!win) return;

        const glyph = win.el.querySelector('.maximize-btn .window-glyph');

        if (win.maximized) {
            win.el.classList.remove('maximized');
            win.el.style.left = `${win.x}px`;
            win.el.style.top = `${win.y}px`;
            win.el.style.width = `${win.width}px`;
            win.el.style.height = `${win.height}px`;
            win.maximized = false;
            if (glyph) glyph.textContent = '1';
        } else {
            win.x = parseInt(win.el.style.left, 10);
            win.y = parseInt(win.el.style.top, 10);
            win.el.classList.add('maximized');
            win.maximized = true;
            if (glyph) glyph.textContent = '2';
        }
    },

    close(id, playSound = true) {
        const win = this.windows[id];
        if (!win) return;

        win.closed = true;
        win.el.remove();
        Taskbar.removeButton(id);

        if (playSound) {
            SoundManager.play('close');
        }

        if (this.activeId === id) {
            this.activeId = null;
            const visible = Object.values(this.windows).filter(w => !w.minimized && !w.closed);
            if (visible.length) {
                this.focus(visible[visible.length - 1].id);
            }
        }

        delete this.windows[id];
    },

    toggle(id) {
        const win = this.windows[id];
        if (!win) return;

        if (win.minimized) {
            this.restore(id);
        } else if (this.activeId === id) {
            this.minimize(id);
        } else {
            this.focus(id);
        }
    },

    minimizeAll() {
        let minimizedAny = false;

        Object.keys(this.windows).forEach(id => {
            const win = this.windows[id];
            if (win && !win.minimized && !win.closed) {
                this.minimize(id, false);
                minimizedAny = true;
            }
        });

        if (minimizedAny) {
            SoundManager.play('minimize');
        }
    },

    closeAll(playSound = false) {
        Object.keys(this.windows).forEach(id => {
            if (this.windows[id]) {
                this.close(id, playSound);
            }
        });
        this.activeId = null;
    }
};

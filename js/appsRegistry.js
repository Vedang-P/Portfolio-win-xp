const AppsRegistry = {
    profile: {
        displayName: 'Vedang',
        role: 'Frontend Engineer',
        location: 'United States',
        summary: `I build nostalgic, fast, and thoughtful web products.
This portfolio runs as a Windows XP inspired desktop shell with custom interactions, retro visuals, and personal projects.`,
        skills: [
            'HTML, CSS, JavaScript (ES6+)',
            'React and TypeScript',
            'Design Systems and Accessibility',
            'Performance and Web Vitals',
            'Node.js and API Integration'
        ],
        resume: {
            title: 'Resume.txt',
            content: `VEDANG
Frontend Engineer

Experience
- Built and shipped responsive web applications with modern frontend stacks.
- Led UI polish and component architecture across product surfaces.
- Collaborated closely with design and backend teams.

Highlights
- Strong focus on interaction quality and performance.
- Passion for retro interfaces and modern usability.

Education
- B.S. in Computer Science

Open the Contact app for direct links.`
        },
        projects: [
            {
                name: 'XP Portfolio Desktop',
                desc: 'Interactive Windows XP style personal site.',
                stack: 'HTML, CSS, JavaScript',
                link: ''
            },
            {
                name: 'Realtime Chat Client',
                desc: 'Socket based messaging experience with presence.',
                stack: 'React, Node.js, Socket.IO',
                link: 'https://github.com'
            },
            {
                name: 'Storefront UI',
                desc: 'Conversion focused e-commerce frontend.',
                stack: 'React, TypeScript',
                link: 'https://github.com'
            },
            {
                name: 'Visual Analytics Dashboard',
                desc: 'Data-heavy dashboard with custom charts.',
                stack: 'Vue, D3',
                link: 'https://github.com'
            }
        ],
        contacts: [
            { label: 'Email', value: 'hello@example.com', link: 'mailto:hello@example.com' },
            { label: 'GitHub', value: 'github.com/username', link: 'https://github.com/username' },
            { label: 'LinkedIn', value: 'linkedin.com/in/username', link: 'https://linkedin.com/in/username' }
        ]
    },

    apps: {
        about: {
            id: 'about',
            name: 'About Me',
            icon: 'assets/icons/Windows XP Icons/0199 - Notepad.ico',
            width: 620,
            height: 450
        },
        projects: {
            id: 'projects',
            name: 'Projects',
            icon: 'assets/icons/Windows XP Icons/0001 - Closed Folder.ico',
            width: 640,
            height: 460
        },
        skills: {
            id: 'skills',
            name: 'Skills',
            icon: 'assets/icons/Windows XP Icons/0100 - Utilities.ico',
            width: 560,
            height: 400
        },
        resume: {
            id: 'resume',
            name: 'Resume',
            icon: 'assets/icons/Windows XP Icons/0115 - Word Doc.ico',
            width: 600,
            height: 450
        },
        contact: {
            id: 'contact',
            name: 'Contact',
            icon: 'assets/icons/Windows XP Icons/0156 - Alt Email.ico',
            width: 500,
            height: 360
        },
        control: {
            id: 'control',
            name: 'Control Panel',
            icon: 'assets/icons/Windows XP Icons/0015 - Control Panel.ico',
            width: 620,
            height: 460
        },
        paint: {
            id: 'paint',
            name: 'Paint',
            icon: 'assets/icons/Windows XP Icons/0071 - Microsoft Paint.ico',
            width: 780,
            height: 560,
            isPaint: true
        },
        mydocs: {
            id: 'mydocs',
            name: 'My Documents',
            icon: 'assets/icons/Windows XP Icons/0002 - My Documents.ico',
            width: 520,
            height: 380
        },
        mycomputer: {
            id: 'mycomputer',
            name: 'My Computer',
            icon: 'assets/icons/Windows XP Icons/0018 - My Computer.ico',
            width: 560,
            height: 430
        },
        recycle: {
            id: 'recycle',
            name: 'Recycle Bin',
            icon: 'assets/icons/Windows XP Icons/0020 - Recycle Bin Empty.ico',
            width: 440,
            height: 340
        },
        ie: {
            id: 'ie',
            name: 'Internet Explorer',
            icon: 'assets/icons/Windows XP Icons/0081 - Internet Explorer.ico',
            width: 560,
            height: 360,
            homepage: 'https://github.com/username'
        },
        cmd: {
            id: 'cmd',
            name: 'Command Prompt',
            icon: 'assets/icons/Windows XP Icons/0088 - Command Prompt.ico',
            width: 700,
            height: 500,
            isTerminal: true
        }
    },

    getApp(id) {
        return this.apps[id] || null;
    },

    getDesktopApps() {
        return [
            { appId: 'mydocs', name: 'My Documents', icon: this.apps.mydocs.icon },
            { appId: 'mycomputer', name: 'My Computer', icon: this.apps.mycomputer.icon },
            { appId: 'projects', name: 'Projects', icon: this.apps.projects.icon },
            { appId: 'about', name: 'About Me', icon: this.apps.about.icon },
            { appId: 'resume', name: 'Resume', icon: this.apps.resume.icon },
            { appId: 'skills', name: 'Skills', icon: this.apps.skills.icon },
            { appId: 'paint', name: 'Paint', icon: this.apps.paint.icon },
            { appId: 'contact', name: 'Contact', icon: this.apps.contact.icon },
            { appId: 'control', name: 'Control Panel', icon: this.apps.control.icon },
            { appId: 'cmd', name: 'Command Prompt', icon: this.apps.cmd.icon },
            { appId: 'recycle', name: 'Recycle Bin', icon: this.apps.recycle.icon }
        ];
    },

    getProfileName() {
        return this.profile.displayName;
    },

    generateContent(app) {
        switch (app.id) {
            case 'about':
                return this.generateAboutHTML();
            case 'projects':
                return this.generateProjectsHTML();
            case 'skills':
                return this.generateSkillsHTML();
            case 'resume':
                return this.generateResumeHTML();
            case 'contact':
                return this.generateContactHTML();
            case 'control':
                return this.generateControlPanelHTML();
            case 'paint':
                return this.generatePaintHTML();
            case 'cmd':
                return this.generateTerminalHTML();
            case 'mydocs':
                return this.generateDocumentsHTML();
            case 'mycomputer':
                return this.generateMyComputerHTML();
            case 'recycle':
                return '<div class="contact-content"><p>Recycle Bin is empty.</p></div>';
            case 'ie':
                return this.generateIEHTML(app);
            default:
                return '<div class="window-content">Content not found</div>';
        }
    },

    generateAboutHTML() {
        return `
            <div class="xp-pane">
                <div class="xp-pane-header">
                    <div class="xp-pane-title">${this.profile.displayName}</div>
                    <div class="xp-pane-subtitle">${this.profile.role} - ${this.profile.location}</div>
                </div>
                <textarea class="notepad-content" readonly>${this.profile.summary}</textarea>
            </div>
        `;
    },

    generateProjectsHTML() {
        const html = this.profile.projects.map((project, index) => {
            const linkAttr = project.link ? `data-link="${project.link}"` : '';
            return `
                <div class="project-item" data-index="${index}" ${linkAttr}>
                    <img class="project-icon" src="assets/icons/Windows XP Icons/0001 - Closed Folder.ico" alt="">
                    <div class="project-text">
                        <div class="project-name">${project.name}</div>
                        <div class="project-desc">${project.desc}</div>
                        <div class="project-stack">${project.stack}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="projects-content">${html}</div>`;
    },

    generateSkillsHTML() {
        const html = this.profile.skills.map(skill => `
            <li class="xp-list-item">
                <img src="assets/icons/Windows XP Icons/0100 - Utilities.ico" alt="">
                <span>${skill}</span>
            </li>
        `).join('');

        return `
            <div class="xp-list">
                <div class="xp-list-header">Core Skills</div>
                <ul>${html}</ul>
            </div>
        `;
    },

    generateResumeHTML() {
        return `<textarea class="notepad-content" readonly>${this.profile.resume.content}</textarea>`;
    },

    generateContactHTML() {
        const iconMap = {
            email: 'assets/icons/Windows XP Icons/0156 - Alt Email.ico',
            github: 'assets/icons/Windows XP Icons/0081 - Internet Explorer.ico',
            linkedin: 'assets/icons/Windows XP Icons/0199 - Notepad.ico'
        };

        const html = this.profile.contacts.map(contact => `
            <div class="contact-item">
                <img class="contact-icon-img" src="${iconMap[contact.label.toLowerCase()] || this.apps.contact.icon}" alt="">
                <span class="contact-label">${contact.label}:</span>
                <a href="${contact.link}" target="_blank" rel="noreferrer">${contact.value}</a>
            </div>
        `).join('');

        return `<div class="contact-content">${html}</div>`;
    },

    generateControlPanelHTML() {
        const theme = Personalization.getTheme();
        const wallpaper = Personalization.getWallpaper();
        const wallpaperChips = Personalization.getWallpaperOptions().map(option => `
            <button
                class="control-chip ${wallpaper === option.value ? 'active' : ''}"
                data-wallpaper-key="${option.key}"
            >${option.label}</button>
        `).join('');

        return `
            <div class="control-panel">
                <div class="control-group">
                    <div class="control-title">Appearance</div>
                    <div class="control-options">
                        <button class="control-chip ${theme === 'luna-blue' ? 'active' : ''}" data-theme="luna-blue">Luna Blue</button>
                        <button class="control-chip ${theme === 'olive' ? 'active' : ''}" data-theme="olive">Olive Green</button>
                        <button class="control-chip ${theme === 'silver' ? 'active' : ''}" data-theme="silver">Silver</button>
                    </div>
                </div>

                <div class="control-group">
                    <div class="control-title">Wallpaper</div>
                    <div class="control-options">
                        ${wallpaperChips}
                    </div>
                </div>

                <div class="control-group">
                    <div class="control-title">Audio</div>
                    <div class="control-options">
                        <button class="control-chip" data-sound-toggle>${SoundManager.isEnabled() ? 'Disable Sounds' : 'Enable Sounds'}</button>
                    </div>
                </div>

                <div class="control-group">
                    <div class="control-title">Shell Shortcuts</div>
                    <div class="control-options text-list">
                        <span>Ctrl + Esc: Start menu</span>
                        <span>Alt + F4: Close active window</span>
                        <span>Ctrl + D: Show desktop</span>
                    </div>
                </div>
            </div>
        `;
    },

    generatePaintHTML() {
        const swatches = ['#000000', '#ffffff', '#0b4fa2', '#ff0000', '#00a300', '#ffff00', '#7a2f90', '#ff8c00', '#00a8c6', '#84563b'];
        const swatchHtml = swatches.map((color, idx) => `
            <button class="paint-swatch ${idx === 0 ? 'active' : ''}" data-color="${color}" style="background:${color};" title="${color}"></button>
        `).join('');

        return `
            <div class="paint-app">
                <div class="paint-toolbar">
                    <label>Brush:
                        <select class="paint-size" data-paint-size>
                            <option value="2">2 px</option>
                            <option value="4" selected>4 px</option>
                            <option value="8">8 px</option>
                            <option value="12">12 px</option>
                        </select>
                    </label>
                    <button class="paint-btn" data-paint-action="eraser">Eraser</button>
                    <button class="paint-btn" data-paint-action="clear">Clear</button>
                    <button class="paint-btn" data-paint-action="save">Save PNG</button>
                </div>
                <div class="paint-swatches">${swatchHtml}</div>
                <div class="paint-canvas-wrap">
                    <canvas class="paint-canvas" width="1300" height="900"></canvas>
                </div>
            </div>
        `;
    },

    generateDocumentsHTML() {
        return `
            <div class="xp-list">
                <div class="xp-list-header">Portfolio Documents</div>
                <ul>
                    <li class="xp-list-item">
                        <img src="${this.apps.resume.icon}" alt="">
                        <span>Resume.txt (open from desktop icon)</span>
                    </li>
                    <li class="xp-list-item">
                        <img src="${this.apps.projects.icon}" alt="">
                        <span>Projects Folder</span>
                    </li>
                    <li class="xp-list-item">
                        <img src="${this.apps.paint.icon}" alt="">
                        <span>Sketches.bmp (open Paint to draw)</span>
                    </li>
                </ul>
            </div>
        `;
    },

    generateMyComputerHTML() {
        return `
            <div class="xp-list">
                <div class="xp-list-header">System</div>
                <ul>
                    <li class="xp-list-item">
                        <img src="assets/icons/Windows XP Icons/0023 - Hard drive.ico" alt="">
                        <span>Local Disk (C:) - Portfolio Files</span>
                    </li>
                    <li class="xp-list-item">
                        <img src="assets/icons/Windows XP Icons/0027 - CDROM Drive.ico" alt="">
                        <span>CD Drive (D:) - Archived Builds</span>
                    </li>
                </ul>
            </div>
        `;
    },

    generateIEHTML(app) {
        return `
            <div class="contact-content ie-content">
                <img src="${app.icon}" alt="">
                <p>Internet Explorer</p>
                <p class="ie-hint">Open portfolio source profile</p>
                <a href="${app.homepage}" target="_blank" rel="noreferrer" class="ie-link">Open Link</a>
            </div>
        `;
    },

    generateTerminalHTML() {
        return `
            <div class="cmd-terminal" tabindex="0">
                <div class="cmd-line">
                    <span class="cmd-prompt">Microsoft Windows XP [Version 5.1.2600]</span>
                </div>
                <div class="cmd-line">
                    <span class="cmd-prompt">(c) Copyright 1985-2001 Microsoft Corp.</span>
                </div>
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-output">Type 'help' for available commands.</div>
                <div class="cmd-line cmd-input-line">
                    <span class="cmd-prompt">C:\\></span>
                    <input type="text" class="cmd-input" autofocus>
                </div>
            </div>
        `;
    }
};

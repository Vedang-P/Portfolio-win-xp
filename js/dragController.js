const DragController = {
    dragging: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,

    init() {
        document.addEventListener('mousemove', e => this.onMove(e));
        document.addEventListener('mouseup', e => this.onUp(e));
    },

    start(el, e) {
        if (e.target.closest('.window-btn')) return;
        this.dragging = el;
        const rect = el.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        el.style.transition = 'none';
        document.body.style.cursor = 'move';
    },

    onMove(e) {
        if (!this.dragging) return;
        const desktop = document.getElementById('desktop');
        const container = desktop.getBoundingClientRect();
        let x = e.clientX - container.left - this.offsetX;
        let y = e.clientY - container.top - this.offsetY;
        const rect = this.dragging.getBoundingClientRect();
        x = Math.max(0, Math.min(x, container.width - rect.width));
        y = Math.max(0, Math.min(y, container.height - rect.height));
        this.dragging.style.left = x + 'px';
        this.dragging.style.top = y + 'px';
    },

    onUp() {
        if (this.dragging) {
            const winId = this.dragging.dataset.windowId;
            const win = WindowManager.windows[winId];
            if (win) {
                win.x = parseInt(this.dragging.style.left);
                win.y = parseInt(this.dragging.style.top);
            }
            this.dragging.style.transition = '';
            document.body.style.cursor = '';
            this.dragging = null;
        }
    }
};

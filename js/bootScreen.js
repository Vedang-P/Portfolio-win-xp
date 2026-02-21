const BootScreen = {
    init(callback) {
        const bootScreen = document.getElementById('boot-screen');
        const desktop = document.getElementById('desktop');
        
        desktop.classList.add('blocked');
        
        setTimeout(() => {
            bootScreen.classList.add('fade-out');
            
            setTimeout(() => {
                bootScreen.style.display = 'none';
                desktop.classList.remove('blocked');
                
                if (callback) {
                    callback();
                }
            }, 500);
        }, 2500);
    }
};

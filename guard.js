// Guard script to protect game.html and admin.html
(() => {
    const username = localStorage.getItem('username');
    
    if (!username) {
        window.location.href = 'index.html';
    }
})();


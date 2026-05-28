// ==========================================
// MÓDULO MENÚ — Efecto vela con dragones
// ==========================================

(function () {
    const overlay      = document.getElementById('candle-overlay');
    const customCursor = document.getElementById('custom-cursor');
    const menuScreen   = document.getElementById('menu-screen');
    if (!overlay) return;

    let radius     = 120;
    let flickerT   = 0;
    let mouseX     = window.innerWidth  / 2;
    let mouseY     = window.innerHeight / 2;

    // Posición inicial centrada
    setPos(mouseX, mouseY);

    // ── Seguir el cursor ──────────────────────────────────────
    function setPos(cx, cy) {
        const rect = overlay.getBoundingClientRect();
        overlay.style.setProperty('--x', (cx - rect.left)  + 'px');
        overlay.style.setProperty('--y', (cy - rect.top)   + 'px');
        // Cursor SVG: centrado en la punta de la llama (offset -26px)
        customCursor.style.transform = `translate(${cx - 26}px, ${cy - 48}px)`;
        mouseX = cx;
        mouseY = cy;
    }

    menuScreen.addEventListener('mousemove', e => setPos(e.clientX, e.clientY));
    menuScreen.addEventListener('touchmove', e => {
        if (e.touches?.[0]) setPos(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    }, { passive: false });

    // ── Parpadeo de la llama ──────────────────────────────────
    function flicker() {
        flickerT += 0.05;
        const noise =
            Math.sin(flickerT * 3.1)  * 4 +
            Math.sin(flickerT * 7.3)  * 2 +
            Math.sin(flickerT * 13.7) * 1;
        overlay.style.setProperty('--r', (radius + noise) + 'px');
        requestAnimationFrame(flicker);
    }
    flicker();

    // ── Pétalos flotantes ─────────────────────────────────────
    const pc = document.getElementById('petals-container');
    if (pc) {
        const symbols = ['🌸', '✿', '❀', '✦'];
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.classList.add('petal');
            p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            p.style.left              = Math.random() * 100 + 'vw';
            p.style.fontSize          = (9 + Math.random() * 11) + 'px';
            p.style.animationDuration = (14 + Math.random() * 18) + 's';
            p.style.animationDelay    = -(Math.random() * 22) + 's';
            pc.appendChild(p);
        }
    }
})();
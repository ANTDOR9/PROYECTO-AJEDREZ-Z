// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const btnIniciar    = document.getElementById('btn-start');
    const btnAbandonar  = document.getElementById('btn-restart');
    const btnDeshacer   = document.getElementById('btn-undo');
    const btnMute       = document.getElementById('btn-mute');
    const menuScreen    = document.getElementById('menu-screen');
    const gameScreen    = document.getElementById('game-screen');

    // Música: arranca en el primer clic (requisito del navegador)
    let musicaIniciada = false;
    document.addEventListener('click', () => {
        if (!musicaIniciada) { musicaIniciada = true; AudioManager.playMenu(); }
    }, { once: true });

    // ── INICIAR ───────────────────────────────────────────────
    btnIniciar.addEventListener('click', () => {
        ConfigJuego.partidaActiva = true;
        // Ocultar menú, mostrar juego
        menuScreen.style.opacity = '0';
        menuScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => { menuScreen.style.display = 'none'; }, 400);
        gameScreen.classList.remove('hidden');
        gameScreen.style.opacity = '0';
        gameScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => { gameScreen.style.opacity = '1'; }, 50);
        UI.inicializar();
        AudioManager.playGame();
    });

    // ── ABANDONAR ─────────────────────────────────────────────
    btnAbandonar.addEventListener('click', () => {
        if (!confirm('¿Seguro que deseas abandonar la partida?')) return;
        ConfigJuego.partidaActiva = false;
        gameScreen.classList.add('hidden');
        menuScreen.style.display = '';
        menuScreen.style.opacity = '0';
        setTimeout(() => { menuScreen.style.opacity = '1'; }, 50);
        document.getElementById('chess-board').innerHTML = '';
        AudioManager.playMenu();
    });

    // ── DESHACER ──────────────────────────────────────────────
    btnDeshacer.addEventListener('click', () => {
        if (!ConfigJuego.partidaActiva) return;
        if (Logic.deshacerMovimiento()) {
            UI.casillaSeleccionada = null;
            UI.movimientosValidos  = [];
            UI.dibujarTablero();
            UI.actualizarTurno();
        }
    });

    // ── MUTE ──────────────────────────────────────────────────
    if (btnMute) {
        btnMute.addEventListener('click', () => {
            const muteado = AudioManager.toggleMute();
            const span = btnMute.querySelector('span');
            if (span) span.textContent = muteado ? '🔇 Sonido' : '🔊 Sonido';
        });
    }
});
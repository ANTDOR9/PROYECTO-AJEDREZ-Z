// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const btnIniciar   = document.getElementById('btn-start');
    const btnAbandonar = document.getElementById('btn-restart');
    const btnDeshacer  = document.getElementById('btn-undo');
    const btnMute      = document.getElementById('btn-mute');
    const pantallaMenu = document.getElementById('menu-screen');
    const pantallaJuego= document.getElementById('game-screen');

    // Música de menú al cargar
    if (typeof Audio !== 'undefined') Audio.playMenu();

    // ── INICIAR ───────────────────────────────────────────────
    btnIniciar.addEventListener('click', () => {
        ConfigJuego.partidaActiva = true;
        pantallaMenu.classList.add('hidden');
        pantallaJuego.classList.remove('hidden');
        UI.inicializar();
        if (typeof Audio !== 'undefined') Audio.playGame();
    });

    // ── ABANDONAR ─────────────────────────────────────────────
    btnAbandonar.addEventListener('click', () => {
        if (!confirm('¿Seguro que deseas abandonar la partida?')) return;
        ConfigJuego.partidaActiva = false;
        pantallaJuego.classList.add('hidden');
        pantallaMenu.classList.remove('hidden');
        document.getElementById('chess-board').innerHTML = '';
        if (typeof Audio !== 'undefined') Audio.playMenu();
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
            if (typeof Audio === 'undefined') return;
            const muteado = Audio.toggleMute();
            btnMute.textContent = muteado ? '🔇 Sonido' : '🔊 Sonido';
        });
    }
});
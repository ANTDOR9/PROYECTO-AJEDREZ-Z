// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const btnIniciar    = document.getElementById('btn-start');
    const btnAbandonar  = document.getElementById('btn-restart');
    const btnDeshacer   = document.getElementById('btn-undo');
    const btnMute       = document.getElementById('btn-mute');
    const pantallaMenu  = document.getElementById('menu-screen');
    const pantallaJuego = document.getElementById('game-screen');

    // El navegador bloquea autoplay hasta la primera interacción del usuario.
    // Arrancamos la música del menú en el primer clic sobre cualquier cosa.
    let musicaIniciada = false;
    const iniciarMusica = () => {
        if (!musicaIniciada) {
            musicaIniciada = true;
            AudioManager.playMenu();
        }
    };
    document.addEventListener('click', iniciarMusica, { once: true });

    // ── INICIAR PARTIDA ───────────────────────────────────────
    btnIniciar.addEventListener('click', () => {
        ConfigJuego.partidaActiva = true;
        pantallaMenu.classList.add('hidden');
        pantallaJuego.classList.remove('hidden');
        UI.inicializar();
        AudioManager.playGame();
    });

    // ── ABANDONAR ─────────────────────────────────────────────
    btnAbandonar.addEventListener('click', () => {
        if (!confirm('¿Seguro que deseas abandonar la partida?')) return;
        ConfigJuego.partidaActiva = false;
        pantallaJuego.classList.add('hidden');
        pantallaMenu.classList.remove('hidden');
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
            btnMute.textContent = muteado ? '🔇 Sonido' : '🔊 Sonido';
        });
    }
});
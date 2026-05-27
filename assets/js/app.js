// ==========================================
// CONTROLADOR PRINCIPAL DEL PROYECTO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const btnIniciar    = document.getElementById("btn-start");
    const btnAbandonar  = document.getElementById("btn-restart");
    const btnDeshacer   = document.getElementById("btn-undo");
    const pantallaMenu  = document.getElementById("menu-screen");
    const pantallaJuego = document.getElementById("game-screen");

    // ── INICIAR PARTIDA ──────────────────────────────────────
    btnIniciar.addEventListener("click", () => {
        ConfigJuego.partidaActiva = true;

        pantallaMenu.classList.add("hidden");
        pantallaJuego.classList.remove("hidden");

        UI.inicializar();
    });

    // ── ABANDONAR / VOLVER AL MENÚ ───────────────────────────
    btnAbandonar.addEventListener("click", () => {
        if (confirm("¿Seguro que deseas abandonar la partida actual?")) {
            ConfigJuego.partidaActiva = false;

            pantallaJuego.classList.add("hidden");
            pantallaMenu.classList.remove("hidden");

            const tablero = document.getElementById("chess-board");
            if (tablero) tablero.innerHTML = "";
        }
    });

    // ── DESHACER MOVIMIENTO ───────────────────────────────────
    btnDeshacer.addEventListener("click", () => {
        if (!ConfigJuego.partidaActiva) return;

        const exito = Logic.deshacerMovimiento();
        if (exito) {
            UI.casillaSeleccionada = null;
            UI.movimientosValidos = [];
            UI.dibujarTablero();
            UI.actualizarTurno();
        }
    });
});
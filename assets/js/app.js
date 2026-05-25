// ==========================================
// CONTROLADOR PRINCIPAL DEL PROYECTO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const btnIniciar = document.getElementById("btn-start");
    const btnAbandonar = document.getElementById("btn-restart");
    const pantallaMenu = document.getElementById("menu-screen");
    const pantallaJuego = document.getElementById("game-screen");

    // Evento para INICIAR la partida
    btnIniciar.addEventListener("click", () => {
        ConfigJuego.partidaActiva = true;

        // Transición de pantallas cambiando clases CSS
        pantallaMenu.classList.add("hidden");
        pantallaJuego.classList.remove("hidden");

        console.log("Iniciando partida con la configuración:", ConfigJuego);

        // TODO: Inicializar la lógica del tablero (Fase de UI y Logic)
        if (typeof UI !== 'undefined' && typeof UI.inicializar === 'function') {
            UI.inicializar();
        }
    });

    // Evento para ABANDONAR la partida (Regresar al menú)
    btnAbandonar.addEventListener("click", () => {
        if (confirm("¿Seguro que deseas abandonar la partida actual?")) {
            ConfigJuego.partidaActiva = false;

            // Volver al menú inicial
            pantallaJuego.classList.add("hidden");
            pantallaMenu.classList.remove("hidden");
            
            // Limpiar tablero físico
            const tablero = document.getElementById("chess-board");
            if (tablero) tablero.innerHTML = "";
        }
    });
});
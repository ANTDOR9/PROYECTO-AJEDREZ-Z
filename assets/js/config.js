// ==========================================
// CONFIGURACIÓN GLOBAL DEL JUEGO (ESTADO)
// ==========================================

const ConfigJuego = {
    modo: "pvp",          // "pvp" o "bot"
    dificultadBot: "easy", // "easy", "medium", "hard"
    colorJugador: "white", // "white" o "black"
    partidaActiva: false
};

// Captura de elementos del DOM al cargar el script
document.addEventListener("DOMContentLoaded", () => {
    const selectorModo = document.getElementById("game-mode");
    const grupoDificultadBot = document.getElementById("bot-difficulty-group");
    const selectorDificultad = document.getElementById("bot-difficulty");
    const selectorColor = document.getElementById("player-color");

    // Mostrar/Ocultar dificultad del Bot dinámicamente
    selectorModo.addEventListener("change", (e) => {
        ConfigJuego.modo = e.target.value;
        
        if (ConfigJuego.modo === "bot") {
            grupoDificultadBot.classList.remove("hidden");
        } else {
            grupoDificultadBot.classList.add("hidden");
        }
    });

    // Escuchar cambios en los otros selectores para actualizar el objeto global
    selectorDificultad.addEventListener("change", (e) => {
        ConfigJuego.dificultadBot = e.target.value;
    });

    selectorColor.addEventListener("change", (e) => {
        ConfigJuego.colorJugador = e.target.value;
    });
});
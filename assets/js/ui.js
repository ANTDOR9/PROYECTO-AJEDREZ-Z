// ==========================================================
// MÓDULO UI: INTERFAZ GRÁFICA (RENDERIZADO DEL TABLERO)
// ==========================================================

const UI = {
    contenedorTablero: null,
    casillaSeleccionada: null, // Para guardar {fila, col} cuando el usuario hace clic

    // 1. Inicializa la interfaz capturando el contenedor del HTML
    inicializar() {
        this.contenedorTablero = document.getElementById("chess-board");
        this.casillaSeleccionada = null;
        this.dibujarTablero();
    },

    // 2. Traduce la matriz lógica de Logic.tablero a elementos HTML reales
    dibujarTablero() {
        // Limpiamos el tablero visual por si había una partida anterior
        this.contenedorTablero.innerHTML = "";

        // Recorremos las 8 filas y 8 columnas
        for (let fila = 0; fila < 8; fila++) {
            for (let col = 0; col < 8; col++) {
                
                // Creamos el elemento div para la casilla
                const casillaHTML = document.createElement("div");
                casillaHTML.classList.add("square");

                // Determinamos el color de la casilla (Fórmula matemática para intercalar)
                if ((fila + col) % 2 === 0) {
                    casillaHTML.classList.add("light");
                } else {
                    casillaHTML.classList.add("dark");
                }

                // Guardamos las coordenadas en atributos del HTML para saber dónde hace clic el usuario
                casillaHTML.dataset.fila = fila;
                casillaHTML.dataset.col = col;

                // Revisamos si hay una pieza en esta posición dentro de la lógica
                const pieza = Logic.tablero[fila][col];
                if (pieza) {
                    // Obtenemos el símbolo Unicode correspondiente (ej: '♙' o '♜')
                    const simbolo = Logic.piezasUnicode[pieza.color][pieza.tipo];
                    casillaHTML.textContent = simbolo;
                    // Le añadimos una clase CSS según el color por si queremos darles estilos diferentes
                    casillaHTML.classList.add(pieza.color === "white" ? "pieza-blanca" : "pieza-negra");
                }

                // Asignamos el evento de clic a cada casilla
                casillaHTML.addEventListener("click", (e) => this.manejarClicCasilla(e));

                // Metemos la casilla dentro del tablero en el HTML
                this.contenedorTablero.appendChild(casillaHTML);
            }
        }
    },

    // 3. Manejador de clics (Fase inicial: Permite seleccionar y mover libremente)
    manejarClicCasilla(evento) {
        // Obtenemos las coordenadas de la casilla pulsada
        const fila = parseInt(evento.currentTarget.dataset.fila);
        const col = parseInt(evento.currentTarget.dataset.col);
        const pieza = Logic.tablero[fila][col];

        // CASO 1: No hay ninguna pieza seleccionada previamente
        if (this.casillaSeleccionada === null) {
            if (pieza) {
                // Seleccionamos la pieza
                this.casillaSeleccionada = { fila, col };
                this.dibujarTablero(); // Redibujamos para limpiar selecciones viejas
                this.resaltarCasilla(fila, col); // Resaltamos la casilla actual
            }
        } 
        // CASO 2: Ya había una pieza seleccionada e intentamos moverla a la nueva casilla
        else {
            const origen = this.casillaSeleccionada;

            // Si hace clic en la misma casilla, la deseleccionamos
            if (origen.fila === fila && origen.col === col) {
                this.casillaSeleccionada = null;
                this.dibujarTablero();
                return;
            }

            // Ejecutamos el movimiento en el cerebro lógico del juego
            Logic.ejecutarMovimiento(origen.fila, origen.col, fila, col);

            // Reseteamos la selección y actualizamos la pantalla
            this.casillaSeleccionada = null;
            this.dibujarTablero();

            // Actualizamos visualmente el turno en el panel lateral llamando a app.js indirectamente
            document.getElementById("current-turn").textContent = 
                Logic.turnoActual === "white" ? "Blancas" : "Negras";
        }
    },

    // Función auxiliar para añadir la clase amarilla de selección
    resaltarCasilla(fila, col) {
        const casilla = this.contenedorTablero.querySelector(`[data-fila='${fila}'][data-col='${col}']`);
        if (casilla) casilla.classList.add("selected");
    }
};
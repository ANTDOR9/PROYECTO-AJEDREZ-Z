// ==========================================================
// MÓDULO UI: INTERFAZ GRÁFICA (RENDERIZADO DEL TABLERO)
// ==========================================================

const UI = {
    contenedorTablero: null,
    casillaSeleccionada: null,
    movimientosValidos: [],    // Lista de {fila, col} resaltados como pistas
    botPensando: false,        // Bloquea clics mientras el bot calcula

    inicializar() {
        this.contenedorTablero = document.getElementById("chess-board");
        this.casillaSeleccionada = null;
        this.movimientosValidos = [];
        this.botPensando = false;
        Logic.inicializarTablero();
        this.dibujarTablero();
        this.actualizarTurno();

        // Si el jugador eligió negras, el bot mueve primero
        if (ConfigJuego.modo === 'bot' && ConfigJuego.colorJugador === 'black') {
            this.ejecutarTurnoBotConDelay();
        }
    },

    dibujarTablero() {
        this.contenedorTablero.innerHTML = "";

        // Orientación del tablero según el color del jugador
        const invertido = ConfigJuego.colorJugador === 'black';

        for (let filaLogica = 0; filaLogica < 8; filaLogica++) {
            for (let colLogica = 0; colLogica < 8; colLogica++) {
                // Si el tablero está invertido, la fila visual va al revés
                const filaVisual = invertido ? 7 - filaLogica : filaLogica;
                const colVisual  = invertido ? 7 - colLogica  : colLogica;

                const casillaHTML = document.createElement("div");
                casillaHTML.classList.add("square");

                if ((filaVisual + colVisual) % 2 === 0) {
                    casillaHTML.classList.add("light");
                } else {
                    casillaHTML.classList.add("dark");
                }

                // Guardamos las coordenadas LÓGICAS (no visuales) para la lógica del juego
                casillaHTML.dataset.fila = filaVisual;
                casillaHTML.dataset.col = colVisual;

                const pieza = Logic.tablero[filaVisual][colVisual];
                if (pieza) {
                    const simbolo = Logic.piezasUnicode[pieza.color][pieza.tipo];
                    casillaHTML.textContent = simbolo;
                    casillaHTML.classList.add(pieza.color === "white" ? "pieza-blanca" : "pieza-negra");
                }

                // Resaltar casilla seleccionada
                if (this.casillaSeleccionada &&
                    this.casillaSeleccionada.fila === filaVisual &&
                    this.casillaSeleccionada.col === colVisual) {
                    casillaHTML.classList.add("selected");
                }

                // Resaltar movimientos válidos como pistas
                const esPista = this.movimientosValidos.some(m => m.fila === filaVisual && m.col === colVisual);
                if (esPista) {
                    casillaHTML.classList.add("hint");
                }

                casillaHTML.addEventListener("click", (e) => this.manejarClicCasilla(e));
                this.contenedorTablero.appendChild(casillaHTML);
            }
        }
    },

    manejarClicCasilla(evento) {
        // Bloquear clics si el bot está pensando
        if (this.botPensando) return;

        const fila = parseInt(evento.currentTarget.dataset.fila);
        const col  = parseInt(evento.currentTarget.dataset.col);
        const pieza = Logic.tablero[fila][col];

        // CASO 1: Nada seleccionado → intentar seleccionar una pieza del jugador
        if (this.casillaSeleccionada === null) {
            // Solo puede seleccionar piezas de su color
            if (pieza && pieza.color === Logic.turnoActual &&
                (ConfigJuego.modo === 'pvp' || pieza.color === ConfigJuego.colorJugador)) {

                this.casillaSeleccionada = { fila, col };
                this.movimientosValidos = Logic.obtenerMovimientosPosibles(fila, col);
                this.dibujarTablero();
            }
            return;
        }

        // CASO 2: Hay pieza seleccionada
        const origen = this.casillaSeleccionada;

        // Sub-caso: clic en la misma casilla → deseleccionar
        if (origen.fila === fila && origen.col === col) {
            this.casillaSeleccionada = null;
            this.movimientosValidos = [];
            this.dibujarTablero();
            return;
        }

        // Sub-caso: clic en otra pieza del mismo color → cambiar selección
        if (pieza && pieza.color === Logic.turnoActual &&
            (ConfigJuego.modo === 'pvp' || pieza.color === ConfigJuego.colorJugador)) {
            this.casillaSeleccionada = { fila, col };
            this.movimientosValidos = Logic.obtenerMovimientosPosibles(fila, col);
            this.dibujarTablero();
            return;
        }

        // Sub-caso: clic en un movimiento válido → ejecutar
        const esMovimientoValido = this.movimientosValidos.some(m => m.fila === fila && m.col === col);
        if (!esMovimientoValido) {
            // Clic inválido → deseleccionar
            this.casillaSeleccionada = null;
            this.movimientosValidos = [];
            this.dibujarTablero();
            return;
        }

        // Ejecutar movimiento del jugador
        Logic.ejecutarMovimiento(origen.fila, origen.col, fila, col);
        this.casillaSeleccionada = null;
        this.movimientosValidos = [];
        this.dibujarTablero();
        this.actualizarTurno();

        // Si es modo bot, activar el turno del bot
        if (ConfigJuego.modo === 'bot') {
            this.ejecutarTurnoBotConDelay();
        }
    },

    ejecutarTurnoBotConDelay() {
        this.botPensando = true;
        this.mostrarIndicadorBot(true);

        // Pequeño delay para que se vea el movimiento del jugador antes de que el bot responda
        setTimeout(() => {
            const movBot = Bot.elegirMovimiento();
            if (movBot) {
                Logic.ejecutarMovimiento(movBot.desdeFila, movBot.desdeCol, movBot.hastaFila, movBot.hastaCol);
                this.dibujarTablero();
                this.actualizarTurno();
            }
            this.botPensando = false;
            this.mostrarIndicadorBot(false);
        }, 400);
    },

    mostrarIndicadorBot(pensando) {
        const statusBox = document.querySelector(".status-box");
        if (!statusBox) return;
        if (pensando) {
            statusBox.style.borderLeft = "3px solid #ff4757";
        } else {
            statusBox.style.borderLeft = "";
        }
    },

    actualizarTurno() {
        const spanTurno = document.getElementById("current-turn");
        if (!spanTurno) return;

        if (ConfigJuego.modo === 'bot' && Logic.turnoActual !== ConfigJuego.colorJugador) {
            spanTurno.textContent = "Bot pensando...";
        } else {
            spanTurno.textContent = Logic.turnoActual === "white" ? "Blancas" : "Negras";
        }
    }
};
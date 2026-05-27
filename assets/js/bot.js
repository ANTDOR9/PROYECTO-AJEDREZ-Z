// ==========================================
// MÓDULO BOT: ALGORITMOS DE IA PARA EL RIVAL
// ==========================================

const Bot = {

    // Tabla de valores de piezas para evaluación
    valorPieza: { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 },

    // Punto de entrada: elige el movimiento según la dificultad configurada
    elegirMovimiento() {
        const color = ConfigJuego.colorJugador === 'white' ? 'black' : 'white';
        const movimientos = Logic.todosLosMovimientos(color);
        if (movimientos.length === 0) return null;

        if (ConfigJuego.dificultadBot === 'easy') {
            return this.moverAleatorio(movimientos);
        } else if (ConfigJuego.dificultadBot === 'medium') {
            return this.moverCodicioso(movimientos, color);
        } else {
            return this.moverMinimax(color);
        }
    },

    // NIVEL FÁCIL: movimiento completamente aleatorio
    moverAleatorio(movimientos) {
        return movimientos[Math.floor(Math.random() * movimientos.length)];
    },

    // NIVEL NORMAL: elige el movimiento que capture la pieza de mayor valor
    moverCodicioso(movimientos, color) {
        let mejorMovimiento = movimientos[0];
        let mejorValor = -Infinity;

        for (const mov of movimientos) {
            const pieza = Logic.tablero[mov.hastaFila][mov.hastaCol];
            const valor = pieza ? (this.valorPieza[pieza.tipo] || 0) : 0;
            if (valor > mejorValor) {
                mejorValor = valor;
                mejorMovimiento = mov;
            }
        }

        // Si no hay capturas, mueve aleatorio
        return mejorValor === 0 ? this.moverAleatorio(movimientos) : mejorMovimiento;
    },

    // NIVEL DIFÍCIL: Minimax con profundidad 3
    moverMinimax(color) {
        const rival = color === 'white' ? 'black' : 'white';
        let mejorMovimiento = null;
        let mejorValor = -Infinity;

        const movimientos = Logic.todosLosMovimientos(color);
        for (const mov of movimientos) {
            // Simulamos el movimiento
            const tableroOriginal = JSON.parse(JSON.stringify(Logic.tablero));
            Logic.tablero[mov.hastaFila][mov.hastaCol] = Logic.tablero[mov.desdeFila][mov.desdeCol];
            Logic.tablero[mov.desdeFila][mov.desdeCol] = null;

            // Evaluamos en profundidad
            const valor = this.minimax(3, false, color, rival, -Infinity, Infinity);

            // Restauramos el tablero
            Logic.tablero = tableroOriginal;

            if (valor > mejorValor) {
                mejorValor = valor;
                mejorMovimiento = mov;
            }
        }
        return mejorMovimiento;
    },

    minimax(profundidad, esMaximizador, colorBot, colorRival, alpha, beta) {
        if (profundidad === 0) return this.evaluarTablero(colorBot, colorRival);

        const colorActual = esMaximizador ? colorBot : colorRival;
        const movimientos = Logic.todosLosMovimientos(colorActual);

        if (movimientos.length === 0) return this.evaluarTablero(colorBot, colorRival);

        let mejorValor = esMaximizador ? -Infinity : Infinity;

        for (const mov of movimientos) {
            const tableroOriginal = JSON.parse(JSON.stringify(Logic.tablero));
            Logic.tablero[mov.hastaFila][mov.hastaCol] = Logic.tablero[mov.desdeFila][mov.desdeCol];
            Logic.tablero[mov.desdeFila][mov.desdeCol] = null;

            const valor = this.minimax(profundidad - 1, !esMaximizador, colorBot, colorRival, alpha, beta);

            Logic.tablero = tableroOriginal;

            if (esMaximizador) {
                mejorValor = Math.max(mejorValor, valor);
                alpha = Math.max(alpha, valor);
            } else {
                mejorValor = Math.min(mejorValor, valor);
                beta = Math.min(beta, valor);
            }

            if (beta <= alpha) break; // Poda alfa-beta
        }

        return mejorValor;
    },

    // Evalúa el tablero desde la perspectiva del bot
    evaluarTablero(colorBot, colorRival) {
        let puntuacion = 0;
        for (let f = 0; f < 8; f++) {
            for (let c = 0; c < 8; c++) {
                const pieza = Logic.tablero[f][c];
                if (!pieza) continue;
                const valor = this.valorPieza[pieza.tipo] || 0;
                if (pieza.color === colorBot) {
                    puntuacion += valor;
                } else {
                    puntuacion -= valor;
                }
            }
        }
        return puntuacion;
    }
};
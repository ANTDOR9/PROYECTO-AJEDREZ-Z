// ==========================================
// MÓDULO LOGIC: EL CEREBRO DEL AJEDREZ
// ==========================================

const Logic = {
    turnoActual: "white",
    historialEstados: [],
    tablero: [],

    // CORRECCIÓN: cada color tiene sus propios símbolos Unicode únicos
    piezasUnicode: {
        white: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
        black: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
    },

    inicializarTablero() {
        this.turnoActual = "white";
        this.historialEstados = [];

        const filaPiezas = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        this.tablero = [];

        for (let fila = 0; fila < 8; fila++) {
            this.tablero[fila] = [];
            for (let col = 0; col < 8; col++) {
                if (fila === 0) {
                    this.tablero[fila][col] = { tipo: filaPiezas[col], color: 'black' };
                } else if (fila === 1) {
                    this.tablero[fila][col] = { tipo: 'p', color: 'black' };
                } else if (fila === 6) {
                    this.tablero[fila][col] = { tipo: 'p', color: 'white' };
                } else if (fila === 7) {
                    this.tablero[fila][col] = { tipo: filaPiezas[col], color: 'white' };
                } else {
                    this.tablero[fila][col] = null;
                }
            }
        }
        this.guardarEstado();
    },

    guardarEstado() {
        const copiaTablero = JSON.parse(JSON.stringify(this.tablero));
        this.historialEstados.push({
            tablero: copiaTablero,
            turno: this.turnoActual
        });
    },

    deshacerMovimiento() {
        // En modo bot, deshacemos 2 movimientos (el del bot también)
        const pasos = (ConfigJuego.modo === 'bot') ? 2 : 1;
        const minEstados = 1;

        if (this.historialEstados.length > minEstados) {
            const retrocesos = Math.min(pasos, this.historialEstados.length - minEstados);
            for (let i = 0; i < retrocesos; i++) {
                this.historialEstados.pop();
            }
            const estadoAnterior = this.historialEstados[this.historialEstados.length - 1];
            this.tablero = JSON.parse(JSON.stringify(estadoAnterior.tablero));
            this.turnoActual = estadoAnterior.turno;
            return true;
        }
        return false;
    },

    cambiarTurno() {
        this.turnoActual = (this.turnoActual === "white") ? "black" : "white";
    },

    ejecutarMovimiento(desdeFila, desdeCol, hastaFila, hastaCol) {
        const pieza = this.tablero[desdeFila][desdeCol];
        this.tablero[hastaFila][hastaCol] = pieza;
        this.tablero[desdeFila][desdeCol] = null;
        this.cambiarTurno();
        this.guardarEstado();
    },

    // Devuelve todos los movimientos válidos de una pieza (sin validación de jaque por ahora)
    obtenerMovimientosPosibles(fila, col) {
        const pieza = this.tablero[fila][col];
        if (!pieza) return [];

        const movimientos = [];
        const { tipo, color } = pieza;
        const rival = color === 'white' ? 'black' : 'white';

        const agregarSiValido = (f, c) => {
            if (f < 0 || f > 7 || c < 0 || c > 7) return false;
            const destino = this.tablero[f][c];
            if (destino && destino.color === color) return false;
            movimientos.push({ fila: f, col: c });
            return !destino; // retorna true si podemos seguir en esa dirección (casilla vacía)
        };

        const deslizar = (direcciones) => {
            for (const [df, dc] of direcciones) {
                let f = fila + df, c = col + dc;
                while (agregarSiValido(f, c)) { f += df; c += dc; }
            }
        };

        if (tipo === 'p') {
            const dir = color === 'white' ? -1 : 1;
            const filaInicio = color === 'white' ? 6 : 1;
            // Avance simple
            if (fila + dir >= 0 && fila + dir <= 7 && !this.tablero[fila + dir][col]) {
                movimientos.push({ fila: fila + dir, col });
                // Avance doble desde posición inicial
                if (fila === filaInicio && !this.tablero[fila + 2 * dir][col]) {
                    movimientos.push({ fila: fila + 2 * dir, col });
                }
            }
            // Capturas en diagonal
            for (const dc of [-1, 1]) {
                const f = fila + dir, c = col + dc;
                if (f >= 0 && f <= 7 && c >= 0 && c <= 7 && this.tablero[f][c]?.color === rival) {
                    movimientos.push({ fila: f, col: c });
                }
            }
        } else if (tipo === 'r') {
            deslizar([[1,0],[-1,0],[0,1],[0,-1]]);
        } else if (tipo === 'b') {
            deslizar([[1,1],[1,-1],[-1,1],[-1,-1]]);
        } else if (tipo === 'q') {
            deslizar([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
        } else if (tipo === 'n') {
            for (const [df, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
                agregarSiValido(fila + df, col + dc);
            }
        } else if (tipo === 'k') {
            for (const [df, dc] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
                agregarSiValido(fila + df, col + dc);
            }
        }

        return movimientos;
    },

    // Devuelve todos los movimientos posibles de un color completo
    todosLosMovimientos(color) {
        const resultado = [];
        for (let f = 0; f < 8; f++) {
            for (let c = 0; c < 8; c++) {
                if (this.tablero[f][c]?.color === color) {
                    const movs = this.obtenerMovimientosPosibles(f, c);
                    for (const mov of movs) {
                        resultado.push({ desdeFila: f, desdeCol: c, hastaFila: mov.fila, hastaCol: mov.col });
                    }
                }
            }
        }
        return resultado;
    }
};
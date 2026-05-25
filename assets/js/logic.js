// ==========================================
// MÓDULO LOGIC: EL CEREBRO DEL AJEDREZ
// ==========================================

const Logic = {
    turnoActual: "white", 
    historialEstados: [], 
    tablero: [],          

    piezasUnicode: {
        white: { p: '♙', r: '♖', n: '♞', b: '♝', q: '♛', k: '♚' },
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
        if (this.historialEstados.length > 1) {
            this.historialEstados.pop(); 
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
    }
};
// ==========================================
// MÓDULO LOGIC: EL CEREBRO DEL AJEDREZ
// ==========================================

const Logic = {
    turnoActual: "white", // Siempre empiezan las blancas
    historialEstados: [], // Aquí guardaremos los clones del tablero para el "Undo"
    tablero: [],          // Matriz de 8x8

    // Diccionario de piezas Unicode para usarlas más adelante en la interfaz
    piezasUnicode: {
        white: { p: '♙', r: '♖', n: '♞', b: '♝', q: '♛', k: '♚' },
        black: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
    },

    // 1. Inicializa un tablero nuevo con la posición estándar de ajedrez
    inicializarTablero() {
        this.turnoActual = "white";
        this.historialEstados = [];
        
        // Estructura de la fila de piezas mayores
        const filaPiezas = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

        this.tablero = [];

        for (let fila = 0; fila < 8; fila++) {
            this.tablero[fila] = [];
            for (let col = 0; col < 8; col++) {
                if (fila === 0) {
                    // Piezas mayores negras
                    this.tablero[fila][col] = { tipo: filaPiezas[col], color: 'black' };
                } else if (fila === 1) {
                    // Peones negros
                    this.tablero[fila][col] = { tipo: 'p', color: 'black' };
                } else if (fila === 6) {
                    // Peones blancos
                    this.tablero[fila][col] = { tipo: 'p', color: 'white' };
                } else if (fila === 7) {
                    // Piezas mayores blancas
                    this.tablero[fila][col] = { tipo: filaPiezas[col], color: 'white' };
                } else {
                    // Casilla vacía
                    this.tablero[fila][col] = null;
                }
            }
        }
        
        // Guardamos el estado inicial en el historial
        this.guardarEstado();
    },

    // 2. Guarda una copia profunda (clon) del tablero actual
    guardarEstado() {
        // Usamos JSON para clonar la matriz sin arrastrar referencias en memoria
        const copiaTablero = JSON.parse(JSON.stringify(this.tablero));
        this.historialEstados.push({
            tablero: copiaTablero,
            turno: this.turnoActual
        });
    },

    // 3. Función estrella: Deshacer último movimiento
    deshacerMovimiento() {
        // Necesitamos al menos 2 estados para regresar (el inicial y el actual)
        if (this.historialEstados.length > 1) {
            this.historialEstados.pop(); // Eliminamos el estado actual
            const estadoAnterior = this.historialEstados[this.historialEstados.length - 1];
            
            // Restauramos los datos
            this.tablero = JSON.parse(JSON.stringify(estadoAnterior.tablero));
            this.turnoActual = estadoAnterior.turno;
            return true;
        }
        return false; // No hay movimientos que deshacer
    },

    // 4. Cambiar el turno de juego
    cambiarTurno() {
        this.turnoActual = (this.turnoActual === "white") ? "black" : "white";
    },

    // 5. Mover una pieza de una coordenada a otra (Sin validar reglas aún)
    ejecutarMovimiento(desdeFila, desdeCol, hastaFila, hastaCol) {
        const pieza = this.tablero[desdeFila][desdeCol];
        
        // Movemos la pieza a su destino y vaciamos el origen
        this.tablero[hastaFila][hastaCol] = pieza;
        this.tablero[desdeFila][desdeCol] = null;

        this.cambiarTurno();
        this.guardarEstado(); // Guardamos el nuevo estado en el historial
    }
};
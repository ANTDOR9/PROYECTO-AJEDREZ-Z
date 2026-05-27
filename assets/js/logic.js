// ==========================================
// MÓDULO LOGIC — Reglas completas de ajedrez
// ==========================================

const Logic = {
    turnoActual: 'white',
    historialEstados: [],
    tablero: [],
    partidaTerminada: false,
    ganador: null,
    pendientePromocion: null, // { fila, col } cuando hay peón a promover

    piezasUnicode: {
        white: { p:'♙', r:'♖', n:'♘', b:'♗', q:'♕', k:'♔' },
        black: { p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚' }
    },

    inicializarTablero() {
        this.turnoActual = 'white';
        this.historialEstados = [];
        this.partidaTerminada = false;
        this.ganador = null;
        this.pendientePromocion = null;

        const fila0 = ['r','n','b','q','k','b','n','r'];
        this.tablero = Array.from({ length: 8 }, (_, f) =>
            Array.from({ length: 8 }, (__, c) => {
                if (f === 0) return { tipo: fila0[c], color: 'black', movido: false };
                if (f === 1) return { tipo: 'p', color: 'black', movido: false };
                if (f === 6) return { tipo: 'p', color: 'white', movido: false };
                if (f === 7) return { tipo: fila0[c], color: 'white', movido: false };
                return null;
            })
        );
        this.guardarEstado();
    },

    guardarEstado() {
        this.historialEstados.push({
            tablero: JSON.parse(JSON.stringify(this.tablero)),
            turno:   this.turnoActual
        });
    },

    deshacerMovimiento() {
        const pasos = ConfigJuego.modo === 'bot' ? 2 : 1;
        const min   = 1;
        if (this.historialEstados.length <= min) return false;

        const retrocesos = Math.min(pasos, this.historialEstados.length - min);
        for (let i = 0; i < retrocesos; i++) this.historialEstados.pop();

        const prev = this.historialEstados[this.historialEstados.length - 1];
        this.tablero  = JSON.parse(JSON.stringify(prev.tablero));
        this.turnoActual = prev.turno;
        this.partidaTerminada = false;
        this.ganador = null;
        this.pendientePromocion = null;
        return true;
    },

    cambiarTurno() {
        this.turnoActual = this.turnoActual === 'white' ? 'black' : 'white';
    },

    ejecutarMovimiento(df, dc, hf, hc) {
        const pieza = this.tablero[df][dc];
        this.tablero[hf][hc] = { ...pieza, movido: true };
        this.tablero[df][dc] = null;
        this.cambiarTurno();

        // ── Verificar captura de rey (fin de partida) ──
        let reyEncontrado = { white: false, black: false };
        for (let f = 0; f < 8; f++)
            for (let c = 0; c < 8; c++) {
                const p = this.tablero[f][c];
                if (p?.tipo === 'k') reyEncontrado[p.color] = true;
            }

        if (!reyEncontrado.white) { this.partidaTerminada = true; this.ganador = 'black'; }
        if (!reyEncontrado.black) { this.partidaTerminada = true; this.ganador = 'white'; }

        // ── Verificar promoción de peón ──
        if (!this.partidaTerminada) {
            const pMovida = this.tablero[hf][hc];
            if (pMovida?.tipo === 'p') {
                if ((pMovida.color === 'white' && hf === 0) ||
                    (pMovida.color === 'black' && hf === 7)) {
                    this.pendientePromocion = { fila: hf, col: hc };
                    // No guardamos estado ni continuamos hasta que se elija pieza
                    return;
                }
            }
        }

        this.guardarEstado();
    },

    // Ejecuta la promoción con la pieza elegida
    promocionar(tipo) {
        if (!this.pendientePromocion) return;
        const { fila, col } = this.pendientePromocion;
        this.tablero[fila][col].tipo = tipo;
        this.pendientePromocion = null;
        this.guardarEstado();
    },

    // ── Movimientos posibles ──────────────────────────────────
    obtenerMovimientosPosibles(fila, col) {
        const pieza = this.tablero[fila][col];
        if (!pieza) return [];
        const movs = [];
        const rival = pieza.color === 'white' ? 'black' : 'white';

        const ok = (f, c) => {
            if (f < 0 || f > 7 || c < 0 || c > 7) return false;
            const d = this.tablero[f][c];
            if (d?.color === pieza.color) return false;
            movs.push({ fila: f, col: c });
            return !d;
        };

        const deslizar = (dirs) => {
            for (const [df, dc] of dirs) {
                let f = fila + df, c = col + dc;
                while (ok(f, c)) { f += df; c += dc; }
            }
        };

        const { tipo, color } = pieza;

        if (tipo === 'p') {
            const dir = color === 'white' ? -1 : 1;
            const inicio = color === 'white' ? 6 : 1;
            // Avance simple
            if (fila+dir >= 0 && fila+dir <= 7 && !this.tablero[fila+dir][col]) {
                movs.push({ fila: fila+dir, col });
                // Avance doble desde inicio
                if (fila === inicio && !this.tablero[fila+2*dir][col])
                    movs.push({ fila: fila+2*dir, col });
            }
            // Capturas diagonales
            for (const dc of [-1,1]) {
                const f = fila+dir, c = col+dc;
                if (f>=0&&f<=7&&c>=0&&c<=7&&this.tablero[f][c]?.color===rival)
                    movs.push({ fila:f, col:c });
            }
        }
        else if (tipo === 'r') deslizar([[1,0],[-1,0],[0,1],[0,-1]]);
        else if (tipo === 'b') deslizar([[1,1],[1,-1],[-1,1],[-1,-1]]);
        else if (tipo === 'q') deslizar([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
        else if (tipo === 'n') {
            for (const [df,dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]])
                ok(fila+df, col+dc);
        }
        else if (tipo === 'k') {
            for (const [df,dc] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])
                ok(fila+df, col+dc);
        }

        return movs;
    },

    todosLosMovimientos(color) {
        const res = [];
        for (let f = 0; f < 8; f++)
            for (let c = 0; c < 8; c++)
                if (this.tablero[f][c]?.color === color)
                    for (const m of this.obtenerMovimientosPosibles(f, c))
                        res.push({ desdeFila:f, desdeCol:c, hastaFila:m.fila, hastaCol:m.col });
        return res;
    }
};
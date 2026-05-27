// ==========================================================
// MÓDULO UI — Chinese Dark Peach Edition
// Imágenes reales + partículas de pétalos + animaciones
// ==========================================================

const BASE_IMG = 'assets/images/pieces/';

// Mapa pieza → archivo PNG
const IMG = {
    white: { k:'w_king', q:'w_queen', r:'w_rook', b:'w_bishop', n:'w_knight', p:'w_pawn' },
    black: { k:'b_king', q:'b_queen', r:'b_rook', b:'b_bishop', n:'b_knight', p:'b_pawn' }
};

// Fallback unicode si la imagen no carga
const UNICODE = {
    white: { p:'♙', r:'♖', n:'♘', b:'♗', q:'♕', k:'♔' },
    black: { p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚' }
};

const UI = {
    contenedorTablero: null,
    casillaSeleccionada: null,
    movimientosValidos: [],
    botPensando: false,

    inicializar() {
        this.contenedorTablero = document.getElementById('chess-board');
        this.casillaSeleccionada = null;
        this.movimientosValidos = [];
        this.botPensando = false;
        Logic.inicializarTablero();
        this.dibujarTablero();
        this.actualizarTurno();

        if (ConfigJuego.modo === 'bot' && ConfigJuego.colorJugador === 'black') {
            this.ejecutarTurnoBotConDelay();
        }
    },

    // ── DIBUJO ────────────────────────────────────────────────
    dibujarTablero() {
        this.contenedorTablero.innerHTML = '';
        const invertido = ConfigJuego.colorJugador === 'black';

        for (let fi = 0; fi < 8; fi++) {
            for (let ci = 0; ci < 8; ci++) {
                const fv = invertido ? 7 - fi : fi;
                const cv = invertido ? 7 - ci : ci;

                const sq = document.createElement('div');
                sq.classList.add('square');
                sq.classList.add((fv + cv) % 2 === 0 ? 'light' : 'dark');
                sq.dataset.fila = fv;
                sq.dataset.col  = cv;

                const pieza = Logic.tablero[fv][cv];
                if (pieza) {
                    const img = this._crearImgPieza(pieza);
                    sq.appendChild(img);
                }

                // Seleccionada
                if (this.casillaSeleccionada &&
                    this.casillaSeleccionada.fila === fv &&
                    this.casillaSeleccionada.col  === cv) {
                    sq.classList.add('selected');
                }

                // Hint: vacía u ocupada por rival
                const esHint = this.movimientosValidos.some(m => m.fila === fv && m.col === cv);
                if (esHint) {
                    sq.classList.add('hint');
                    if (pieza) sq.classList.add('ocupada'); // pieza rival → borde en lugar de punto
                }

                sq.addEventListener('click', e => this.manejarClicCasilla(e));
                this.contenedorTablero.appendChild(sq);
            }
        }
    },

    _crearImgPieza(pieza) {
        const img = document.createElement('img');
        const archivo = IMG[pieza.color]?.[pieza.tipo];
        if (archivo) {
            img.src = `${BASE_IMG}${archivo}.png`;
            img.alt = `${pieza.color} ${pieza.tipo}`;
            img.onerror = () => {
                // Fallback unicode si la imagen no existe
                img.replaceWith(this._spanUnicode(pieza));
            };
        } else {
            return this._spanUnicode(pieza);
        }
        return img;
    },

    _spanUnicode(pieza) {
        const span = document.createElement('span');
        span.textContent = UNICODE[pieza.color]?.[pieza.tipo] || '?';
        span.style.cssText = `font-size:clamp(28px,6vw,48px);line-height:1;color:${pieza.color==='white'?'#f0dde5':'#1a0c12'};text-shadow:0 2px 8px rgba(0,0,0,0.8)`;
        return span;
    },

    // ── CLIC ──────────────────────────────────────────────────
    manejarClicCasilla(evento) {
        if (this.botPensando) return;

        const fila  = parseInt(evento.currentTarget.dataset.fila);
        const col   = parseInt(evento.currentTarget.dataset.col);
        const pieza = Logic.tablero[fila][col];

        // Sin selección previa → seleccionar si es del jugador activo
        if (this.casillaSeleccionada === null) {
            if (pieza && pieza.color === Logic.turnoActual &&
                (ConfigJuego.modo === 'pvp' || pieza.color === ConfigJuego.colorJugador)) {
                this.casillaSeleccionada = { fila, col };
                this.movimientosValidos  = Logic.obtenerMovimientosPosibles(fila, col);
                this.dibujarTablero();
            }
            return;
        }

        const origen = this.casillaSeleccionada;

        // Misma casilla → deseleccionar
        if (origen.fila === fila && origen.col === col) {
            this.casillaSeleccionada = null;
            this.movimientosValidos  = [];
            this.dibujarTablero();
            return;
        }

        // Otra pieza propia → cambiar selección
        if (pieza && pieza.color === Logic.turnoActual &&
            (ConfigJuego.modo === 'pvp' || pieza.color === ConfigJuego.colorJugador)) {
            this.casillaSeleccionada = { fila, col };
            this.movimientosValidos  = Logic.obtenerMovimientosPosibles(fila, col);
            this.dibujarTablero();
            return;
        }

        // Movimiento válido → ejecutar
        const esValido = this.movimientosValidos.some(m => m.fila === fila && m.col === col);
        if (!esValido) {
            this.casillaSeleccionada = null;
            this.movimientosValidos  = [];
            this.dibujarTablero();
            return;
        }

        // Obtener posición en pantalla ANTES de mover (para partículas)
        const sqDestino = this.contenedorTablero.querySelector(
            `[data-fila='${fila}'][data-col='${col}']`
        );
        const rect = sqDestino ? sqDestino.getBoundingClientRect() : null;

        Logic.ejecutarMovimiento(origen.fila, origen.col, fila, col);
        this.casillaSeleccionada = null;
        this.movimientosValidos  = [];
        this.dibujarTablero();
        this.actualizarTurno();

        // Animación de aterrizaje + partículas
        if (rect) {
            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            this._lanzarParticulas(cx, cy);
            this._animarLanding(fila, col);
        }

        if (ConfigJuego.modo === 'bot') this.ejecutarTurnoBotConDelay();
    },

    // ── BOT ───────────────────────────────────────────────────
    ejecutarTurnoBotConDelay() {
        this.botPensando = true;
        this.actualizarTurno();
        setTimeout(() => {
            const mov = Bot.elegirMovimiento();
            if (mov) {
                const sqD = this.contenedorTablero.querySelector(
                    `[data-fila='${mov.hastaFila}'][data-col='${mov.hastaCol}']`
                );
                const rect = sqD ? sqD.getBoundingClientRect() : null;

                Logic.ejecutarMovimiento(mov.desdeFila, mov.desdeCol, mov.hastaFila, mov.hastaCol);
                this.dibujarTablero();
                this.actualizarTurno();

                if (rect) {
                    const cx = rect.left + rect.width  / 2;
                    const cy = rect.top  + rect.height / 2;
                    this._lanzarParticulas(cx, cy, true);
                    this._animarLanding(mov.hastaFila, mov.hastaCol);
                }
            }
            this.botPensando = false;
        }, 500);
    },

    // ── ANIMACIONES ───────────────────────────────────────────
    _animarLanding(fila, col) {
        requestAnimationFrame(() => {
            const sq = this.contenedorTablero.querySelector(
                `[data-fila='${fila}'][data-col='${col}']`
            );
            if (!sq) return;
            sq.classList.add('piece-landing');
            sq.addEventListener('animationend', () => sq.classList.remove('piece-landing'), { once: true });
        });
    },

    _lanzarParticulas(cx, cy, esBot = false) {
        const total = 18;
        for (let i = 0; i < total; i++) {
            const el = document.createElement('div');
            el.classList.add('particle');

            // Mezcla: pétalos rosas (60%) + partículas oscuras brillantes (40%)
            const esPetalo = Math.random() < 0.6;
            const angulo   = (Math.PI * 2 * i) / total + (Math.random() - 0.5) * 0.5;
            const dist     = 40 + Math.random() * 80;
            const tx       = Math.cos(angulo) * dist;
            const ty       = Math.sin(angulo) * dist + 30; // gravedad sutil
            const rot      = (Math.random() * 720 - 360) + 'deg';
            const dur      = 0.6 + Math.random() * 0.5;

            if (esPetalo) {
                // Pétalo: pequeño div ovalado rosado
                const size = 6 + Math.random() * 8;
                const rosa = esBot
                    ? `hsl(${200 + Math.random()*40},60%,65%)`   // azulado para el bot
                    : `hsl(${330 + Math.random()*30},${70+Math.random()*20}%,${65+Math.random()*15}%)`;
                el.style.cssText = `
                    width:${size}px; height:${size * 0.55}px;
                    background:${rosa}; border-radius:50%;
                    left:${cx}px; top:${cy}px;
                    --tx:translate(${tx}px,${ty}px); --rot:${rot};
                    animation-duration:${dur}s;
                    box-shadow: 0 0 4px ${rosa};
                `;
            } else {
                // Partícula oscura brillante: punto pequeño con glow
                const size = 3 + Math.random() * 4;
                const color = `hsl(${20 + Math.random()*30},80%,55%)`; // dorado/ámbar
                el.style.cssText = `
                    width:${size}px; height:${size}px;
                    background:${color}; border-radius:50%;
                    left:${cx}px; top:${cy}px;
                    --tx:translate(${tx * 1.3}px,${ty * 0.7}px); --rot:${rot};
                    animation-duration:${dur * 0.75}s;
                    box-shadow: 0 0 6px 2px ${color};
                `;
            }

            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove(), { once: true });
        }
    },

    // ── UI GENERAL ────────────────────────────────────────────
    actualizarTurno() {
        const span = document.getElementById('current-turn');
        if (!span) return;
        if (ConfigJuego.modo === 'bot' && Logic.turnoActual !== ConfigJuego.colorJugador) {
            span.textContent = '✦ Bot...';
        } else {
            span.textContent = Logic.turnoActual === 'white' ? '⬜ Blancas' : '⬛ Negras';
        }
    }
};
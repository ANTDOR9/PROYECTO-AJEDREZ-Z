// ==========================================================
// MÓDULO UI — Chinese Dark Peach
// Imágenes PNG + tile_light/dark + partículas + promoción
// ==========================================================

const BASE_PIECES = 'assets/images/pieces/';
const BASE_BOARD  = 'assets/images/board/';

const IMG_MAP = {
    white: { k:'w_king',q:'w_queen',r:'w_rook',b:'w_bishop',n:'w_knight',p:'w_pawn' },
    black: { k:'b_king',q:'b_queen',r:'b_rook',b:'b_bishop',n:'b_knight',p:'b_pawn' }
};
const UNICODE_FB = {
    white:{p:'♙',r:'♖',n:'♘',b:'♗',q:'♕',k:'♔'},
    black:{p:'♟',r:'♜',n:'♞',b:'♝',q:'♛',k:'♚'}
};

// Precargamos las tile images para usarlas como background de casilla
const TILE_LIGHT = new Image(); TILE_LIGHT.src = BASE_BOARD + 'tile_light.png';
const TILE_DARK  = new Image(); TILE_DARK.src  = BASE_BOARD + 'tile_dark.png';
let tileLoaded = { light: false, dark: false };
TILE_LIGHT.onload = () => { tileLoaded.light = true; };
TILE_DARK.onload  = () => { tileLoaded.dark  = true; };

const UI = {
    contenedorTablero: null,
    casillaSeleccionada: null,
    movimientosValidos: [],
    botPensando: false,

    inicializar() {
        this.contenedorTablero = document.getElementById('chess-board');
        this.casillaSeleccionada = null;
        this.movimientosValidos  = [];
        this.botPensando = false;
        Logic.inicializarTablero();
        this.dibujarTablero();
        this.actualizarTurno();
        if (ConfigJuego.modo === 'bot' && ConfigJuego.colorJugador === 'black')
            this.ejecutarTurnoBotConDelay();
    },

    // ── DIBUJADO ──────────────────────────────────────────────
    dibujarTablero() {
        this.contenedorTablero.innerHTML = '';
        const inv = ConfigJuego.colorJugador === 'black';

        for (let fi = 0; fi < 8; fi++) {
            for (let ci = 0; ci < 8; ci++) {
                const fv = inv ? 7-fi : fi;
                const cv = inv ? 7-ci : ci;
                const esClara = (fv+cv) % 2 === 0;

                const sq = document.createElement('div');
                sq.classList.add('square', esClara ? 'light' : 'dark');
                sq.dataset.fila = fv;
                sq.dataset.col  = cv;

                // Fondo tile como background-image de la casilla
                const tileUrl = esClara
                    ? BASE_BOARD + 'tile_light.png'
                    : BASE_BOARD + 'tile_dark.png';
                sq.style.backgroundImage  = `url('${tileUrl}')`;
                sq.style.backgroundSize   = 'cover';
                sq.style.backgroundPosition = 'center';

                const pieza = Logic.tablero[fv][cv];
                if (pieza) sq.appendChild(this._crearImgPieza(pieza));

                if (this.casillaSeleccionada?.fila===fv && this.casillaSeleccionada?.col===cv)
                    sq.classList.add('selected');

                const esHint = this.movimientosValidos.some(m=>m.fila===fv&&m.col===cv);
                if (esHint) {
                    sq.classList.add('hint');
                    if (pieza) sq.classList.add('ocupada');
                }

                sq.addEventListener('click', e => this.manejarClicCasilla(e));
                this.contenedorTablero.appendChild(sq);
            }
        }
    },

    _crearImgPieza(pieza) {
        const img = document.createElement('img');
        const archivo = IMG_MAP[pieza.color]?.[pieza.tipo];
        if (archivo) {
            img.src = `${BASE_PIECES}${archivo}.png`;
            img.alt = `${pieza.color} ${pieza.tipo}`;
            img.onerror = () => img.replaceWith(this._spanUnicode(pieza));
        } else {
            return this._spanUnicode(pieza);
        }
        return img;
    },

    _spanUnicode(pieza) {
        const s = document.createElement('span');
        s.textContent = UNICODE_FB[pieza.color]?.[pieza.tipo] || '?';
        s.style.cssText = `font-size:clamp(26px,5.5vw,46px);line-height:1;
            color:${pieza.color==='white'?'#f0dde5':'#1a0c12'};
            text-shadow:0 2px 8px rgba(0,0,0,0.9);`;
        return s;
    },

    // ── CLIC ──────────────────────────────────────────────────
    manejarClicCasilla(e) {
        if (this.botPensando || Logic.partidaTerminada || Logic.pendientePromocion) return;

        const fila  = parseInt(e.currentTarget.dataset.fila);
        const col   = parseInt(e.currentTarget.dataset.col);
        const pieza = Logic.tablero[fila][col];

        if (!this.casillaSeleccionada) {
            if (pieza && pieza.color === Logic.turnoActual &&
                (ConfigJuego.modo==='pvp' || pieza.color===ConfigJuego.colorJugador)) {
                this.casillaSeleccionada = { fila, col };
                this.movimientosValidos  = Logic.obtenerMovimientosPosibles(fila, col);
                this.dibujarTablero();
            }
            return;
        }

        const origen = this.casillaSeleccionada;

        if (origen.fila===fila && origen.col===col) {
            this.casillaSeleccionada = null; this.movimientosValidos=[];
            this.dibujarTablero(); return;
        }
        if (pieza && pieza.color===Logic.turnoActual &&
            (ConfigJuego.modo==='pvp'||pieza.color===ConfigJuego.colorJugador)) {
            this.casillaSeleccionada={fila,col};
            this.movimientosValidos=Logic.obtenerMovimientosPosibles(fila,col);
            this.dibujarTablero(); return;
        }

        const esValido = this.movimientosValidos.some(m=>m.fila===fila&&m.col===col);
        if (!esValido) {
            this.casillaSeleccionada=null; this.movimientosValidos=[];
            this.dibujarTablero(); return;
        }

        // Posición pantalla para partículas
        const sqDest = this.contenedorTablero.querySelector(`[data-fila='${fila}'][data-col='${col}']`);
        const rect = sqDest?.getBoundingClientRect();

        Logic.ejecutarMovimiento(origen.fila, origen.col, fila, col);
        this.casillaSeleccionada=null; this.movimientosValidos=[];
        this.dibujarTablero();
        this.actualizarTurno();

        if (rect) {
            this._lanzarParticulas(rect.left+rect.width/2, rect.top+rect.height/2);
            this._animarLanding(fila, col);
        }

        // Promoción de peón pendiente
        if (Logic.pendientePromocion) {
            this._mostrarMenuPromocion(Logic.pendientePromocion, () => {
                this.dibujarTablero();
                if (Logic.partidaTerminada) { this._mostrarFinPartida(); return; }
                if (ConfigJuego.modo==='bot') this.ejecutarTurnoBotConDelay();
            });
            return;
        }

        if (Logic.partidaTerminada) { this._mostrarFinPartida(); return; }
        if (ConfigJuego.modo==='bot') this.ejecutarTurnoBotConDelay();
    },

    // ── BOT ───────────────────────────────────────────────────
    ejecutarTurnoBotConDelay() {
        this.botPensando = true;
        this.actualizarTurno();
        setTimeout(() => {
            if (Logic.partidaTerminada) { this.botPensando=false; return; }
            const mov = Bot.elegirMovimiento();
            if (mov) {
                const sqD = this.contenedorTablero.querySelector(
                    `[data-fila='${mov.hastaFila}'][data-col='${mov.hastaCol}']`);
                const rect = sqD?.getBoundingClientRect();

                Logic.ejecutarMovimiento(mov.desdeFila,mov.desdeCol,mov.hastaFila,mov.hastaCol);

                // Bot siempre promueve a reina automáticamente
                if (Logic.pendientePromocion) Logic.promocionar('q');

                this.dibujarTablero();
                this.actualizarTurno();

                if (rect) {
                    this._lanzarParticulas(rect.left+rect.width/2, rect.top+rect.height/2, true);
                    this._animarLanding(mov.hastaFila, mov.hastaCol);
                }
                if (Logic.partidaTerminada) this._mostrarFinPartida();
            }
            this.botPensando = false;
        }, 500);
    },

    // ── MENÚ DE PROMOCIÓN ─────────────────────────────────────
    _mostrarMenuPromocion({ fila, col }, callback) {
        const color = Logic.tablero[fila][col].color;
        const opciones = ['q','r','b','n'];
        const nombres  = { q:'Reina', r:'Torre', b:'Alfil', n:'Caballo' };

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;inset:0;background:rgba(13,6,8,0.88);
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            z-index:10000;animation:fadeIn 0.3s ease;gap:24px;
        `;

        const titulo = document.createElement('p');
        titulo.textContent = '✦ Elige la pieza para tu peón ✦';
        titulo.style.cssText = `font-family:'Cinzel',serif;font-size:16px;letter-spacing:3px;color:#ffb3c1;`;
        overlay.appendChild(titulo);

        const fila_btns = document.createElement('div');
        fila_btns.style.cssText = `display:flex;gap:20px;`;

        for (const tipo of opciones) {
            const btn = document.createElement('button');
            const archivo = IMG_MAP[color][tipo];
            btn.style.cssText = `
                background:rgba(30,16,24,0.9);border:2px solid rgba(232,117,138,0.4);
                border-radius:12px;padding:16px;cursor:pointer;
                display:flex;flex-direction:column;align-items:center;gap:8px;
                transition:all 0.2s;width:90px;
            `;
            const img = document.createElement('img');
            img.src = `${BASE_PIECES}${archivo}.png`;
            img.style.cssText = `width:56px;height:56px;object-fit:contain;`;
            img.onerror = () => { img.style.display='none'; btn.prepend(Object.assign(document.createElement('span'),{textContent:UNICODE_FB[color][tipo],style:'font-size:40px'})); };
            const label = document.createElement('span');
            label.textContent = nombres[tipo];
            label.style.cssText = `font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;color:#e8c090;`;
            btn.appendChild(img);
            btn.appendChild(label);
            btn.onmouseenter = () => { btn.style.borderColor='rgba(232,117,138,0.9)'; btn.style.background='rgba(232,117,138,0.15)'; btn.style.transform='translateY(-3px)'; };
            btn.onmouseleave = () => { btn.style.borderColor='rgba(232,117,138,0.4)'; btn.style.background='rgba(30,16,24,0.9)'; btn.style.transform=''; };
            btn.onclick = () => {
                Logic.promocionar(tipo);
                overlay.remove();
                callback();
            };
            fila_btns.appendChild(btn);
        }

        overlay.appendChild(fila_btns);
        document.body.appendChild(overlay);
    },

    // ── FIN DE PARTIDA ────────────────────────────────────────
    _mostrarFinPartida() {
        const ganador = Logic.ganador;
        const esJugador = ganador === ConfigJuego.colorJugador;
        const nombre  = ganador === 'white' ? 'Blancas' : 'Negras';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed;inset:0;background:rgba(13,6,8,0.92);
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            z-index:10001;animation:fadeIn 0.5s ease;gap:20px;
        `;

        const emoji = document.createElement('div');
        emoji.textContent = esJugador ? '🌸' : '✦';
        emoji.style.cssText = `font-size:64px;animation:petalFall 0s;`;

        const titulo = document.createElement('p');
        titulo.textContent = esJugador ? '¡Victoria!' : 'Derrota';
        titulo.style.cssText = `font-family:'Cinzel',serif;font-size:clamp(28px,6vw,42px);
            letter-spacing:6px;color:${esJugador?'#ffb3c1':'#8a6070'};
            text-shadow:0 0 40px rgba(232,117,138,0.6);`;

        const sub = document.createElement('p');
        sub.textContent = `Ganan las ${nombre}`;
        sub.style.cssText = `font-family:'Cinzel',serif;font-size:14px;letter-spacing:3px;color:#c9955a;`;

        const btnNueva = document.createElement('button');
        btnNueva.textContent = 'Nueva Partida';
        btnNueva.className = 'btn';
        btnNueva.style.cssText = `max-width:240px;margin-top:12px;`;
        btnNueva.onclick = () => {
            overlay.remove();
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('menu-screen').classList.remove('hidden');
            if (typeof AudioManager !== 'undefined') AudioManager.playMenu();
        };

        overlay.append(emoji, titulo, sub, btnNueva);
        document.body.appendChild(overlay);

        // Lluvia de partículas festivas si gana el jugador
        if (esJugador) {
            for (let i = 0; i < 40; i++) setTimeout(() => {
                const cx = Math.random()*window.innerWidth;
                const cy = Math.random()*window.innerHeight*0.5;
                this._lanzarParticulas(cx, cy);
            }, i * 80);
        }
    },

    // ── ANIMACIONES ───────────────────────────────────────────
    _animarLanding(fila, col) {
        requestAnimationFrame(() => {
            const sq = this.contenedorTablero.querySelector(`[data-fila='${fila}'][data-col='${col}']`);
            if (!sq) return;
            sq.classList.add('piece-landing');
            sq.addEventListener('animationend', ()=>sq.classList.remove('piece-landing'),{once:true});
        });
    },

    _lanzarParticulas(cx, cy, esBot=false) {
        for (let i = 0; i < 18; i++) {
            const el = document.createElement('div');
            el.classList.add('particle');
            const esPetalo = Math.random() < 0.6;
            const ang  = (Math.PI*2*i)/18 + (Math.random()-0.5)*0.5;
            const dist = 45 + Math.random()*85;
            const tx   = Math.cos(ang)*dist;
            const ty   = Math.sin(ang)*dist + 28;
            const rot  = (Math.random()*720-360)+'deg';
            const dur  = 0.6 + Math.random()*0.45;

            if (esPetalo) {
                const w = 7+Math.random()*8, h = w*0.55;
                const c = esBot
                    ? `hsl(${200+Math.random()*40},55%,60%)`
                    : `hsl(${325+Math.random()*35},${72+Math.random()*20}%,${62+Math.random()*15}%)`;
                el.style.cssText=`width:${w}px;height:${h}px;background:${c};border-radius:50%;
                    left:${cx}px;top:${cy}px;box-shadow:0 0 5px ${c};
                    --tx:translate(${tx}px,${ty}px);--rot:${rot};animation-duration:${dur}s;`;
            } else {
                const sz=3+Math.random()*4;
                const c=`hsl(${20+Math.random()*30},82%,58%)`;
                el.style.cssText=`width:${sz}px;height:${sz}px;background:${c};border-radius:50%;
                    left:${cx}px;top:${cy}px;box-shadow:0 0 7px 2px ${c};
                    --tx:translate(${tx*1.4}px,${ty*0.65}px);--rot:${rot};animation-duration:${dur*0.7}s;`;
            }
            document.body.appendChild(el);
            el.addEventListener('animationend',()=>el.remove(),{once:true});
        }
    },

    // ── TURNO ─────────────────────────────────────────────────
    actualizarTurno() {
        const span = document.getElementById('current-turn');
        if (!span) return;
        if (Logic.partidaTerminada) { span.textContent='Partida terminada'; return; }
        if (ConfigJuego.modo==='bot' && Logic.turnoActual!==ConfigJuego.colorJugador) {
            span.textContent='✦ Bot...'; return;
        }
        span.textContent = Logic.turnoActual==='white' ? '⬜ Blancas' : '⬛ Negras';
    }
};
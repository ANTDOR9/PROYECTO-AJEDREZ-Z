// ==========================================
// MÓDULO AUDIO — Música de fondo con fade
// ==========================================
// INSTRUCCIONES PARA AGREGAR MÚSICA:
// 1. Ve a https://pixabay.com/music/search/chinese+ambient/
// 2. Abre una canción → clic derecho en el botón "Download" → "Copiar dirección de enlace"
// 3. Pega la URL en MENU_URL y GAME_URL abajo
// ==========================================

const Audio = {

    // ── PON TUS URLs AQUÍ ─────────────────────────────────────
    MENU_URL: '',   // ej: 'https://cdn.pixabay.com/audio/2024/.../track.mp3'
    GAME_URL: '',   // ej: 'https://cdn.pixabay.com/audio/2024/.../track2.mp3'
    // ─────────────────────────────────────────────────────────

    FADE_MS:   1500,   // duración del fade in/out en ms
    VOLUME:    0.35,   // volumen normal (0 a 1)
    _current:  null,   // elemento <audio> activo
    _muted:    false,
    _fadeTimer: null,

    // Inicia la música del menú
    playMenu() {
        this._switchTo(this.MENU_URL);
    },

    // Inicia la música de partida
    playGame() {
        this._switchTo(this.GAME_URL);
    },

    // Pausa con fade
    pause() {
        if (this._current) this._fadeOut(() => this._current.pause());
    },

    // Toggle mute
    toggleMute() {
        this._muted = !this._muted;
        if (this._current) this._current.volume = this._muted ? 0 : this.VOLUME;
        return this._muted;
    },

    // ── INTERNOS ──────────────────────────────────────────────
    _switchTo(url) {
        if (!url) return; // sin URL configurada, silencio

        // Si ya está sonando la misma pista, no hacer nada
        if (this._current && this._current.dataset.url === url && !this._current.paused) return;

        const prev = this._current;

        // Crear nuevo elemento audio
        const audio = document.createElement('audio');
        audio.src = url;
        audio.loop = true;
        audio.volume = 0;
        audio.dataset.url = url;
        document.body.appendChild(audio);

        const startNew = () => {
            this._current = audio;
            audio.play().catch(() => {
                // Autoplay bloqueado: esperar interacción del usuario
                const unlock = () => {
                    audio.play();
                    document.removeEventListener('click', unlock);
                };
                document.addEventListener('click', unlock, { once: true });
            });
            this._fadeIn(audio);
        };

        if (prev) {
            this._fadeOut(() => {
                prev.pause();
                prev.remove();
                startNew();
            });
        } else {
            startNew();
        }
    },

    _fadeIn(audio) {
        const steps = 30;
        const interval = this.FADE_MS / steps;
        const target = this._muted ? 0 : this.VOLUME;
        let step = 0;
        clearInterval(this._fadeTimer);
        this._fadeTimer = setInterval(() => {
            step++;
            audio.volume = Math.min(target, (step / steps) * target);
            if (step >= steps) clearInterval(this._fadeTimer);
        }, interval);
    },

    _fadeOut(cb) {
        if (!this._current) { cb(); return; }
        const audio = this._current;
        const steps = 20;
        const interval = this.FADE_MS / steps / 2;
        const startVol = audio.volume;
        let step = 0;
        clearInterval(this._fadeTimer);
        this._fadeTimer = setInterval(() => {
            step++;
            audio.volume = Math.max(0, startVol * (1 - step / steps));
            if (step >= steps) { clearInterval(this._fadeTimer); cb(); }
        }, interval);
    }
};
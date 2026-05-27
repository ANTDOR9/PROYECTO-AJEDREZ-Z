// ==========================================
// MÓDULO AUDIO — sin colisión de nombres
// ==========================================

const AudioManager = {
    MENU_SRC: 'assets/audio/menu.mp3',
    GAME_SRC: 'assets/audio/game.mp3',
    VOLUME:   0.4,
    FADE_MS:  1200,

    _el: null,
    _muted: false,
    _timer: null,
    _currentSrc: '',

    playMenu() { this._switchTo(this.MENU_SRC); },
    playGame()  { this._switchTo(this.GAME_SRC); },

    toggleMute() {
        this._muted = !this._muted;
        if (this._el) this._el.volume = this._muted ? 0 : this.VOLUME;
        return this._muted;
    },

    _switchTo(src) {
        if (this._currentSrc === src && this._el && !this._el.paused) return;
        this._currentSrc = src;

        const prev = this._el;
        const siguiente = () => {
            // Usar window.Audio para no colisionar con este módulo
            const a = new window.Audio(src);
            a.loop   = true;
            a.volume = 0;
            this._el = a;
            const promise = a.play();
            if (promise !== undefined) {
                promise.catch(() => {
                    // Autoplay bloqueado — arrancar en el primer clic
                    const resume = () => {
                        a.play().catch(() => {});
                        document.removeEventListener('click', resume);
                    };
                    document.addEventListener('click', resume, { once: true });
                });
            }
            this._fadeIn(a);
        };

        if (prev) {
            this._fadeOut(prev, () => { prev.pause(); siguiente(); });
        } else {
            siguiente();
        }
    },

    _fadeIn(a) {
        const steps = 25, interval = this.FADE_MS / steps;
        const target = this._muted ? 0 : this.VOLUME;
        let i = 0;
        clearInterval(this._timer);
        this._timer = setInterval(() => {
            a.volume = Math.min(target, (++i / steps) * target);
            if (i >= steps) clearInterval(this._timer);
        }, interval);
    },

    _fadeOut(a, cb) {
        const steps = 20, interval = this.FADE_MS / steps / 2;
        const start = a.volume; let i = 0;
        clearInterval(this._timer);
        this._timer = setInterval(() => {
            a.volume = Math.max(0, start * (1 - ++i / steps));
            if (i >= steps) { clearInterval(this._timer); cb(); }
        }, interval);
    }
};
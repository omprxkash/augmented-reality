export class ARButton {
  constructor(container, arSession) {
    this._session = arSession;
    this._btn = document.createElement('button');
    this._btn.setAttribute('aria-label', 'Start augmented reality session');
    this._btn.textContent = 'Checking...';
    this._btn.style.cssText = `
      padding: 14px 32px;
      border-radius: 50px;
      border: none;
      background: #fff;
      color: #000;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    `;
    this._btn.disabled = true;
    container.appendChild(this._btn);

    this._listeners = { start: [], end: [] };
    this._active = false;

    this._init();
  }

  async _init() {
    const supported = await this._session.isSupported();

    if (!supported) {
      this._btn.textContent = 'AR not supported';
      this._btn.style.opacity = '0.4';
      this._btn.style.cursor = 'default';
      return;
    }

    this._btn.textContent = 'Start AR';
    this._btn.disabled = false;
    this._btn.addEventListener('click', () => this._toggle());

    this._session.on('end', () => {
      this._active = false;
      this._btn.textContent = 'Start AR';
      this._emit('end');
    });
  }

  async _toggle() {
    if (this._active) {
      this._session.end();
    } else {
      this._btn.textContent = 'Starting…';
      this._btn.disabled = true;
      try {
        await this._session.start();
        this._active = true;
        this._btn.textContent = 'End AR';
        this._btn.disabled = false;
        this._emit('start', this._session.session);
      } catch (err) {
        this._btn.textContent = 'Start AR';
        this._btn.disabled = false;
        console.error('[ARButton] Session start failed:', err);
        this._emit('error', err);
      }
    }
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  _emit(event, data) {
    for (const fn of this._listeners[event] || []) fn(data);
  }
}

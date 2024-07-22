// WebXR immersive-ar requires a secure context (HTTPS or localhost).
export class ARSession {
  constructor({ overlayRoot } = {}) {
    this._overlayRoot = overlayRoot || document.getElementById('overlay');
    this._session = null;
    this._listeners = {};
  }

  async isSupported() {
    if (this._supported !== undefined) return this._supported;
    if (!navigator.xr) { this._supported = false; return false; }
    try {
      this._supported = await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
      this._supported = false;
    }
    return this._supported;
  }

  async start() {
    if (this._session || this._startPending) return this._session;
    this._startPending = true;

    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'plane-detection', 'anchors'],
    };

    if (this._overlayRoot) {
      sessionInit.domOverlay = { root: this._overlayRoot };
    }

    this._session = await navigator.xr.requestSession('immersive-ar', sessionInit);
    this._startPending = false;

    this._session.addEventListener('end', () => this._onEnd());

    document.addEventListener('visibilitychange', this._onVisibilityChange);

    return this._session;
  }

  end() {
    if (this._session) {
      this._session.end();
    }
  }

  on(event, fn) {
    this._listeners[event] = fn;
  }

  _onEnd() {
    this._startPending = false;
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    this._session = null;
    this._emit('end');
  }

  _onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && this._session) {
      this.end();
    }
  };

  _emit(event, data) {
    if (this._listeners[event]) this._listeners[event](data);
  }

  get session() {
    return this._session;
  }
}

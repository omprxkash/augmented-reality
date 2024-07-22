export class ControlsOverlay {
  constructor(placer) {
    this._placer = placer;
    this._hud = document.getElementById('hud');
    this._hint = document.getElementById('hint');

    this._rotateInterval = null;
    this._touches = {};
    this._lastPinchDist = null;

    this._bind();
  }

  show() {
    if (this._hud) {
      this._hud.classList.add('visible');
      this._hint.classList.add('visible');
    }
  }

  hide() {
    if (this._hud) {
      this._hud.classList.remove('visible');
      this._hint.classList.remove('visible');
    }
  }

  _bind() {
    const get = (id) => document.getElementById(id);

    get('btn-scale-up')?.addEventListener('click', () => this._placer.scaleAll(1.25));
    get('btn-scale-down')?.addEventListener('click', () => this._placer.scaleAll(0.8));
    get('btn-rotate')?.addEventListener('click', () => this._placer.rotateAll(Math.PI / 8));
    get('btn-delete')?.addEventListener('click', () => {
      this._placer.removeLast();
    });

    // Pinch-to-scale via pointer events on the overlay
    const overlay = document.getElementById('overlay');
    if (!overlay) return;

    overlay.addEventListener('pointerdown', (e) => {
      this._touches[e.pointerId] = { x: e.clientX, y: e.clientY };
    });

    overlay.addEventListener('pointermove', (e) => {
      if (!(e.pointerId in this._touches)) return;
      this._touches[e.pointerId] = { x: e.clientX, y: e.clientY };

      const ids = Object.keys(this._touches);
      if (ids.length !== 2) { this._lastPinchDist = null; return; }

      const [a, b] = ids.map((id) => this._touches[id]);
      const dist = Math.hypot(a.x - b.x, a.y - b.y);

      if (this._lastPinchDist !== null) {
        const delta = dist / this._lastPinchDist;
        if (Math.abs(delta - 1) > 0.015) this._placer.scaleAll(delta);
      }
      this._lastPinchDist = dist;
    });

    const onPointerEnd = (e) => {
      delete this._touches[e.pointerId];
      if (Object.keys(this._touches).length < 2) this._lastPinchDist = null;
    };
    overlay.addEventListener('pointerup', onPointerEnd);
    overlay.addEventListener('pointercancel', onPointerEnd);
  }
}

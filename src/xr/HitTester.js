export class HitTester {
  constructor() {
    this._source = null;
    this._refSpace = null;
    this._listeners = { hit: [], miss: [] };
  }

  async init(session, referenceSpace) {
    const viewerSpace = await session.requestReferenceSpace('viewer');
    this._source = await session.requestHitTestSource({ space: viewerSpace });
    this._refSpace = referenceSpace;
  }

  update(frame) {
    if (!this._source || !this._refSpace) return null;

    const results = frame.getHitTestResults(this._source);

    if (results.length > 0) {
      const pose = results[0].getPose(this._refSpace);
      if (pose) {
        this._emit('hit', pose);
        return pose;
      }
    }

    this._emit('miss', null);
    return null;
  }

  on(event, fn) {
    if (this._listeners[event]) this._listeners[event].push(fn);
  }

  dispose() {
    if (this._source) {
      try {
        this._source.cancel();
      } catch {
        // Session may already be ended
      }
      this._source = null;
    }
    this._refSpace = null;
  }

  _emit(event, data) {
    for (const fn of this._listeners[event] || []) fn(data);
  }
}

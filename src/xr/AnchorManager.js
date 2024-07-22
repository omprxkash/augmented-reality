export class AnchorManager {
  constructor(scene) {
    this._scene = scene;
    this._anchors = new Map();
  }

  async add(frame, pose, referenceSpace, object) {
    if (!frame.createAnchor) return;

    try {
      const anchor = await frame.createAnchor(pose, referenceSpace);
      this._anchors.set(anchor, object);
    } catch (err) {
      console.warn('Anchor creation failed:', err);
    }
  }

  update(frame, referenceSpace) {
    if (!frame.trackedAnchors) return;

    for (const [anchor, object] of this._anchors) {
      if (!frame.trackedAnchors.has(anchor)) continue;

      const pose = frame.getPose(anchor.anchorSpace, referenceSpace);
      if (!pose) continue;

      const m = pose.transform.matrix;
      object.matrix.fromArray(m);
      object.matrix.decompose(object.position, object.quaternion, object.scale);
    }
  }

  remove(object) {
    for (const [anchor, obj] of this._anchors) {
      if (obj === object) {
        this._scene.remove(object);
        try { anchor.delete(); } catch { /* ignore */ }
        this._anchors.delete(anchor);
        return;
      }
    }
    // Object wasn't anchored — remove from scene directly
    this._scene.remove(object);
  }

  dispose() {
    for (const [anchor, obj] of this._anchors) {
      try { anchor.delete(); } catch { /* ignore */ }
      this._scene.remove(obj);
    }
    this._anchors.clear();
  }
}

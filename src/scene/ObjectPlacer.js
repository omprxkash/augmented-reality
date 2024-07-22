import * as THREE from 'three';

export class ObjectPlacer {
  constructor(scene, anchorManager) {
    this._scene = scene;
    this._anchorManager = anchorManager;
    this._model = null;
    this._placed = [];
    this._onSelectListener = null;
    this._session = null;
    this._refSpace = null;
    this._reticle = null;
  }

  init(session, referenceSpace, reticle) {
    this._session = session;
    this._refSpace = referenceSpace;
    this._reticle = reticle;

    this._onSelectListener = (event) => this._onSelect(event);
    session.addEventListener('select', this._onSelectListener);
  }

  setModel(gltfScene) {
    this._model = gltfScene;
  }

  async _onSelect(event) {
    if (!this._reticle || !this._reticle.visible) return;
    if (!this._model) {
      console.warn('[ObjectPlacer] No model loaded yet — tap ignored');
      return;
    }

    const clone = this._model.clone();

    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    this._reticle.matrix.decompose(pos, quat, scale);

    clone.position.copy(pos);
    clone.quaternion.copy(quat);
    clone.scale.setScalar(0.12);
    clone.matrixAutoUpdate = true;

    this._scene.add(clone);
    this._placed.push(clone);

    if (this._anchorManager) {
      const pose = {
        transform: new XRRigidTransform(
          { x: pos.x, y: pos.y, z: pos.z, w: 1 },
          { x: quat.x, y: quat.y, z: quat.z, w: quat.w }
        ),
      };
      try {
        await this._anchorManager.add(event.frame, pose, this._refSpace, clone);
      } catch { /* XRRigidTransform may not be available in all browsers */ }
    }
  }

  removeLast() {
    const obj = this._placed.pop();
    if (obj && this._anchorManager) {
      this._anchorManager.remove(obj);
    } else if (obj) {
      this._scene.remove(obj);
    }
  }

  scaleAll(factor = 1.25) {
    for (const obj of this._placed) {
      obj.scale.multiplyScalar(factor);
    }
  }

  rotateAll(angle = Math.PI / 8) {
    for (const obj of this._placed) {
      obj.rotation.y += angle;
    }
  }

  dispose() {
    if (this._session && this._onSelectListener) {
      this._session.removeEventListener('select', this._onSelectListener);
    }
  }
}

import * as THREE from 'three';

export class PlaneDetector {
  constructor(scene) {
    this._scene = scene;
    this._meshes = new Map();
    this._enabled = import.meta.env.VITE_DEBUG_PLANES === 'true';
  }

  update(frame, referenceSpace) {
    if (!frame.detectedPlanes) return;

    const seen = new Set();

    for (const plane of frame.detectedPlanes) {
      seen.add(plane);
      const pose = frame.getPose(plane.planeSpace, referenceSpace);
      if (!pose) continue;
      if (!plane.polygon || plane.polygon.length < 3) continue;

      if (!this._meshes.has(plane)) {
        const mesh = this._buildMesh(plane.polygon);
        this._scene.add(mesh);
        this._meshes.set(plane, mesh);
        console.debug('[PlaneDetector] new plane detected, total:', this._meshes.size);
      }

      const mesh = this._meshes.get(plane);
      const m = pose.transform.matrix;
      mesh.matrix.fromArray(m);
      mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.visible = this._enabled;
    }

    for (const [plane, mesh] of this._meshes) {
      if (!seen.has(plane)) {
        this._scene.remove(mesh);
        this._meshes.delete(plane);
      }
    }
  }

  setVisible(visible) {
    this._enabled = visible;
    for (const mesh of this._meshes.values()) mesh.visible = visible;
  }

  _buildMesh(polygon) {
    const shape = new THREE.Shape();
    polygon.forEach(({ x, z }, i) => {
      i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z);
    });

    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.matrixAutoUpdate = false;
    return mesh;
  }

  dispose() {
    for (const mesh of this._meshes.values()) this._scene.remove(mesh);
    this._meshes.clear();
  }
}

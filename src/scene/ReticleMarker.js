import * as THREE from 'three';

export class ReticleMarker {
  constructor(scene) {
    const geo = new THREE.RingGeometry(0.05, 0.08, 36);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.visible = false;

    scene.add(this.mesh);
  }

  update(pose) {
    if (!pose) {
      this.mesh.visible = false;
      return;
    }

    this.mesh.visible = true;
    this.mesh.matrix.fromArray(pose.transform.matrix);
  }

  get matrix() {
    return this.mesh.matrix;
  }

  get visible() {
    return this.mesh.visible;
  }
}

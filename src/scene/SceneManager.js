import * as THREE from 'three';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = 'srgb';
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    const canvas = this.renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    document.body.appendChild(canvas);

    this._refSpace = null;
    this._onFrame = null;

    window.addEventListener('resize', this._onResize);
  }

  async initXR(session) {
    await this.renderer.xr.setSession(session);
    this._refSpace = await session.requestReferenceSpace('local-floor');
    return this._refSpace;
  }

  startLoop(onFrame) {
    this._onFrame = onFrame;
    this.renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && this._onFrame) this._onFrame(timestamp, frame, this._refSpace);
      this.renderer.render(this.scene, this.camera);
    });
  }

  stopLoop() {
    if (this.renderer) this.renderer.setAnimationLoop(null);
  }

  addLight() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 2, 1);
    this.scene.add(ambient, directional);
  }

  _onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

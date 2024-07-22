import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PLACEHOLDER_COLORS = {
  chair:   0x8b5e3c,
  table:   0xc8a96e,
  lamp:    0xf5e050,
  default: 0xaaaaaa,
};

export class ModelLoader {
  constructor() {
    this._loader = new GLTFLoader();
    this._cache = new Map();
    this._listeners = { progress: [], error: [] };
  }

  async load(name, url) {
    if (this._cache.has(name)) {
      return this._cache.get(name);
    }

    try {
      const gltf = await new Promise((resolve, reject) => {
        this._loader.load(
          url,
          resolve,
          (xhr) => this._emit('progress', { name, loaded: xhr.loaded, total: xhr.total }),
          reject
        );
      });
      this._cache.set(name, gltf.scene);
      return gltf.scene;
    } catch {
      // No .glb asset found — fall back to a colored placeholder cube
      console.warn(`[ModelLoader] ${url} not found, using placeholder cube for '${name}'`);
      const color = PLACEHOLDER_COLORS[name] ?? PLACEHOLDER_COLORS.default;
      const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      const group = new THREE.Group();
      group.add(mesh);
      this._cache.set(name, group);
      return group;
    }
  }

  on(event, fn) {
    if (this._listeners[event]) this._listeners[event].push(fn);
  }

  _emit(event, data) {
    for (const fn of this._listeners[event] || []) fn(data);
  }
}

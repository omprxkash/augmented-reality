import { ARSession } from './xr/ARSession.js';
import { HitTester } from './xr/HitTester.js';
import { PlaneDetector } from './xr/PlaneDetector.js';
import { AnchorManager } from './xr/AnchorManager.js';
import { SceneManager } from './scene/SceneManager.js';
import { ReticleMarker } from './scene/ReticleMarker.js';
import { ObjectPlacer } from './scene/ObjectPlacer.js';
import { ModelLoader } from './loaders/ModelLoader.js';
import { ARButton } from './ui/ARButton.js';
import { ControlsOverlay } from './ui/ControlsOverlay.js';

const sceneManager = new SceneManager();
sceneManager.addLight();

const arSession = new ARSession({ overlayRoot: document.getElementById('overlay') });

const hitTester = new HitTester();
const loader = new ModelLoader();

let anchorManager = null;
let reticle = null;
let placer = null;
let planeDetector = null;
let overlay = null;

const modelName = import.meta.env.VITE_DEFAULT_MODEL || 'chair';

const button = new ARButton(document.getElementById('ar-button-container'), arSession);

button.on('start', async (session) => {
  document.getElementById('landing').style.display = 'none';

  const refSpace = await sceneManager.initXR(session);

  reticle = new ReticleMarker(sceneManager.scene);
  anchorManager = new AnchorManager(sceneManager.scene);
  planeDetector = new PlaneDetector(sceneManager.scene);

  placer = new ObjectPlacer(sceneManager.scene, anchorManager);
  placer.init(session, refSpace, reticle);

  overlay = new ControlsOverlay(placer);
  overlay.show();

  await hitTester.init(session, refSpace);

  const model = await loader.load(modelName, `/src/assets/models/${modelName}.glb`);
  placer.setModel(model);

  sceneManager.startLoop((timestamp, frame, space) => {
    const hitPose = hitTester.update(frame);
    reticle.update(hitPose);

    planeDetector.update(frame, space);
    anchorManager.update(frame, space);
  });
});

arSession.on('end', () => {
  sceneManager.stopLoop();
  overlay?.hide();
  hitTester.dispose();
  anchorManager?.dispose();
  planeDetector?.dispose();
  placer?.dispose();
  document.getElementById('landing').style.display = 'flex';
});

# Architecture

## XR Render Loop

```
browser / WebXR runtime
       │
       │  immersive-ar session
       ▼
  ARSession.js
       │  start() → XRSession
       ▼
  SceneManager.js
       │  renderer.xr.enabled = true
       │  renderer.setAnimationLoop((t, frame) => { ... })
       │
       ├──▶ HitTester.js
       │       XRHitTestSource (viewer space)
       │       frame.getHitTestResults(source)
       │            │
       │            ▼ pose
       │       ReticleMarker.js  ← ring mesh, matrix updated each frame
       │
       ├──▶ PlaneDetector.js
       │       frame.detectedPlanes → THREE.Mesh overlays
       │
       ├──▶ AnchorManager.js
       │       frame.trackedAnchors → update Object3D positions
       │
       └──▶ renderer.render(scene, camera)

All updates happen inside `renderer.setAnimationLoop` — **never** `requestAnimationFrame`
directly, because the XR runtime controls when frames are available.

User taps screen
       │
       ▼
  XRInputSourceEvent "select"
       │
       ▼
  ObjectPlacer.js
       clone GLTF model → position from reticle matrix
       frame.createAnchor(pose, refSpace) → AnchorManager
```

## Module Map

```
src/
  main.js            — wires everything together
  xr/
    ARSession.js     — session lifecycle
    HitTester.js     — surface ray-casting
    PlaneDetector.js — plane mesh overlays
    AnchorManager.js — anchor → mesh tracking
  scene/
    SceneManager.js  — Three.js renderer + XR loop
    ReticleMarker.js — surface reticle ring
    ObjectPlacer.js  — model placement on tap
  loaders/
    ModelLoader.js   — async GLTF loader w/ placeholder fallback
  ui/
    ARButton.js      — session start/stop button
    ControlsOverlay.js — HUD: scale / rotate / delete + pinch gesture
```

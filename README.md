# AR Toolkit

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Built with Three.js](https://img.shields.io/badge/Three.js-r160-blue)
![WebXR](https://img.shields.io/badge/WebXR-immersive--ar-green)

> **Place 3D objects on real surfaces — through your camera, in the browser. No app, no Unity, no install.**

I built this to explore what WebXR can do today without the weight of a native app or a game engine. Point your phone at any flat surface, tap to drop a 3D model, and walk around it like it's actually there. It runs entirely in Chrome as a regular webpage.

---

## Table of Contents

- [What is WebXR?](#what-is-webxr)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Running on a Real Device](#running-on-a-real-device)
- [Desktop Testing (Emulator)](#desktop-testing-emulator)
- [How to Place Objects](#how-to-place-objects)
- [Adding Your Own 3D Models](#adding-your-own-3d-models)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)

---

## What is WebXR?

WebXR is a browser API that gives JavaScript direct access to a device's AR and VR hardware — the camera, motion sensors, and display — without any plugin or native wrapper. In AR mode (`immersive-ar`), it:

- Streams the real-world camera feed as the scene background
- Tracks flat surfaces (floors, tables, desks) using the device's depth sensor or ARCore
- Lets you overlay 3D content that stays anchored to those surfaces as you move around

The result is a full AR experience that ships as a URL and runs inside Chrome on any ARCore-compatible Android device.

---

## Features

| Feature | Details |
|---|---|
| **Surface detection** | WebXR hit-testing places a ring reticle on detected flat surfaces in real time |
| **Tap to place** | Tap the screen to drop a 3D model at the reticle position |
| **Anchor tracking** | Placed objects stay locked to their real-world position as you walk around |
| **Plane overlays** | Optional semi-transparent mesh highlights every detected plane (floor, table, etc.) |
| **HUD controls** | On-screen buttons to scale, rotate, and delete placed objects |
| **Pinch-to-scale** | Two-finger pinch gesture scales all placed objects continuously |
| **GLTF model loading** | Drop any `.glb` file into the assets folder — the loader handles async progress |
| **Placeholder fallback** | If a model file is missing, a coloured cube appears so the session still runs |

---

## Tech Stack

| Layer | Library / API | Version |
|---|---|---|
| 3D rendering | [Three.js](https://threejs.org) | r160 |
| AR session | [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API) | — |
| Build & dev server | [Vite](https://vitejs.dev) | 5 |
| Unit tests | [Vitest](https://vitest.dev) | 1 |
| E2E tests | [Playwright](https://playwright.dev) | 1.40 |
| 3D assets | GLTF/GLB via `THREE.GLTFLoader` | — |
| Physics (optional) | [cannon-es](https://github.com/pmndrs/cannon-es) | 0.20 |

---

## Prerequisites

**For real AR on a device:**
- Android 8.0+ with [ARCore](https://developers.google.com/ar/devices) support
- Chrome 111 or newer
- HTTPS connection (WebXR won't start over plain HTTP)

**For desktop testing:**
- Any modern Chrome or Firefox with the [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje) extension installed

---

## Quick Start

```bash
git clone https://github.com/omprxkash/augmented-reality
cd augmented-reality
npm install
npm run dev
```

This opens `http://localhost:5173`. On desktop with the WebXR emulator installed, you can start the AR session immediately. For a real Android device, see the next section.

---

## Running on a Real Device

WebXR requires HTTPS on physical devices. The easiest way to get there during local development is a tunnel:

```bash
# Option 1 — cloudflared (no account needed)
npx cloudflared tunnel --url http://localhost:5173

# Option 2 — ngrok
npx ngrok http 5173
```

Copy the HTTPS URL from the terminal output, open it in Chrome on your Android phone, then tap **Start AR**.

Alternatively, use [Chrome DevTools remote debugging](https://developer.chrome.com/docs/devtools/remote-debugging) to forward the local port directly to your phone over USB — no tunnel needed.

---

## Desktop Testing (Emulator)

1. Install the [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje) extension
2. Run `npm run dev` and open `http://localhost:5173`
3. Open Chrome DevTools → **WebXR** tab
4. Pick a device preset (e.g. Samsung Galaxy S8)
5. Tap **Start AR** in the page — the emulator provides a synthetic XR session
6. Move the virtual headset in the DevTools panel to simulate camera motion and surface detection

---

## How to Place Objects

1. **Tap Start AR** — the live camera feed fills the screen
2. **Pan slowly** across a flat surface (floor, desk, table). A white ring reticle appears once a surface is detected
3. **Tap the screen** to drop a 3D model at the reticle position
4. **Use the HUD buttons** that appear at the bottom:
   - **−** — scale the object down
   - **+** — scale the object up
   - **↻** — rotate 22.5° clockwise
   - **🗑** — remove the last placed object
5. **Pinch with two fingers** anywhere on screen to continuously resize all placed objects
6. **Walk around** — objects stay pinned to their real-world position via XRAnchors

---

## Adding Your Own 3D Models

Drop `.glb` files into `src/assets/models/`:

```
src/assets/models/
├── chair.glb
├── table.glb
└── lamp.glb
```

Set the default model with an environment variable:

```bash
# .env
VITE_DEFAULT_MODEL=table
```

If a file isn't found, the loader automatically falls back to a coloured placeholder cube so the session keeps running. Supported formats: GLTF 2.0 (`.glb` binary or `.gltf` + textures).

---

## Project Structure

```
augmented-reality/
├── src/
│   ├── main.js                  # Entry point — wires all modules together
│   ├── xr/
│   │   ├── ARSession.js         # Start/stop immersive-ar session, feature negotiation
│   │   ├── HitTester.js         # XRHitTestSource + per-frame surface raycast
│   │   ├── PlaneDetector.js     # XRPlane detection, Three.js mesh overlays
│   │   └── AnchorManager.js     # XRAnchor lifecycle, keeps meshes pinned to world
│   ├── scene/
│   │   ├── SceneManager.js      # Three.js WebGLRenderer, XR render loop
│   │   ├── ReticleMarker.js     # Ring reticle aligned to hit-test surface
│   │   └── ObjectPlacer.js      # Clones GLTF model on tap, anchors it in world
│   ├── loaders/
│   │   └── ModelLoader.js       # Async GLTF/GLB loader, cache, placeholder fallback
│   └── ui/
│       ├── ARButton.js          # Checks session support, start/stop button
│       └── ControlsOverlay.js   # HUD (scale, rotate, delete) + pinch gesture
├── tests/
│   ├── unit/HitTester.test.js   # Vitest — mocks XRFrame/XRHitTestResult
│   └── e2e/ar-placement.spec.js # Playwright — checks landing page + AR button
├── docs/
│   ├── ARCHITECTURE.md          # Module map + render loop diagram
│   └── WEBXR_SETUP.md           # Device setup, emulator, ARCore notes
├── index.html                   # App shell, overlay div, module script entry
├── vite.config.js
├── package.json
├── Dockerfile
├── .env.example
└── .gitignore
```

---

## Architecture

The entire AR loop runs inside `renderer.setAnimationLoop` — never `requestAnimationFrame`, because the WebXR runtime controls frame timing.

```
XRSession (immersive-ar)
│
├── Every frame: renderer.setAnimationLoop((timestamp, frame) => { ... })
│
├── HitTester
│     XRHitTestSource against 'viewer' space
│     frame.getHitTestResults() → pose
│          └── ReticleMarker — ring mesh updated to surface pose
│
├── PlaneDetector
│     frame.detectedPlanes → Three.js mesh per plane (toggleable overlay)
│
├── AnchorManager
│     frame.trackedAnchors → update Object3D position each frame
│
└── On screen tap (XRInputSourceEvent 'select')
      └── ObjectPlacer
            clone GLTF model → place at reticle matrix
            frame.createAnchor(pose, refSpace) → AnchorManager
```

Each module emits events or accepts callbacks — nothing is tightly coupled. `main.js` is the only place that knows about all of them.

Full diagram with file-level detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Testing

**Unit tests** (Vitest — no browser needed):

```bash
npm test
```

**E2E tests** (Playwright — needs the dev server running):

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e
```

The E2E spec checks that the landing page loads, the AR button appears, and the overlay DOM is in place. Full AR session testing requires a real device or the emulator.

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
# Enable experimental cannon-es physics (early WIP)
VITE_ENABLE_PHYSICS=false

# Default model to load on session start: chair | table | lamp
VITE_DEFAULT_MODEL=chair

# Show semi-transparent plane overlays for debugging
VITE_DEBUG_PLANES=false
```

---

## Known Limitations

- **iOS Safari** — WebXR `immersive-ar` is not supported on iOS. WebKit's partial WebXR implementation does not include hit-testing. A native wrapper (e.g. Reality Composer or a WKWebView bridge) would be needed.
- **Requires HTTPS** — Chrome blocks WebXR on plain HTTP. Use a tunnel or remote debugging for local device testing.
- **ARCore required** — Android devices without ARCore (older hardware, some Chromebooks) will not support plane detection or anchors.
- **No multi-user** — each session is local to one device. Shared AR would need a sync layer (WebRTC, WebSockets) on top.
- **No iOS** — see first point. There is no cross-platform workaround that keeps this as a plain webpage.

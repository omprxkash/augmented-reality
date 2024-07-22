# Running the AR experience

## On an Android device (real AR)

**Requirements**
- Android 8+ with ARCore support
- Chrome 111 or newer
- HTTPS (WebXR will not run over plain HTTP)

**Steps**

1. Serve the app over HTTPS. The simplest option during development is a tunnel:
   ```
   npm install -g cloudflared
   cloudflared tunnel --url http://localhost:5173
   ```
   Or use `ngrok`, `localtunnel`, or any other HTTPS proxy.

2. Open the HTTPS URL in Chrome on your Android device.

3. Tap **Start AR** — Chrome will ask for camera permission.

4. Slowly pan around a flat surface. The white reticle appears when a surface is detected.

5. Tap the screen to place an object at the reticle position.

6. Use the **− / +** buttons to scale, **↻** to rotate, and the trash icon to remove the last object.

## On desktop (WebXR emulator)

Install the [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje) extension for Chrome or Firefox.

1. `npm run dev` — opens `http://localhost:5173`
2. Open DevTools → **WebXR** tab
3. Select **Samsung Galaxy S8** (or any AR device preset)
4. Tap **Start AR** in the page — the emulator provides the XR session
5. Move the headset/controller in the DevTools panel to simulate camera motion

## ARCore requirement

Android devices must have [ARCore](https://developers.google.com/ar/devices) installed and a compatible chipset. Chromebooks and older Android devices without ARCore will only see the AR button disabled.

## Plane detection & anchors

Both are requested as optional features. If the browser/runtime supports them they activate automatically. You can toggle the semi-transparent plane overlays with:

```js
planeDetector.setVisible(true); // called from the console during dev
```

Set `VITE_DEBUG_PLANES=true` in a `.env` file to enable them by default.

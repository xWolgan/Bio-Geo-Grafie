// app.js
import { loadRuntime } from "@wonderlandengine/api";
var Constants = {
  ProjectName: "Bio-Geo-Grafie_project",
  RuntimeBaseName: "WonderlandRuntime",
  WebXRRequiredFeatures: ["local"],
  WebXROptionalFeatures: ["local", "local-floor", "hand-tracking", "hit-test"]
};
var RuntimeOptions = {
  physx: false,
  loader: false,
  xrFramebufferScaleFactor: 1,
  xrOfferSession: {
    mode: "auto",
    features: Constants.WebXRRequiredFeatures,
    optionalFeatures: Constants.WebXROptionalFeatures
  },
  canvas: "canvas"
};
var engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);
engine.onLoadingScreenEnd.once(() => {
  const el = document.getElementById("version");
  if (el)
    setTimeout(() => el.remove(), 2e3);
});
function requestSession(mode) {
  engine.requestXRSession(mode, Constants.WebXRRequiredFeatures, Constants.WebXROptionalFeatures).catch((e) => console.error(e));
}
function setupButtonsXR() {
  const arButton = document.getElementById("ar-button");
  if (arButton) {
    arButton.setAttribute("data-supported", engine.arSupported.toString());
    arButton.addEventListener("click", () => requestSession("immersive-ar"));
  }
  const vrButton = document.getElementById("vr-button");
  if (vrButton) {
    vrButton.setAttribute("data-supported", engine.vrSupported.toString());
    vrButton.addEventListener("click", () => requestSession("immersive-vr"));
  }
}
if (document.readyState === "loading") {
  window.addEventListener("load", setupButtonsXR);
} else {
  setupButtonsXR();
}
try {
  await engine.loadMainSceneFromBuffer({
    buffer: await (await fetch(`https://pub-c6ac418601d24ff1b2b716ad48afc9ce.r2.dev/${Constants.ProjectName}.bin`)).arrayBuffer(),
    filename: `${Constants.ProjectName}.bin`
  });
} catch (e) {
  console.error(e);
  window.alert(`Failed to load ${Constants.ProjectName}.bin:`, e);
}
//# sourceMappingURL=MyWonderland-app.js.map

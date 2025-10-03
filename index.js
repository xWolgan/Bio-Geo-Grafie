/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 */

/* wle:auto-imports:start */
import {AudioListener} from '@wonderlandengine/components';
import {Cursor} from '@wonderlandengine/components';
import {FingerCursor} from '@wonderlandengine/components';
import {HandTracking} from '@wonderlandengine/components';
import {MouseLookComponent} from '@wonderlandengine/components';
import {PlayerHeight} from '@wonderlandengine/components';
import {TeleportComponent} from '@wonderlandengine/components';
import {VrModeActiveSwitch} from '@wonderlandengine/components';
import {AmbientAudio} from './ambient-audio.js';
import {ExtendedWasdControls} from './extended-wasd-controls.js';
import {InteractionManager} from './interaction-manager.js';
import {InteractiveObject} from './interactive-object.js';
import {LightFadeController} from './light-fade-controller.js';
import {OpacityController} from './opacity-controller.js';
import {VideoWallTiled} from './video-wall-tiled.js';
import {VrTeleportWrapper} from './vr-teleport-wrapper.js';
/* wle:auto-imports:end */

// Manual import that editor keeps removing
import {SkySphereControllerV2} from './sky-sphere-controller-v2.js';
import {AudioListener as SpatialAudioListener} from '@wonderlandengine/spatial-audio';
// InteractionManager is now in auto-imports above

export default function(engine) {
/* wle:auto-register:start */
engine.registerComponent(AudioListener);
engine.registerComponent(Cursor);
engine.registerComponent(FingerCursor);
engine.registerComponent(HandTracking);
engine.registerComponent(MouseLookComponent);
engine.registerComponent(PlayerHeight);
engine.registerComponent(TeleportComponent);
engine.registerComponent(VrModeActiveSwitch);
engine.registerComponent(AmbientAudio);
engine.registerComponent(ExtendedWasdControls);
engine.registerComponent(InteractionManager);
engine.registerComponent(InteractiveObject);
engine.registerComponent(LightFadeController);
engine.registerComponent(OpacityController);
engine.registerComponent(VideoWallTiled);
engine.registerComponent(VrTeleportWrapper);
/* wle:auto-register:end */

// Manual registration that editor keeps removing
engine.registerComponent(SkySphereControllerV2);
engine.registerComponent(SpatialAudioListener);
// InteractionManager is now in auto-register above
}

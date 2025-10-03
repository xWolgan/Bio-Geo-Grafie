import {Component, Property} from '@wonderlandengine/api';

/**
 * InteractiveObject - Handles proximity-based interactions with gallery objects
 * When player approaches within trigger distance:
 * - Triggers sky transition to night
 * - Activates spotlight on object
 * - Plays associated video on room walls
 * - Object disappears after video ends
 * 
 * Setup Instructions:
 * 1. Add this component to an interactive object in the scene
 * 2. Set playerObject to the main Player object (not EyeLeft/EyeRight)
 * 3. Set skyController to object with SkySphereControllerV2 component
 * 4. Set videoWallController to object with VideoWallTiled component
 * 5. Set room to 'left' or 'right' based on which room the object is in
 * 6. Optionally set videoUrl to override the default video for this object
 * 
 * Room Configuration:
 * - 'left': Plays video on left room walls (materials 4,5,6)
 * - 'right': Plays video on right room walls (materials 7,8,9)
 * - 'both': Plays on both rooms (requires two VideoWallTiled components)
 */
export class InteractiveObject extends Component {
    static TypeName = 'interactive-object';
    static Properties = {
        triggerDistance: Property.float(1.0),
        playerObject: Property.object(),
        videoWallController: Property.object(),  // Object with VideoWallTiled component
        room: Property.enum(['left', 'right', 'both'], 'left'),  // Which room this object belongs to
        videoUrl: Property.string(''),  // Optional: override video URL in VideoWallTiled
        videoDuration: Property.float(240.0), // 4 minutes default
        disappearDuration: Property.float(1.0),
        spotlightObject: Property.object(),  // Object with light and light-fade-controller
        lightFadeOutDuration: Property.float(2.0),
        lightFadeInDuration: Property.float(2.0),
        debugMode: Property.bool(true)
    };
    
    init() {
        this.isTriggered = false;
        this.isPlaying = false;
        this.hasBeenPlayed = false;
        this.videoEndTime = 0;
        this.disappearProgress = 0;
        this.interactionEnabled = true;  // Custom flag for interaction blocking

        // Store original transform for animation
        this.originalScale = new Float32Array(3);
        this.originalPosition = new Float32Array(3);

        // Player position for distance check
        this.playerPos = new Float32Array(3);
        this.objectPos = new Float32Array(3);

        // Store reference to ambient audio component (will find it later)
        this.ambientAudioComponent = null;

        // Error logging flag
        this.errorLogged = false;

        console.log('[InteractiveObject] Initialized');
    }
    
    start() {
        // Register with global interaction manager
        if (window.interactionManager) {
            window.interactionManager.registerInteractiveObject(this);
        } else {
            console.warn('[InteractiveObject] No InteractionManager found - add it to scene!');
        }

        // Validate required references
        if (!this.playerObject) {
            console.error('[InteractiveObject] Player object not assigned!');
            return;
        }

        // Store original transform
        this.object.getScalingLocal(this.originalScale);
        this.object.getPositionLocal(this.originalPosition);
        
        // Get video wall controller component if assigned
        this.videoWallComponent = null;
        if (this.videoWallController) {
            this.videoWallComponent = this.videoWallController.getComponent('video-wall-tiled');
            
            if (!this.videoWallComponent) {
                console.warn('[InteractiveObject] Video wall controller object assigned but no VideoWallTiled component found');
            } else {
                console.log('[InteractiveObject] VideoWallTiled component found:', this.videoWallComponent);
                console.log('[InteractiveObject] Room assignment:', this.room);
            }
        } else {
            console.warn('[InteractiveObject] No video wall controller assigned - video playback will not work');
        }
        
        if (this.debugMode) {
            console.log('[InteractiveObject] Ready for interaction', {
                object: this.object.name,
                triggerDistance: this.triggerDistance,
                videoDuration: this.videoDuration
            });
        }
    }
    
    update(dt) {
        // Skip if already played
        if (this.hasBeenPlayed) {
            // Handle disappear animation
            if (this.disappearProgress < 1.0) {
                this.updateDisappearAnimation(dt);
            }
            return;
        }
        
        // Check if playerObject is set
        if (!this.playerObject) {
            if (!this.errorLogged) {
                console.error('[InteractiveObject] Player object not set! In the editor:', 
                    '\n1. Select the object with this component',
                    '\n2. Find "playerObject" property', 
                    '\n3. Click the target icon and select "Player" (the root player object, not EyeLeft/EyeRight/NonVrCamera)');
                this.errorLogged = true;
            }
            return;
        }
        
        // Check distance to player
        this.playerObject.getPositionWorld(this.playerPos);
        this.object.getPositionWorld(this.objectPos);

        const distance = this.calculateDistance(this.playerPos, this.objectPos);

        // Check for trigger - but only if interactions are enabled for this object
        if (!this.isTriggered && this.interactionEnabled && distance <= this.triggerDistance) {
            console.log(`[InteractiveObject] Distance ${distance.toFixed(2)}m <= trigger ${this.triggerDistance}m - Triggering!`);
            this.onPlayerApproach();
        }
        
        // Check if video should end
        if (this.isPlaying && this.videoEndTime > 0) {
            if (Date.now() >= this.videoEndTime) {
                this.onVideoEnd();
            }
        }
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = pos1[2] - pos2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    onPlayerApproach() {
        if (this.isTriggered || this.hasBeenPlayed) return;

        // Check with global interaction manager
        if (window.interactionManager) {
            if (!window.interactionManager.requestInteraction(this)) {
                // This should never happen now since disabled objects don't update
                console.log('[InteractiveObject] Interaction blocked - another video is playing');
                return;
            }
        }

        this.isTriggered = true;
        this.isPlaying = true;

        console.log('[InteractiveObject] Player approached - triggering interaction');

        // 1. Fade out ambient audio - try multiple ways to find it
        // Use cached reference if available
        if (!this.ambientAudioComponent) {
            // Try global reference first
            this.ambientAudioComponent = window.ambientAudio;

            // If not found globally, search for it in the scene
            if (!this.ambientAudioComponent) {
                console.log('[InteractiveObject] Searching for ambient-audio component in scene...');
                // Find all objects in scene and look for ambient-audio component
                const allObjects = this.engine.scene.findByName('AmbientAudio');
                if (allObjects.length > 0) {
                    this.ambientAudioComponent = allObjects[0].getComponent('ambient-audio');
                    console.log('[InteractiveObject] Found AmbientAudio object:', this.ambientAudioComponent);
                }

                // If still not found, try a broader search
                if (!this.ambientAudioComponent) {
                    // Look for any object with ambient-audio component
                    const root = this.engine.scene.root;
                    this.ambientAudioComponent = root.getComponent('ambient-audio', 1); // Search recursively
                }
            }
        }

        // Start all fades in parallel
        console.log('[InteractiveObject] Starting parallel fades (audio and lights)');

        // 1. Fade out ambient audio
        let audioFadeComplete = false;
        const audioFadeDuration = this.ambientAudioComponent ?
            (this.ambientAudioComponent.fadeOutDuration || 2.0) : 0;

        if (this.ambientAudioComponent) {
            console.log('[InteractiveObject] Starting ambient audio fade out');
            this.ambientAudioComponent.fadeOut(null, () => {
                audioFadeComplete = true;
                console.log('[InteractiveObject] Audio fade complete');
                checkAllFadesComplete();
            });
        } else {
            audioFadeComplete = true;
        }

        // 2. Fade lights (in parallel with audio)
        let lightsFadeComplete = false;
        console.log('[InteractiveObject] Starting light fades');
        this.activateSpotlight(() => {
            lightsFadeComplete = true;
            console.log('[InteractiveObject] Light fades complete');
            checkAllFadesComplete();
        });

        // Function to check if all fades are complete
        const checkAllFadesComplete = () => {
            if (audioFadeComplete && lightsFadeComplete) {
                console.log('[InteractiveObject] All fades complete, starting video');
                // 3. Start video playback after all fades complete
                this.startVideo();
            }
        };

        // If no audio component, check immediately
        if (!this.ambientAudioComponent) {
            checkAllFadesComplete();
        }
        
        // Set video end time
        this.videoEndTime = Date.now() + (this.videoDuration * 1000);
    }
    
    onVideoEnd() {
        console.log('[InteractiveObject] Video ended');

        this.isPlaying = false;
        this.hasBeenPlayed = true;

        // Notify interaction manager that we're done
        if (window.interactionManager) {
            window.interactionManager.endInteraction(this);
        }

        // 1. Fade ambient audio back in - use cached reference
        if (this.ambientAudioComponent) {
            console.log('[InteractiveObject] Fading ambient audio back in');
            this.ambientAudioComponent.fadeIn();
        }

        // 2. Stop video playback
        if (this.videoWallComponent && this.videoWallComponent.video) {
            this.videoWallComponent.video.pause();
            this.videoWallComponent.video.currentTime = 0;
            
            // Restore original video URL if we changed it
            if (this.originalVideoUrl) {
                this.videoWallComponent.videoUrl = this.originalVideoUrl;
                this.videoWallComponent.video.src = this.originalVideoUrl;
                this.originalVideoUrl = null;
            }
            
            console.log('[InteractiveObject] Video stopped and reset');
        }
        
        // 3. Deactivate spotlight and restore lights
        this.deactivateSpotlight();

        // 5. Start disappear animation
        this.disappearProgress = 0;
    }
    
    updateDisappearAnimation(dt) {
        this.disappearProgress += dt / this.disappearDuration;
        
        if (this.disappearProgress >= 1.0) {
            this.disappearProgress = 1.0;
            // Hide object completely
            this.object.setScalingLocal([0, 0, 0]);
            console.log('[InteractiveObject] Object disappeared');
            
            // Notify experience manager if exists
            this.notifyCompletion();
        } else {
            // Smooth scale down
            const scale = 1.0 - this.smoothstep(0, 1, this.disappearProgress);
            this.object.setScalingLocal([
                this.originalScale[0] * scale,
                this.originalScale[1] * scale,
                this.originalScale[2] * scale
            ]);
            
            // Optional: fade or move down
            const yOffset = this.disappearProgress * -0.5; // Sink slightly
            this.object.setPositionLocal([
                this.originalPosition[0],
                this.originalPosition[1] + yOffset,
                this.originalPosition[2]
            ]);
        }
    }
    
    activateSpotlight(onComplete) {
        console.log('[InteractiveObject] Activating spotlight and fading other lights');

        // Get all light controllers
        const lightControllers = window.lightControllers || [];

        if (lightControllers.length === 0) {
            console.warn('[InteractiveObject] No light controllers found in scene');
            if (onComplete) onComplete();
            return;
        }

        // Track fade completion for all lights
        let fadesInProgress = 0;
        let fadesCompleted = 0;

        const checkFadesComplete = () => {
            fadesCompleted++;
            if (fadesCompleted >= fadesInProgress && onComplete) {
                onComplete();
            }
        };

        // Fade out all fadeable lights, activate spotlight
        lightControllers.forEach(controller => {
            if (controller.isSpotlightForObject(this)) {
                // This is our spotlight - fade it in
                console.log('[InteractiveObject] Fading in spotlight');
                fadesInProgress++;
                controller.fadeIn(this.lightFadeInDuration, null, checkFadesComplete);
            } else if (controller.shouldFadeForObject(this)) {
                // This is a fadeable light - fade it out
                console.log('[InteractiveObject] Fading out fadeable light');
                fadesInProgress++;
                controller.fadeOut(this.lightFadeOutDuration, checkFadesComplete);
            }
            // Static lights are left alone
        });

        // If no fades were started, complete immediately
        if (fadesInProgress === 0 && onComplete) {
            onComplete();
        }
    }
    
    deactivateSpotlight() {
        console.log('[InteractiveObject] Deactivating spotlight and restoring lights');

        // Get all light controllers
        const lightControllers = window.lightControllers || [];

        if (lightControllers.length === 0) {
            return;
        }

        // Restore all lights to their original state
        lightControllers.forEach(controller => {
            if (controller.isSpotlightForObject(this)) {
                // This is our spotlight - fade it out
                console.log('[InteractiveObject] Fading out spotlight');
                controller.fadeOut(this.lightFadeOutDuration);
            } else if (controller.shouldFadeForObject(this)) {
                // This is a fadeable light - fade it back in
                console.log('[InteractiveObject] Restoring fadeable light');
                controller.fadeIn(this.lightFadeInDuration);
            }
            // Static lights are left alone
        });
    }
    
    startVideo() {
        console.log('[InteractiveObject] Starting video playback');
        
        if (this.videoWallComponent) {
            // Check if we need to override the video URL
            if (this.videoUrl && this.videoUrl.length > 0) {
                console.log(`[InteractiveObject] Overriding video URL to: ${this.videoUrl}`);
                // Store original URL to restore later
                this.originalVideoUrl = this.videoWallComponent.videoUrl;
                this.videoWallComponent.videoUrl = this.videoUrl;
                
                // Update the video source
                if (this.videoWallComponent.video) {
                    this.videoWallComponent.video.src = this.videoUrl;
                    this.videoWallComponent.video.load();
                }
            }
            
            // Start the video playback
            if (this.videoWallComponent.video) {
                // Make sure video is ready to play
                const playVideo = () => {
                    // Stop any currently playing video first
                    if (this.videoWallComponent.video.currentTime > 0 && !this.videoWallComponent.video.paused) {
                        console.log('[InteractiveObject] Stopping previous video before starting new one');
                        this.videoWallComponent.video.pause();
                    }

                    this.videoWallComponent.video.currentTime = 0;  // Reset to start
                    this.videoWallComponent.video.play().then(() => {
                        console.log(`[InteractiveObject] Video playing in ${this.room} room`);

                        // Start update loop if not already running
                        if (!this.videoWallComponent.updateLoopStarted) {
                            this.videoWallComponent.startUpdateLoop();
                        }
                    }).catch(err => {
                        console.error('[InteractiveObject] Failed to start video:', err);
                        // If video fails to start, end the interaction
                        if (window.interactionManager) {
                            window.interactionManager.endInteraction(this);
                        }
                        this.isPlaying = false;
                        this.isTriggered = false;
                    });
                };
                
                // Check if video is already loaded
                if (this.videoWallComponent.video.readyState >= 2) {
                    playVideo();
                } else {
                    // Wait for video to be ready
                    this.videoWallComponent.video.addEventListener('loadeddata', playVideo, { once: true });
                }
            } else {
                console.error('[InteractiveObject] VideoWallTiled component has no video element');
            }
            
            console.log('[InteractiveObject] Video controller activated', {
                room: this.room,
                url: this.videoUrl || 'default',
                duration: this.videoDuration
            });
        } else {
            console.warn('[InteractiveObject] No video wall component available - cannot play video');
        }
    }
    
    notifyCompletion() {
        // This will be used by experience manager to track overall progress
        if (window.interactiveObjectCompleted) {
            window.interactiveObjectCompleted(this.object.name);
        }
    }
    
    smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }
    
    // Public API
    isCompleted() {
        return this.hasBeenPlayed && this.disappearProgress >= 1.0;
    }
    
    reset() {
        this.isTriggered = false;
        this.isPlaying = false;
        this.hasBeenPlayed = false;
        this.disappearProgress = 0;
        this.videoEndTime = 0;
        this.object.setScalingLocal(this.originalScale);
        this.object.setPositionLocal(this.originalPosition);
    }

    // Called when this interaction is interrupted by another
    interrupt() {
        console.log('[InteractiveObject] Interaction interrupted:', this.object.name);
        this.isPlaying = false;
        this.isTriggered = false;
        this.videoEndTime = 0; // Cancel timer

        // Stop video if playing
        if (this.videoWallComponent && this.videoWallComponent.video) {
            this.videoWallComponent.video.pause();
            this.videoWallComponent.video.currentTime = 0;
        }

        // Restore lights but don't fade audio (new interaction will handle it)
        this.deactivateSpotlight();
    }
}
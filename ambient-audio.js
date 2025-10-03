import {Component, Property} from '@wonderlandengine/api';
import {AudioSource} from '@wonderlandengine/spatial-audio';

/**
 * Ambient Audio - Extends AudioSource with fade in/out capabilities
 *
 * This component wraps the built-in AudioSource to add:
 * - Fade in/out methods for smooth transitions
 * - Global access for InteractiveObject components
 * - Auto-start ambient loop on app launch
 *
 * Setup:
 * 1. Add to an empty object in scene (e.g., "AmbientAudio")
 * 2. Set src to your ambient loop audio file
 * 3. Configure volume and fade durations
 * 4. InteractiveObject components will control this automatically
 */
export class AmbientAudio extends AudioSource {
    static TypeName = 'ambient-audio';
    static Properties = {
        ...AudioSource.Properties,
        fadeInDuration: Property.float(2.0),
        fadeOutDuration: Property.float(1.0),
        debugMode: Property.bool(true)
    };

    init() {
        // Don't call super.init() - AudioSource doesn't have one

        // State for fading
        this.isFading = false;
        this.fadeStartVolume = this.volume;
        this.fadeTargetVolume = this.volume;
        this.fadeStartTime = 0;
        this.fadeDuration = 0;
        this.fadeInterval = null;
        this.fadeCallback = null;
        this.previousVolume = this.volume;

        // Make globally accessible for InteractiveObject components
        window.ambientAudio = this;

        console.log('[AmbientAudio] Initialized and registered at window.ambientAudio');
        console.log('[AmbientAudio] Instance:', this);
    }

    // Easing function for smooth fade perception
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    async start() {
        // Set spatial to None for ambient (non-directional) audio
        this.spatial = 0; // PanningType.None

        // Call parent start() which handles autoplay
        await super.start();

        if (this.debugMode) {
            console.log('[AmbientAudio] Started with settings:', {
                src: this.src,
                volume: this.volume,
                loop: this.loop,
                autoplay: this.autoplay,
                fadeInDuration: this.fadeInDuration,
                fadeOutDuration: this.fadeOutDuration
            });

            // Verify methods are available
            console.log('[AmbientAudio] fadeOut method available:', typeof this.fadeOut === 'function');
            console.log('[AmbientAudio] fadeIn method available:', typeof this.fadeIn === 'function');

            this.setupDebugControls();
        }
    }

    /**
     * Fade out the audio smoothly
     * @param duration Optional custom fade duration (uses fadeOutDuration by default)
     * @param onComplete Optional callback when fade completes
     */
    fadeOut(duration = null, onComplete = null) {
        const fadeDuration = duration !== null ? duration : this.fadeOutDuration;

        if (this.debugMode) {
            console.log(`[AmbientAudio] Starting manual fade out over ${fadeDuration}s`);
            console.log('[AmbientAudio] Current volume before fade:', this.volume);
        }

        // Store the current volume to restore later
        this.previousVolume = this.volume;
        this.fadeStartVolume = this.volume;
        this.fadeTargetVolume = 0.0;

        // Clear any existing fade interval
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }

        // Track fade state
        this.isFading = true;
        this.fadeStartTime = Date.now();
        this.fadeDuration = fadeDuration * 1000; // Convert to ms
        this.fadeCallback = onComplete;

        // Start the manual fade process
        const steps = 30; // Update volume 30 times per second for smooth fade
        const stepDuration = 1000 / steps; // milliseconds between updates
        const totalSteps = Math.floor(fadeDuration * steps);
        let currentStep = 0;

        this.fadeInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;

            // Use easing for smoother perception
            const easedProgress = this.easeInOutQuad(progress);

            // Calculate current volume
            const currentVolume = this.fadeStartVolume * (1 - easedProgress);

            // Apply the volume change
            this.setVolumeDuringPlayback(currentVolume, 0); // Instant change, we handle the smoothing

            if (this.debugMode && currentStep % steps === 0) {
                console.log(`[AmbientAudio] Fade progress: ${Math.round(progress * 100)}%, volume: ${currentVolume.toFixed(3)}`);
            }

            // Check if fade is complete
            if (currentStep >= totalSteps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                this.isFading = false;

                // Ensure we're at target volume
                this.setVolumeDuringPlayback(0, 0);

                if (this.debugMode) {
                    console.log('[AmbientAudio] Fade out complete');
                }

                if (this.fadeCallback) {
                    this.fadeCallback();
                    this.fadeCallback = null;
                }
            }
        }, stepDuration);
    }

    /**
     * Fade in the audio smoothly
     * @param duration Optional custom fade duration (uses fadeInDuration by default)
     * @param onComplete Optional callback when fade completes
     */
    fadeIn(duration = null, onComplete = null) {
        const fadeDuration = duration !== null ? duration : this.fadeInDuration;
        // Restore to previous volume or default volume
        const targetVolume = this.previousVolume || this.volume;

        if (this.debugMode) {
            console.log(`[AmbientAudio] Starting manual fade in to ${targetVolume} over ${fadeDuration}s`);
        }

        // Set fade parameters
        this.fadeStartVolume = 0.0;
        this.fadeTargetVolume = targetVolume;

        // Clear any existing fade interval
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }

        // Start from silence
        this.setVolumeDuringPlayback(0, 0);

        // Track fade state
        this.isFading = true;
        this.fadeStartTime = Date.now();
        this.fadeDuration = fadeDuration * 1000; // Convert to ms
        this.fadeCallback = onComplete;

        // Start the manual fade process
        const steps = 30; // Update volume 30 times per second for smooth fade
        const stepDuration = 1000 / steps; // milliseconds between updates
        const totalSteps = Math.floor(fadeDuration * steps);
        let currentStep = 0;

        this.fadeInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;

            // Use easing for smoother perception
            const easedProgress = this.easeInOutQuad(progress);

            // Calculate current volume
            const currentVolume = targetVolume * easedProgress;

            // Apply the volume change
            this.setVolumeDuringPlayback(currentVolume, 0); // Instant change, we handle the smoothing

            if (this.debugMode && currentStep % steps === 0) {
                console.log(`[AmbientAudio] Fade progress: ${Math.round(progress * 100)}%, volume: ${currentVolume.toFixed(3)}`);
            }

            // Check if fade is complete
            if (currentStep >= totalSteps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                this.isFading = false;

                // Ensure we're at target volume
                this.setVolumeDuringPlayback(targetVolume, 0);

                if (this.debugMode) {
                    console.log('[AmbientAudio] Fade in complete');
                }

                if (this.fadeCallback) {
                    this.fadeCallback();
                    this.fadeCallback = null;
                }
            }
        }, stepDuration);
    }

    /**
     * Fade to a specific volume
     * @param targetVolume Target volume (0-1)
     * @param duration Fade duration in seconds
     */
    fadeTo(targetVolume, duration) {
        targetVolume = Math.max(0, Math.min(1, targetVolume));

        if (this.debugMode) {
            console.log(`[AmbientAudio] Fading to ${targetVolume} over ${duration}s`);
        }

        this.setVolumeDuringPlayback(targetVolume, duration);

        // Track fade state
        this.isFading = true;
        this.fadeStartTime = Date.now();
        this.fadeDuration = duration * 1000;

        setTimeout(() => {
            this.isFading = false;
        }, this.fadeDuration);
    }

    setupDebugControls() {
        console.log('[AmbientAudio] Debug controls:');
        console.log('  O - Fade out (use fadeOutDuration parameter)');
        console.log('  P - Fade in (use fadeInDuration parameter)');
        console.log('  L - Toggle loop');
        console.log('  K - Play/Stop');
        console.log(`  Current fade durations: In=${this.fadeInDuration}s, Out=${this.fadeOutDuration}s`);

        this.onKeyDown = (event) => {
            if (event.code === 'KeyO' && !this.isFading) {
                this.fadeOut();
            } else if (event.code === 'KeyP' && !this.isFading) {
                this.fadeIn();
            } else if (event.code === 'KeyL') {
                // Toggle loop property
                this.loop = !this.loop;
                console.log(`[AmbientAudio] Loop toggled to: ${this.loop}`);

                // Update the actual audio element if it exists
                // AudioSource stores the audio buffer internally
                // We need to update the loop property when replaying
                if (this._audioNode) {
                    this._audioNode.loop = this.loop;
                    console.log('[AmbientAudio] Updated audio node loop property');
                }
            } else if (event.code === 'KeyK') {
                if (this.isPlaying) {
                    this.stop();
                    console.log('[AmbientAudio] Stopped');
                } else {
                    this.play();
                    console.log('[AmbientAudio] Playing');
                }
            }
        };

        window.addEventListener('keydown', this.onKeyDown);
    }

    onDestroy() {
        super.onDestroy();

        // Clear any running fade interval
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }

        // Clean up debug controls
        if (this.onKeyDown) {
            window.removeEventListener('keydown', this.onKeyDown);
        }

        // Remove global reference
        if (window.ambientAudio === this) {
            window.ambientAudio = null;
        }
    }
}
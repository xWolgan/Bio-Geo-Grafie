import {Component} from '@wonderlandengine/api';

/**
 * InteractionManager - Global manager to prevent multiple simultaneous interactions
 * Disables all other interactive objects while one is playing
 */
export class InteractionManager extends Component {
    static TypeName = 'interaction-manager';
    static Properties = {};

    init() {
        // Make this globally accessible
        window.interactionManager = this;

        this.currentInteraction = null;
        this.isInteractionActive = false;
        this.allInteractiveObjects = [];

        console.log('[InteractionManager] Initialized - managing global interactions');
    }

    /**
     * Register an interactive object with the manager
     */
    registerInteractiveObject(obj) {
        if (!this.allInteractiveObjects.includes(obj)) {
            this.allInteractiveObjects.push(obj);
            console.log('[InteractionManager] Registered interactive object:', obj.object.name);
        }
    }
    
    /**
     * Request to start an interaction
     * Disables all other objects when approved
     */
    requestInteraction(interactiveObject) {
        if (!this.isInteractionActive) {
            // No active interaction - allow and disable all others
            this.currentInteraction = interactiveObject;
            this.isInteractionActive = true;

            // Disable interaction for ALL other interactive objects
            this.allInteractiveObjects.forEach(obj => {
                if (obj !== interactiveObject) {
                    obj.interactionEnabled = false;  // Use custom flag instead of disabling component
                    console.log('[InteractionManager] Disabled interactions for:', obj.object.name);
                }
            });

            console.log('[InteractionManager] Interaction started for:', interactiveObject.object.name);
            console.log('[InteractionManager] All other objects disabled');
            return true;
        } else {
            // Should never happen now since objects are disabled
            console.log('[InteractionManager] ERROR: Interaction already active');
            return false;
        }
    }
    
    /**
     * Mark an interaction as complete
     * Re-enables all other objects
     */
    endInteraction(interactiveObject) {
        if (this.currentInteraction === interactiveObject) {
            console.log('[InteractionManager] Interaction ended for:', interactiveObject.object.name);

            // Re-enable interactions for ALL interactive objects
            this.allInteractiveObjects.forEach(obj => {
                if (obj !== interactiveObject) {  // Don't re-enable the completed one
                    obj.interactionEnabled = true;
                    console.log('[InteractionManager] Re-enabled interactions for:', obj.object.name);
                }
            });

            this.currentInteraction = null;
            this.isInteractionActive = false;
            console.log('[InteractionManager] All objects re-enabled');
        }
    }
    
    /**
     * Emergency stop (if needed)
     */
    forceStopAll() {
        if (this.currentInteraction) {
            console.log('[InteractionManager] Emergency stop - re-enabling all objects');

            // Re-enable all interactions
            this.allInteractiveObjects.forEach(obj => {
                obj.interactionEnabled = true;
            });

            this.currentInteraction = null;
            this.isInteractionActive = false;
        }
    }
    
    /**
     * Check if any interaction is currently active
     */
    isAnyInteractionActive() {
        return this.isInteractionActive;
    }
    
    /**
     * Get the currently active interaction object
     */
    getCurrentInteraction() {
        return this.currentInteraction;
    }
}
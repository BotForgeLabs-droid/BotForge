/**
 * BotForge Client-Side Telemetry & Event Analytics Bus
 * Issue #10
 *
 * Features:
 * 1. Pub/Sub event system
 * 2. Event metadata logging
 * 3. In-memory event queue
 * 4. window.BotForgeAnalytics.getLogs()
 */

class TelemetryTracker {
    constructor() {
        // Stores all analytics events in memory
        this.events = [];

        // Stores subscribers for different events
        this.subscribers = {};

        // Used to calculate session duration
        this.sessionStart = Date.now();
    }

    /**
     * Subscribe to an event
     *
     * Example:
     * BotForgeAnalytics.subscribe("user_interaction", event => {
     *     console.log(event);
     * });
     */
    subscribe(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }

        this.subscribers[eventName].push(callback);

        // Return function to unsubscribe
        return () => {
            this.subscribers[eventName] =
                this.subscribers[eventName].filter(
                    subscriber => subscriber !== callback
                );
        };
    }

    /**
     * Publish an event
     */
    publish(eventName, elementId = null, metadata = {}) {
        const event = {
            event_name: eventName,
            timestamp: new Date().toISOString(),
            element_id: elementId,
            session_duration: Date.now() - this.sessionStart,
            ...metadata
        };

        // Add event to in-memory queue
        this.events.push(event);

        // Get subscribers for this event
        const subscribers = this.subscribers[eventName] || [];

        // Notify every subscriber
        subscribers.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error(
                    "BotForge Analytics subscriber error:",
                    error
                );
            }
        });

        return event;
    }

    /**
     * Return all stored events
     */
    getLogs() {
        return [...this.events];
    }

    /**
     * Clear all stored events
     */
    clearLogs() {
        this.events = [];
    }

    /**
     * Return total number of events
     */
    getEventCount() {
        return this.events.length;
    }
}


/**
 * Create the global BotForge analytics object
 */
window.BotForgeAnalytics = new TelemetryTracker();


/**
 * Automatically track clicks/interactions
 */
document.addEventListener("click", function (event) {

    const element = event.target.closest(
        "button, a, input, select, textarea"
    );

    if (!element) {
        return;
    }

    const elementId = element.id || null;

    const elementText = element.innerText
        ? element.innerText.trim().substring(0, 100)
        : "";

    window.BotForgeAnalytics.publish(
        "user_interaction",
        elementId,
        {
            tag_name: element.tagName.toLowerCase(),
            text: elementText
        }
    );
});


/**
 * Track page load
 */
window.addEventListener("load", function () {

    window.BotForgeAnalytics.publish(
        "page_loaded",
        document.body.id || null
    );

});


/**
 * Console message
 */
console.log("BotForge Analytics initialized.");

/*!
 * Mikeotizels WebShare JS
 *
 * https://github.com/mikeotizels/websharejs
 *
 * @package   Mikeotizels/Web/Toolkit
 * @author    Michael Otieno <mikeotizels@gmail.com>
 * @copyright Copyright 2024-2026 Michael Otieno. All Rights Reserved.
 * @license   The MIT License (http://opensource.org/licenses/MIT)
 * @version   2.1.0
 */

;(() => {
    "use strict";

    /**
     * Class moWebShare
     * 
     * Utility class that provides support for invoking the native sharing 
     * mechanism of the device to share data.
     *
     * @class
     */
    window.moWebShare = class {
        /**
         * Constructor.
         * 
         * @since 2.0.0
         * @since 2.1.0 Added support for internal event listeners.
         * @since 2.1.0 Removed support for `[options.beforeShare]`.
         * 
         * @param {string}   selector            - A CSS selector string for trigger elements.
         *                                         Defaults to '[data-webshare]' if not provided.
         *                                         These elements may have at least:
         *                                         - `data-webshare-url`   specifying the URL to be shared. 
         *                                                                 (defaults to `window.location.href`)
         *                                         - `data-webshare-title` defining the title of the shared content. 
         *                                                                 (defaults to `document.title`)
         *                                         - `data-webshare-text`  providing a description or additional text
         *                                                             to accompany the shared URL.
         * @param {Object}   [options={}]        - Configuration options.
         * @param {Function} [options.onSuccess] - Callback function invoked on successful share.
         *                                         Receives the data object `{ url, title, text }` and the `trigger` element.
         * @param {Function} [options.onError]   - Callback function invoked on share failure.
         *                                         Receives the error object `{ name, message }` and the `trigger` element.
         */
        constructor(selector = "[data-webshare]", options = {}) {
            this.selector = selector;

            // @since 2.1.0 Internal event listener registry
            this._listeners = new Map();

            // Backward compatibility: support constructor callbacks
            if (typeof options.onSuccess === "function") {
                this.on("success", options.onSuccess);
            }
            if (typeof options.onError === "function") {
                this.on("error", options.onError);
            }

            // @since 2.1.0 Only initialize delegation once
            if (!window.moWebShare._isInitialized) {
                this._init();
                window.moWebShare._isInitialized = true;
            }
        }

        /**
         * Registers a callback for an event ('success' or 'error').
         * 
         * @since 2.1.0
         * 
         * @param {string}   eventName - 'success' or 'error'
         * @param {Function} callback  - function to call when event fires
         * 
         * @returns {this} for chaining
         */
        on(eventName, callback) {
            if (typeof callback !== "function") return this;

            const normalized = eventName.toLowerCase();

            if (!["success", "error"].includes(normalized)) {
                console.warn(`[moWebShare] Unsupported event: "${eventName}"`);
                return this;
            }

            if (!this._listeners.has(normalized)) {
                this._listeners.set(normalized, new Set());
            }

            this._listeners.get(normalized).add(callback);

            return this;
        }

        /**
         * Removes a callback (or all callbacks) for an event.
         * 
         * @since 2.1.0
         * 
         * @param {string}   eventName  - 'success' or 'error'
         * @param {Function} [callback] - specific callback to remove (optional)
         * 
         * @returns {this} for chaining
         */
        off(eventName, callback) {
            const normalized = eventName.toLowerCase();

            if (!this._listeners.has(normalized)) return this;

            if (typeof callback === "function") {
                this._listeners.get(normalized).delete(callback);
                if (this._listeners.get(normalized).size === 0) {
                    this._listeners.delete(normalized);
                }
            } else {
                // Remove all listeners for this event
                this._listeners.delete(normalized);
            }

            return this;
        }

        /**
         * Triggers listeners for an event.
         * 
         * @since 2.1.0
         * 
         * @internal
         */
        _emit(eventName, ...args) {
            const normalized = eventName.toLowerCase();

            if (!this._listeners.has(normalized)) return;

            // Copy set to avoid mutation-during-iteration issues
            for (const cb of [...this._listeners.get(normalized)]) {
                try {
                    cb(...args);
                } catch (error) {
                    console.error(`[moWebShare] Error in ${eventName} callback:`, error);
                }
            }
        }

        /**
         * Initializes event listeners on elements matching the defined selector
         * and then triggers the share handler.
         * 
         * @since 2.0.0
         * 
         * @private
         */
        _init() {
            // Return early if the Web Share API is not supported.
            if (!navigator.share) {
                console.warn("[moWebShare] Web Share API is not supported in this browser.");
                return;
            }

            // Return early if the page is not in secure context.
            if (!window.isSecureContext) {
                console.warn("[moWebShare] Web Share API is unavailable in insecure context.");
                return;
            }

            /**
             * Add click event listeners to all trigger elements.
             * 
             * The Web Share API requires transient activation, hence, it must 
             * be triggered off a UI event like a button click. 
             * 
             * @see https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation
             * 
             * The native Web Share API is gated by the web-share Permissions 
             * Policy. If the policy is supported but has not been granted, both 
             * share methods will indicate that the data is not shareable.
             * 
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy/web-share
             *
             * @since 1.0.0
             * @since 2.0.0 Moved code from _handleShare() method to here.
             * @since 2.0.0 Added async to the event listener.
             * @since 2.1.0 Attaches a single delegated event listener to document 
             *              instead of binding to each button.
             */
            document.addEventListener("click", async (event) => {
                // Only continue if the clicked element matches our selector
                const trigger = event.target.closest(this.selector);
                if (!trigger) return;

                // Prevent the default behavior of the element.
                event.preventDefault();

                // Set the share URL, title and text
                const url   = trigger.dataset.webshareUrl   || window.location.href,
                      title = trigger.dataset.webshareTitle || document.title || "",
                      text  = trigger.dataset.webshareText  || "";

                // Create the share data object.
                // TODO: Add support for files?
                //       @see https://w3c.github.io/web-share/#sharing-a-file
                //       Create an array of File objects representing the files.
                //       @see https://developer.mozilla.org/en-US/docs/Web/API/File
                const data = {url, title, text};

                // Validate the share data.
                //if (typeof navigator.canShare === "function") {
                    //if (!navigator.canShare(data)) {
                        //this._emit("error", (new Error("The specified data is not shareable on this browser"), trigger);
                        //return;
                    //}
                //}

                try {
                    await navigator.share(data);
                    this._emit("success", data, trigger);
                } catch (error) {
                    console.error('[moWebShare] Operation failed:', error);
                    this._emit("error", error, trigger);
                }
            }, { passive: false });
        }

        /**
         * Share wrapper.
         * 
         * @since 1.0.0
         * @since 2.0.0 Moved other code to the _init() method.
         * @since 2.0.0 Renamed from handleShare(event) to _handleShare(data).
         * @since 2.0.0 Removed async implementation; rejections bubble to the 
         *              caller's try/catch instead.
         * 
         * @param {object} data An object containing data to share. 
         *                      Must be valid data that is supported for sharing 
         *                      by the native implementation.
         * 
         * @returns promise
         * 
         * @private
         * 
         * @deprecated 2.1.0
         */
        //_handleShare(data) {
            //return navigator.share(data);
        //}
    }
})();

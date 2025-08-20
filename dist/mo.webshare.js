/*!
 * Mikeotizels WebShare JS
 * 
 * https://github.com/mikeotizels/websharejs
 * 
 * @category  Web API
 * @package   Mikeotizels/Web/Toolkit
 * @author    Michael Otieno <mikeotizels@gmail.com>
 * @copyright Copyright 2024-2025 Michael Otieno. All Rights Reserved.
 * @license   The MIT License (http://opensource.org/licenses/MIT)
 * @since     2.0.0
 * @version   2.0.0
 */

;(() => {
    "use strict";

    /**
     * Class moWebShare
     * 
     * Utility class that provides support for invoking the native sharing 
     * mechanism of the device to share data.
     * 
     * @since 2.0.0
     *
     * @class
     */
    class moWebShare {
        /**
         * Constructor.
         * 
         * @since 2.0.0
         * 
         * @param {string}   selector              - A CSS selector string for trigger elements.
         *                                           Defaults to '[data-webshare]' if not provided.
         *                                           These elements may have at least:
         *                                           - `data-webshare-url`   specifying the URL to be shared. 
         *                                                                   (defaults to `window.location.href`)
         *                                           - `data-webshare-title` defining the title of the shared content. 
         *                                                                   (defaults to `document.title`)
         *                                           - `data-webshare-text`  providing a description or additional text
         *                                                               to accompany the shared URL.
         * @param {Object}   [options={}]          - Configuration options.
         * @param {Function} [options.beforeShare] - Callback function invoked before trying to share.
         *                                           Receives the data object `{ url, title, text }` and the `trigger` element.
         *                                           Defaults to `console.log()`
         * @param {Function} [options.success]     - Callback function invoked on successful share.
         *                                           Receives the data object `{ url, title, text }` and the `trigger` element.
         *                                           Defaults to `console.info()`
         * @param {Function} [options.error]       - Callback function invoked on share failure.
         *                                           Receives the error object `{ name, message }` and the `trigger` element. 
         *                                           Defaults to `console.error()`.
         */
        constructor(selector, options = {}) {
            // Selector for trigger elements.
            this.selector = selector || "[data-webshare]";

            // Options for callback events.
            this.options = options;

            // Callback function for before share event
            this.beforeShare = typeof this.options.beforeShare === "function"
                ? this.options.beforeShare
                : (data, trigger) => console.log("[moWebShare] Native share triggered.", { data, trigger: trigger });
            
            // Callback function for success event
            this.success = typeof this.options.success === "function"
                ? this.options.success
                : (data, trigger) => console.info("[moWebShare] Native share executed.", { data, trigger: trigger });
            
            // Callback function for error event
            this.error = typeof this.options.error === "function"
                ? this.options.error
                : (error, trigger) => console.error("[moWebShare] Native share failed.", error, { trigger: trigger });
            
            // Initialize the plugin.
            this._init();
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
            // Select all elements that should trigger the Web Share API.
            const triggers = document.querySelectorAll(this.selector);

            // Return early if no trigger element is found in the current DOM.
            if (!triggers.length) {
                return;
            }

            // Hide all trigger elements and return early if the page is not in 
            // secure context.
            if (!window.isSecureContext) {
                triggers.forEach(trigger => {
                    trigger.setAttribute("hidden", true);
                });
                console.warn("[moWebShare] Web Share API is unavailable in insecure context.");
                return;
            }

            // Hide all trigger elements and return early if the Web Share API 
            // is not supported.
            if (!navigator.share) {
                triggers.forEach(trigger => {
                    trigger.setAttribute("hidden", true);
                });
                console.warn("[moWebShare] Web Share API is not supported in this browser.");
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
             * 
             * @todo Attach a single delegated listener to `document` instead 
             *       of binding to each trigger element.
             */ 
            triggers.forEach((trigger) => {
                // Arrow function keeps `this` bound to the instance.
                trigger.addEventListener("click", async (event) => {
                    // Prevent the default behavior of the element.
                    event.preventDefault();

                    // Set the share URL, title and text
                    const shareUrl   = trigger.dataset.webshareUrl   || window.location.href;
                    const shareTitle = trigger.dataset.webshareTitle || document.title || "";
                    const shareText  = trigger.dataset.webshareText  || "";

                    // Create the share data object.                
                    // TODO: Add support for files.
                    //       @see https://w3c.github.io/web-share/#sharing-a-file
                    //       Create an array of File objects representing the files.
                    //       @see https://developer.mozilla.org/en-US/docs/Web/API/File
                    const shareData = {
                        url: shareUrl,
                        title: shareTitle,
                        text: shareText
                    };

                    // Handle before share event
                    this.beforeShare(shareData, trigger);

                    // Validate the share data.
                    if (typeof navigator.canShare === "function") {
                        if (!navigator.canShare(shareData)) {
                            this.error("The specified data is not shareable on this browser.", trigger);
                            return;
                        }
                    }
                
                    try {
                        await this._handleShare(shareData);
                        this.success(shareData, trigger);
                    } catch (error) {
                        this.error(error, trigger);
                    }
                });
            });
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
         */
        _handleShare(data) {
            return navigator.share(data);
        }
    }
    
    // Expose the moWebShare class globally.
    window.moWebShare = moWebShare;
})();

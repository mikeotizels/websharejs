/*! 
 * Mikeotizels WebShare JS v1.0.0
 * Copyright 2024 Michael Otieno
 * Licensed under MIT 
 */

;(function (window, document, navigator) {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        /**
         * --------------------------------------------------------------------
         * Provides support for invoking the native sharing mechanism of the 
         * device to share data.
         * 
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
         * 
         * DATA-API 
         * 
         * Trigger:
         * 
         * - data-toggle="webshare" Selector for Web Share trigger elements.
         * 
         * Properties:
         * 
         * - data-url   A URL string (defaults to `window.location.href`).
         * - data-title A share title (defaults to `document.title`).
         * - data-text  Arbitrary text for the body of the message.
         * --------------------------------------------------------------------
         */
        var moWebShare = function() {
            // Select all elements that should trigger the Web Share API.
            const triggers = document.querySelectorAll('[data-toggle="webshare"]');

            // Return early if no trigger element is found.
            if (!triggers.length) {
                return;
            }
            
            // Hide all triggers initially
            triggers.forEach(trigger => {
                trigger.setAttribute("hidden", true);
            });

            // Hide all Web Share trigger elements and return early if the Web 
            // Share API is not supported.
            if (!navigator.share) {
                console.warn("Web Share API is not supported in this browser.");
                return;
            }

            // Show all triggers if Web Share API is supported
            triggers.forEach(trigger => {
                trigger.removeAttribute("hidden");
            });

            /**
             * Asynchronously handles click events for Web Share triggers.
             * 
             * @since 1.0.0
             */
            const handleShare = async (event) => {
                const target = event.currentTarget;

                // Get the URL, title and text data, if available.
                const shareUrl   = target.dataset.url   || window.location.href;
                const shareTitle = target.dataset.title || document.title;
                const shareText  = target.dataset.text  || "";

                // Create the share data object.     
                const shareData = {
                    url: shareUrl,
                    title: shareTitle,
                    text: shareText
                };

                // Validate the share data.
                if (typeof navigator.canShare === "function") {
                    if (!navigator.canShare(shareData)) {
                        console.error("The Web Share API cannot share the specified data on this browser.");
                        return;
                    }
                }
                
                // Try invoking the Web Share API.
                try {
                    await navigator.share(shareData);
                    console.log("The Web Share API invoked with share data:", shareData);
                } catch (error) {
                    console.error("The Web Share API failed to execute:", error);
                }
            };

            /**
             * Adds click event listeners to all trigger elements.
             * 
             * The Web Share API requires transient activation, hence, it must 
             * be triggered off a UI event like a button click. Further, the 
             * method must specify valid data that is supported for sharing by 
             * the native implementation.
             * 
             * @see https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation
             * 
             * The native Web Share API is gated by the web-share Permissions 
             * Policy. If the policy is supported but has not been granted, both 
             * share methods will indicate that the data is not shareable.
             * 
             * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy/web-share
             */
            triggers.forEach(trigger => {
                trigger.addEventListener("click", handleShare);
            });
        }();
    });
})(window, document, navigator);
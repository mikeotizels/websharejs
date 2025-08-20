Mikeotizels WebShare JS
=======================

Version 2.0.0 - July 2025

**Mikeotizels WebShare** is a lightweight utility script that enables seamless 
integration with the native [Web Share API][1]. It provides the interface for 
sharing text, links, and other content through the operating system's built-in 
sharing mechanisms. Designed for modern browsers, WebShare offers a simple way 
to invoke native share dialogs, allowing users to choose their preferred share 
targets such as messaging apps, email, or social platforms.

This approach provides a number of benefits over conventional methods:

- User-friendly share dialogs.
- The user is presented with a wide range of options for sharing content 
  compared to the limited number you might have in your DIY implementation.
- Users can customize their preferred share targets on their own device instead 
  of being limited to just the predefined options.

## Usage

1. **Load the Script**  

Simply include or bundle the script with your project.

Example:

```html
<script src="/assets/vendor/mikeotizels/dist/js/mo.webshare.min.js"></script>
```

2. **Mark Up Your HTML** 

For an element to work with the plugin, add one or more of the following data
attributes:

Triggers:

- *data-webshare* (default): Flag to register element with plugin. You can pass
  any selector you like to the class constructor when initializing the plugin.

Properties:

Properties that are unknown to the user agent are ignored; the share data is 
only assessed on properties understood by the user agent. All properties are 
optional but at least one known data property must be specified.

The supported data attributes for the known properties include:

- *data-webshare-url* (optional): Specifies the URL to be shared. 
   Defaults to `window.location.href` if empty.

- *data-webshare-title* (optional): Defines the title of the shared content. 
   Defaults to `document.title` if empty.

- *data-webshare-text* (optional): Provides a description or additional text to 
   accompany the shared URL. 

```html
<button type="button" class="btn btn-webshare" aria-label="WebShare" 
    data-webshare-url="http://example.com/page" 
    data-webshare-title="Example Page" 
    data-webshare-text="Hi%2C+please+check+out+this+link%3A+http%3A%2F%2Fexample.com%2Fpage">
    Share
</button>
```

3. **Set Up the Script**  

After the DOM is ready, initialize the class and optionally provide callback 
functions:

```js
var webShareSetup = function() {
    // Return early if the moWebShare object is undefined.
    if (typeof moWebShare === 'undefined') {
        console.error('Mikeotizels WebShare JS is not loaded on the page.');
        // TODO: Optionally, hide the webshare trigger elements if the 
        //       handler script is not available.
        return;
    }

    // Instantiate object
    const webshare = new moWebShare('.btn-webshare', {
        // Before share callback
        //beforeShare: (data, trigger) => {
            //console.info('Web Share API invoked with data:', data);
        //}
        // Success callback
        //success: (data, trigger) => {
            //console.info('Web Share API executed with data:', data);
        //},
        // Error callback
        //error: (error, trigger) => {
            //console.error('Web Share API failed with error:', error);
            // TODO: Show a generic error message to the user or
            //       show label "Error" on trigger element then reset
            //       the element after 3000 ms.
        //}
    });
}();
```

---

### Events

There are cases where you'd like to show some user feedback or capture what has 
been shared after invoking the native share.

That's why custom events are fired, such as beforeShare, success, and error for 
you to listen and implement your custom logic.

- **`beforeShare`**

    - Called before executing the `navigator.share()` method
    - Receives the data object `{ url, title, text }` and the `trigger` 
      element. 
    - Defaults to `console.log()`

- **`success`**

	- Called on successful `navigator.share()` execution.
    - Receives the data object `{ url, title, text }` and the `trigger` 
      element 
    - Defaults to `console.info()`

- **`error`**

	- Called when the `navigator.share()` method fails to execute.
    - Receives the error object `{ name, message }` and the `trigger` element
    - Defaults to `console.error()`

For a live demo of the default callback functions, just open your console.

---

## Browser Support

| Browser                  | Support Status    |
|--------------------------|-------------------|
| Chrome (Desktop/Android) | ✅ Full (v61+)   |
| Edge (Chromium)          | ✅ Full (v79+)   |
| Safari (iOS/macOS)       | ✅ Full (v12.1+) |
| Firefox                  | ❌ Not supported |
| Opera                    | ✅ Full (v48+)   |
| Samsung Internet         | ✅ Full (v8.2+)  |
| IE                       | ❌ Not supported |

Source: [Can I Use – Web Share API](https://caniuse.com/web-share)

---

## Additional Considerations

- **Security & Environment:**

	- The Web Share API is available only in [secure contexts][2] (HTTPS), in 
	  some or all supporting browsers. 

	- The Web Share API requires [transient activation][3], hence, it must be 
	  triggered off a UI event like a button click.

	- The Web Share API is gated by the [web-share Permissions Policy][4]. 
	  If the policy is supported but has not been granted, the canShare method 
	  will indicate that the data is not shareable.

    - The Mikeotizels WebShare script automatically hides all the bound trigger 
      elements from the UI when the current page is not in secure context or if 
      the browser does not support the Web Share API. You may consider adding a 
      graceful fallback (e.g., copy to clipboard) for unsupported browsers.

---

## Licensing

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file 
for the license terms.

-------------------------------------------------------------------------------

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
[2]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
[3]: https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation
[4]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy/web-share

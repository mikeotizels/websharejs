Mikeotizels WebShare JS
=======================

Version 1.0.0 - December 2024

Mikeotizels WebShare is a lightweight JavaScript utility that invokes the native 
Web Share API which provides a mechanism for sharing URL and text to an arbitrary 
target selected by the user, utilizing the sharing mechanisms of the underlying 
operating system.

The available share targets depend on the device, but typically include the 
clipboard, email, contacts, or messaging applications.

Note that the Web Share API may be available only in secure contexts (HTTPS), 
in some or all supporting browsers. Additionally, the API requires transient 
activation, hence, it must be triggered off a UI event like a button click.

---

### **How to Use**

1. **Include the Script**  

Simply include or bundle the script with your project.

```html
<script src="/path/to/mo.webshare.min.js"></script>
```

2. **Markup the HTML** 

For an element to work with the plugin, add one or more of the following data
attributes:

- data-toggle="webshare": Selector for Web Share trigger elements.
- data-url: A URL string (defaults to `window.location.href`)
- data-title: A share title (defaults to `document.title`).
- data-text: Arbitrary text for the body of the message.

```html
<button type="button" class="btn btn-webshare" data-toggle="webshare" 
    data-url="http://example.com/page" 
    data-title="Example Page" 
    data-text="Hi%2C+please+check+out+this+link%3A+http%3A%2F%2Fexample.com%2Fpage">
    Toggle WebShare
</button>
```
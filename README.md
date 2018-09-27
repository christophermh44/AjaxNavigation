# AjaxNavigation
Make your website navigation full-Ajax. Useful when you want to keep some resources active while navigating (like audio or video). 

## Requirements

This script directly uses [Pace.js](http://github.hubspot.com/pace/docs/welcome/)

## Setup

It is recommended to init Pace before everything:

```javascript
window.paceOptions = {
    ajax: {
        trackMethods: ['GET', 'POST', 'PUT', 'DELETE', 'REMOVE']
    },
    restartOnRequestAfter: true
};
```

Then, you can call Ajax-navigation when your page is ready to use:

```javascript
window.addEventListener('load', function() {
		var nav = new AjaxNavigation({
			beforeLoad: function() {
        // You can change your favicon here to indicates that the page is loading…
        // This is the equivalent of beforeUnload, but you cannot prevent it for now.
			},
			afterLoad: function() {
				// You can now restore your favicon and initialize everything else (like JS frameworks, event binds, service workers registering, …)
      }
    });
});
```

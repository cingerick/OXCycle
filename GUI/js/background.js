chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    outerBounds: {
      top: 0,
      left: 0,
      width: 900,
      height: 650
    }
  });
})
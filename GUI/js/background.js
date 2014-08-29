chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    outerBounds: {
      top: 0,
      left: 0,
      width: 1500,
      height: 1000
    }
    //state:"fullscreen"
  });
})

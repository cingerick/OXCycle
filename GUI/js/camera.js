  $(function() {

    //////////////////////////////////
     var streaming = false,
      video        = document.querySelector('#video'),
      canvas       = document.querySelector('#canvas'),
      photo        = document.querySelector('#photo'),
      startbutton  = document.querySelector('#startbutton'),
      width = 520,
      height = 0;

  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia(
    {
      video: true,
      audio: false
    },
    function(stream) {
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
      }
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  function takepicture() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL('image/png');
var blb;

canvas.toBlob(function(blob) { 
  blb=blob;
});                      

    chrome.fileSystem.getWritableEntry(writeDirectory, function(entry) {
      var d = new Date();
    var df = d.getMonth()+'-'+d.getDate()+'-'+d.getYear()+' '+(d.getHours())+'_'+d.getMinutes()+'.png';


      entry.getDirectory('testing', {create:true}, function(direntry) {

        });
        entry.getFile(df, {create:true}, function(fileentry) {
            fileentry.createWriter(function(writer) {
                writer.write(blb);
            });
        });
    });


  }

  startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
  }, false);

});



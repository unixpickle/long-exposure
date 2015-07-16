(function() {

  var cancelFunc = null;
  var imageData = null;
  var EXPOSE_TIME = 10;
  var lastTime = null;

  function startCapture() {
    window.getStream(function(err, stream) {
      if (err) {
        alert(err);
        return;
      }
      var video = document.getElementById('video');
      window.playStream(video, stream, function(err) {
        lastTime = new Date().getTime();
        if (err) {
          alert(err);
          return;
        }
        cancelFunc = window.getFrames(video, handleFrame);
      });
    });
  }

  function stopCapture() {
    cancelFunc();
  }

  function handleFrame(data, width, height) {
    var now = new Date().getTime();
    var frameTime = (now - lastTime) / 1000;
    lastTime = now;
    if (!imageData) {
      imageData = new Float64Array(width*height*3);
    }
    for (var i = 0, len = data.length; i < len; ++i) {
      imageData[i] = Math.min(255, imageData[i]+(frameTime/EXPOSE_TIME)*data[i]);
    }
    var canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var ctxData = ctx.getImageData(0, 0, width, height);
    for (var i = 0, len = imageData.length; i < len; ++i) {
      ctxData.data[i] = Math.round(imageData[i]);
    }
    ctx.putImageData(ctxData, 0, 0);
  }

  window.addEventListener('load', function() {
    var startStop = document.getElementById('start-stop');
    startStop.onclick = function(){
      if (startStop.innerText === 'Start') {
        startCapture();
        startStop.innerText = 'Stop';
      } else {
        stopCapture();
        startStop.innerText = 'Start';
      }
    };
  });

})();

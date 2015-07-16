(function() {
  
  window.getStream = function(cb) {
    var keys = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia',
      'msGetUserMedia'];
    var getUserMedia = null;
    for (var i = 0, len = keys.length; i < len; ++i) {
      var key = keys[i];
      getUserMedia = navigator[key];
      if (getUserMedia) {
        break;
      }
    }
    if (!getUserMedia) {
      setTimeout(function() {
        cb('Camera unavailable', null);
      }, 10);
      return;
    }
    getUserMedia.call(navigator, {video: true, audio: false}, function(stream) {
      cb(null, stream);
    }, function(error) {
      cb(error || 'Unknown error', null);
    });
  };
  
  window.playStream = function(videoTag, stream, cb) {
    videoTag.src = (window.URL ? window.URL.createObjectURL(stream) : stream);
    videoTag.play();
    videoTag.addEventListener('canplay', function() {
      if (cb) {
        cb(null);
        cb = null;
      }
    });
    videoTag.addEventListener('error', function(error) {
      if (cb) {
        cb(error || 'Unknown error');
        cb = null;
      }
    });
  };
  
  window.getFrames = function(videoTag, cb) {
    var canvas = document.createElement('canvas');
    var width = videoTag.videoWidth;
    var height = videoTag.videoHeight;
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var intervalId = null;
    var cancelFunc = function() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    var intervalFunc = function() {
      if (videoTag.paused || videoTag.ended) {
        cancelFunc();
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(videoTag, 0, 0, width, height);
      cb(ctx.getImageData(0, 0, width, height).data, width, height);
    };
    intervalId = setInterval(intervalFunc, 100);
    return cancelFunc;
  };
  
})();

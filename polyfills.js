// polyfills.js
// requestAnimationFrame shim
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                                  window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }
})();

// classList polyfill for IE9+
(function () {
  if ('classList' in document.documentElement) return;
  Object.defineProperty(Element.prototype, 'classList', {
    get: function () {
      var self = this;
      function update(fn) {
        return function (value) {
          var classes = self.className.split(/\s+/), index = classes.indexOf(value);
          fn(classes, index, value);
          self.className = classes.join(' ');
        };
      }
      return {
        add: update(function (classes, index, value) { if (index === -1) classes.push(value); }),
        remove: update(function (classes, index) { if (index !== -1) classes.splice(index, 1); }),
        toggle: update(function (classes, index, value) { if (index === -1) { classes.push(value); } else { classes.splice(index, 1); } }),
        contains: function (value) { return self.className.split(/\s+/).indexOf(value) !== -1; }
      };
    }
  });
})();

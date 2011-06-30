wysihtml5.utils.trim = (function() {
  var WHITE_SPACE_START = /^\s+/,
      WHITE_SPACE_END   = /\s+$/;
  return function(str) {
    str.replace(WHITE_SPACE_START, "").replace(WHITE_SPACE_END, "");
  };
})();
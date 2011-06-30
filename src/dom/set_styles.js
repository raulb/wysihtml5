wysihtml5.dom.setStyles = function(styles) {
  var styleMapping = {
    styleFloat: "cssFloat",
    "float":    "cssFloat" 
  };
  return {
    on: function(element) {
      for (var i in styles) {
        i = styleMapping[i] || i;
        element.style[i] = styles[i];
      }
    }
  };
};
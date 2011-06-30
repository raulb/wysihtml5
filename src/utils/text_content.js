(function(api) {
  var documentElement = document.documentElement;
  if ("textContent" in documentElement) {
    api.setTextContent = function(element, text) {
      element.textContent = text;
    };

    api.getTextContent = function(element) {
      return element.textContent;
    };
  } else if ("innerText" in documentElement) {
    api.setTextContent = function(element, text) {
      element.innerText = text;
    };

    api.getTextContent = function(element) {
      return element.innerText;
    };
  } else {
    api.setTextContent = function(element, text) {
      element.nodeValue = text;
    };

    api.getTextContent = function(element) {
      return element.nodeValue;
    };
  }
})(wysihtml5.utils);


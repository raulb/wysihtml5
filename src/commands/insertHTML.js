(function(wysihtml5) {
  var undef;
  
  wysihtml5.commands.insertHTML = {
    exec: function(element, command, html) {
      if (wysihtml5.commands.support(element, command)) {
        element.ownerDocument.execCommand(command, false, html);
      } else {
        wysihtml5.utils.caret.insertHTML(element.ownerDocument, html);
      }
    },

    state: function() {
      return false;
    },

    value: function() {
      return undef;
    }
  };
})(wysihtml5);
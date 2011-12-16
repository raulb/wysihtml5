(function(wysihtml5) {
  var undef;

  wysihtml5.commands.insertUnorderedList = {
    exec: function(element, command) {
      var doc = element.ownerDocument,
          selectedNode,
          isEmpty,
          tempElement,
          list;

      if (wysihtml5.commands.support(element, command)) {
        doc.execCommand(command, false, null);
      } else {
        selectedNode = wysihtml5.selection.getSelectedNode(doc);
        list = wysihtml5.dom.getParentElement(selectedNode, { nodeName: ["UL", "OL"] });

        if (!list) {
          tempElement = doc.createElement("span");
          wysihtml5.selection.surround(tempElement);
          isEmpty = tempElement.innerHTML === "" || tempElement.innerHTML === wysihtml5.INVISIBLE_SPACE;
          wysihtml5.selection.executeAndRestoreSimple(doc, function() {
            list = wysihtml5.dom.convertToList(tempElement, "ul");
          });

          if (isEmpty) {
            wysihtml5.selection.selectNode(list.querySelector("li"));
          }
          return;
        }

        wysihtml5.selection.executeAndRestoreSimple(doc, function() {
          if (list.nodeName === "UL") {
            // Unwrap list
            // <ul><li>foo</li><li>bar</li></ul>
            // becomes:
            // foo<br>bar<br>
            wysihtml5.dom.resolveList(list);
          } else if (list.nodeName === "OL" || list.nodeName === "MENU") {
            // Turn an ordered list into an unordered list
            // <ol><li>foo</li><li>bar</li></ol>
            // becomes:
            // <ul><li>foo</li><li>bar</li></ul>
            wysihtml5.dom.renameElement(list, "ul");
          }
        });
      }
    },

    state: function(element, command) {
      try {
        return element.ownerDocument.queryCommandState(command);
      } catch(e) {
        return false;
      }
    },

    value: function() {
      return undef;
    }
  };
})(wysihtml5);
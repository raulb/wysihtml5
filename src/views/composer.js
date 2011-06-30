(function(wysihtml5) {
  "use strict";
  
  wysihtml5.views.Composer = Class.create(wysihtml5.views.View, 
    /** @scope wysihtml5.views.Composer.prototype */ {
    name: "composer",

    // Needed for firefox in order to display a proper caret in an empty contentEditable
    CARET_HACK: "<br>",

    initialize: function($super, parent, textareaElement, config) {
      $super(parent, textareaElement, config);
      this.textarea = this.parent.textarea;
      this._initSandbox();
    },

    clear: function() {
      this.element.innerHTML = wysihtml5.browser.displaysCaretInEmptyContentEditableCorrectly() ? "" : this.CARET_HACK;
    },

    getValue: function(parse) {
      var value = this.isEmpty() ? "" : this.element.innerHTML;
      if (parse) {
        value = this.parent.parse(value);
      }

      // Replace all "zero width no breaking space" chars
      // which are used as hacks to enable some functionalities
      // Also remove all CARET hacks that somehow got left
      value = value
        .replace(new RegExp(wysihtml5.INVISIBLE_SPACE, "g"), "")
        .replace(new RegExp(RegExp.escape(wysihtml5.utils.caret.PLACEHOLDER_TEXT), "g"), "");

      return value;
    },

    setValue: function(html, parse) {
      if (parse) {
        html = this.parent.parse(html);
      }
      this.element.innerHTML = html;
    },

    show: function() {
      this.iframe.style.display = this._displayStyle || "";

      // Firefox needs this, otherwise contentEditable becomes uneditable
      this.disable();
      this.enable();
    },

    hide: function() {
      this._displayStyle = wysihtml5.dom.getStyle("display").from(this.iframe);
      if (this._displayStyle === "none") {
        this._displayStyle = null;
      }
      this.iframe.hide();
    },

    disable: function($super) {
      this.element.removeAttribute("contentEditable");
      $super();
    },

    enable: function($super) {
      this.element.setAttribute("contentEditable", "true");
      $super();
    },

    getTextContent: function() {
      return wysihtml5.utils.getTextContent(this.element);
    },

    hasPlaceholderSet: function() {
      return this.getTextContent() == this.textarea.element.readAttribute("placeholder");
    },

    isEmpty: function() {
      var innerHTML               = this.element.innerHTML,
          elementsWithVisualValue = "blockquote, ul, ol, img, embed, object, table, iframe, svg, video, audio, button, input, select, textarea";
      return innerHTML === ""              || 
             innerHTML === this.CARET_HACK ||
             this.hasPlaceholderSet()      ||
             (this.getTextContent() === "" && !this.element.querySelector(elementsWithVisualValue));
    },

    _initSandbox: function() {
      this.sandbox = new wysihtml5.utils.Sandbox(this._create.bind(this), {
        stylesheets:  this.config.stylesheets,
        uaCompatible: "IE=7"
      });
      this.iframe  = this.sandbox.getIframe();

      // Create hidden field which tells the server after submit, that the user used an wysiwyg editor
      var hiddenField = document.createElement("input");
      hiddenField.type   = "hidden";
      hiddenField.name   = "_wysihtml5_mode";
      hiddenField.value  = 1;

      // Store reference to current wysihtml5 instance on the textarea element
      var textareaElement = this.textarea.element;
      wysihtml5.dom.insert(this.iframe).after(textareaElement);
      wysihtml5.dom.insert(hiddenField).after(textareaElement);
    },

    _create: function() {
      this.element            = this.sandbox.getDocument().body;
      this.textarea           = this.parent.textarea;
      this.element.innerHTML  = this.textarea.getValue(true);
      this.enable();

      // Make sure that our external range library is initialized
      window.rangy.init();

      wysihtml5.utils.copyAttributes(
        "className", "spellcheck", "title", "lang", "dir", "accessKey"
      ).from(this.textarea.element).to(this.element);

      Element.addClassName(this.element, this.config.composerClassName);

      // Make the editor look like the original textarea, by syncing styles
      if (this.config.style) {
        this.style();
      }

      this.observe();

      var name = this.config.name;
      if (name) {
        Element.addClassName(this.element, name);
        Element.addClassName(this.iframe, name);
      }

      // Simulate html5 placeholder attribute on contentEditable element
      var placeholderText = typeof(this.config.placeholder) === "string"
        ? this.config.placeholder
        : this.textarea.element.getAttribute("placeholder");
      if (placeholderText) {
        wysihtml5.utils.simulatePlaceholder(this.parent, this, placeholderText);
      }

      // Make sure that the browser avoids using inline styles whenever possible
      wysihtml5.commands.exec(this.element, "styleWithCSS", false);

      this._initAutoLinking();
      this._initObjectResizing();

      // Simulate html5 autofocus on contentEditable element
      if (this.textarea.element.hasAttribute("autofocus") || document.querySelector(":focus") == this.textarea.element) {
        wysihtml5.utils.autoFocus(this);
      }

      // IE and Opera insert paragraphs on return instead of line breaks
      if (!wysihtml5.browser.insertsLineBreaksOnReturn()) {
        wysihtml5.quirks.insertLineBreakOnReturn(this.element);
      }

      // IE sometimes leaves a single paragraph, which can't be removed by the user
      if (!wysihtml5.browser.clearsContentEditableCorrectly()) {
        wysihtml5.quirks.ensureProperClearing(this.element);
      }

      if (!wysihtml5.browser.clearsListsInContentEditableCorrectly()) {
        wysihtml5.quirks.ensureProperClearingOfLists(this.element);
      }

      // Set up a sync that makes sure that textarea and editor have the same content
      if (this.initSync && this.config.sync) {
        this.initSync();
      }

      // Okay hide the textarea, we are ready to go
      this.textarea.hide();

      // Fire global (before-)load event
      this.parent.fire("beforeload").fire("load");
    },

    _initAutoLinking: function() {
      var supportsDisablingOfAutoLinking = wysihtml5.browser.canDisableAutoLinking(),
          supportsAutoLinking            = wysihtml5.browser.doesAutoLinkingInContentEditable();
      if (supportsDisablingOfAutoLinking) {
        wysihtml5.commands.exec(this.element, "autoUrlDetect", false);
      }

      if (!this.config.autoLink) {
        return;
      }

      var sandboxDoc = this.sandbox.getDocument();

      // Only do the auto linking by ourselves when the browser doesn't support auto linking
      // OR when he supports auto linking but we were able to turn it off (IE9+)
      if (!supportsAutoLinking || (supportsAutoLinking && supportsDisablingOfAutoLinking)) {
        this.parent.observe("newword:composer", function() {
          wysihtml5.utils.caret.executeAndRestore(sandboxDoc, function(startContainer, endContainer) {
            wysihtml5.utils.autoLink(endContainer.parentNode);
          });
        }.bind(this));
      }

      // Assuming we have the following:
      //  <a href="http://www.google.de">http://www.google.de</a>
      // If a user now changes the url in the innerHTML we want to make sure that
      // it's synchronized with the href attribute (as long as the innerHTML is still a url)
      var // Use a live NodeList to check whether there are any links in the document
          links           = sandboxDoc.getElementsByTagName("a"),
          // The autoLink helper method reveals a reg exp to detect correct urls
          urlRegExp       = wysihtml5.utils.autoLink.URL_REG_EXP,
          getTextContent  = function(element) {
            var textContent = wysihtml5.utils.getTextContent(element).strip();
            if (textContent.substr(0, 4) === "www.") {
              textContent = "http://" + textContent;
            }
            return textContent;
          };

      wysihtml5.utils.observe(this.element, "keydown", function(event) {
        if (!links.length) {
          return;
        }

        var selectedNode = wysihtml5.utils.caret.getSelectedNode(event.target.ownerDocument),
            link         = wysihtml5.utils.getParentElement(selectedNode, { nodeName: "A" }, 4),
            textContent;

        if (!link) {
          return;
        }

        textContent = getTextContent(link);
        // keydown is fired before the actual content is changed
        // therefore we set a timeout to change the href
        setTimeout(function() {
          var newTextContent = getTextContent(link);
          if (newTextContent === textContent) {
            return;
          }

          // Only set href when new href looks like a valid url
          if (newTextContent.match(urlRegExp)) {
            link.setAttribute("href", newTextContent);
          }
        }, 0);
      });
    },

    _initObjectResizing: function() {
      wysihtml5.commands.exec(this.element, "enableObjectResizing", this.config.allowObjectResizing);

      if (this.config.allowObjectResizing) {
        if (wysihtml5.browser.supportsEvent("resizeend")) {
          wysihtml5.utils.observe(this.element, "resizeend", function(event) {
            var target      = event.target || event.srcElement;
            ["width", "height"].each(function(property) {
              if (target.style[property]) {
                target.setAttribute(property, parseInt(target.style[property], 10));
                target.style[property] = "";
              }
            });
            // After resizing IE sometimes forgets to remove the old resize handles
            wysihtml5.quirks.redraw(this.element);
          }.bind(this));
        }
      } else {
        if (wysihtml5.browser.supportsEvent("resizestart")) {
          wysihtml5.utils.observe(this.element, "resizestart", function(event) {
            event.preventDefault();
          });
        }
      }
    }
  });
})(wysihtml5);
module("wysihtml5.dom.convertToList", {
  equals: function(actual, expected, message) {
    return wysihtml5.assert.htmlEquals(actual, expected, message);
  },

  convertToList: function(html, type) {
    var container = wysihtml5.dom.getAsDom(html);
    document.body.appendChild(container);
    wysihtml5.dom.convertToList(container.firstChild, type);
    var innerHTML = container.innerHTML;
    container.parentNode.removeChild(container);
    return innerHTML;
  }
});

test("Basic tests for UL", function() {
  this.equals(
    this.convertToList("<div>foo</div>", "ul"),
    "<ul><li>foo</li></ul>"
  );

  this.equals(
    this.convertToList("<span></span>", "ul"),
    "<ul></ul>"
  );

  this.equals(
    this.convertToList("<span>foo<br>bar</span>", "ul"),
    "<ul><li>foo</li><li>bar</li></ul>"
  );

  this.equals(
    this.convertToList("<span>foo<br>bar<div>baz</div></span>", "ul"),
    "<ul><li>foo</li><li>bar</li><li><div>baz</div></li></ul>"
  );

  this.equals(
    this.convertToList("<span><div></div><h1></h1><p>yeah</p></span>", "ul"),
    "<ul><li><div></div></li><li><h1></h1></li><li><p>yeah</p></li></ul>"
  );
});

test("Basic tests for OL", function() {
  this.equals(
    this.convertToList("<div>foo</div>", "ol"),
    "<ol><li>foo</li></ol>"
  );

  this.equals(
    this.convertToList("<span></span>", "ol"),
    "<ol></ol>"
  );

  this.equals(
    this.convertToList("<span>foo<br>bar</span>", "ol"),
    "<ol><li>foo</li><li>bar</li></ol>"
  );

  this.equals(
    this.convertToList("<span>foo<br>bar<div>baz</div></span>", "ol"),
    "<ol><li>foo</li><li>bar</li><li><div>baz</div></li></ol>"
  );

  this.equals(
    this.convertToList("<span><div></div><h1></h1><p>yeah</p></span>", "ol"),
    "<ol><li><div></div></li><li><h1></h1></li><li><p>yeah</p></li></ol>"
  );
});


test("Test whether it doesn't convert dom trees that are already a list", function() {
  this.equals(
    this.convertToList("<ol><li>foo</li></ol>", "ol"),
    "<ol><li>foo</li></ol>"
  );

  this.equals(
    this.convertToList("<menu><li>foo</li></menu>", "ol"),
    "<menu><li>foo</li></menu>"
  );

  this.equals(
    this.convertToList("<ul><li>foo</li></ul>", "ol"),
    "<ul><li>foo</li></ul>"
  );
});
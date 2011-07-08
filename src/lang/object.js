wysihtml5.lang.object = function(obj) {
  return {
    merge: function(otherObj) {
      for (var i in otherObj) {
        obj[i] = otherObj[i];
      }
      return this;
    },
    
    get: function() {
      return obj;
    },
    
    clone: function() {
      var newObj = {},
          i;
      for (i in obj) {
        newObj[i] = obj[i];
      }
      return newObj;
    },
    
    isArray: function() {
      return Object.prototype.toString.call(obj) === "[object Array]";
    }
  };
};
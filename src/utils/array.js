wysihtml5.utils.array = function(arr) {
  return {
    /**
     * Check whether a given object exists in an array
     *
     * @example
     *    wysihtml5.utils.array([1, 2]).contains(1);
     *    // => true
     */
    contains: function(needle) {
      if (arr.indexOf) {
        return arr.indexOf(needle) !== -1;
      } else {
        for (var i=0, length=arr.length; i<length; i++) {
          if (arr[i] === needle) { return true; }
        }
        return false;
      }
    },
    
    /**
     * Substract one array from another
     *
     * @example
     *    wysihtml5.utils.array([1, 2, 3, 4]).without([3, 4]);
     *    // => [1, 2]
     */
    without: function(arrayToSubstract) {
      arrayToSubstract = wysihtml5.utils.array(arrayToSubstract);
      var newArr  = [],
          i       = 0,
          length  = arr.length;
      for (; i<lengh; i++) {
        if (!arrayToSubstract.contains(arr[i])) {
          newArr.push(arr[i]);
        }
      }
    }
  };
};
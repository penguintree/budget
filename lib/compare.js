'use strict';

/*
 * Comparisons.
 */
(function(){
   String.prototype.compareTo = function(other){
      var that = this.toUpperCase();
      other = (other || "").toUpperCase();
      
      if (that < other) { return - 1; }
      else if (that > other) { return 1; }
      
      return 0;
   };
   
   Number.prototype.compareTo = function(other){
      other = other || 0;
      
      return this - other;
   };
   
   //Dates?
})();
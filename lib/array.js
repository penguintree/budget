'use strict';

require('./compare.js');

/*
 * Array extensions
 */
(function(){
   Array.prototype.iterate = function(f){
      for (var i = 0 ; i < this.length ; i++){
         if (f(this[i], i) === false){
            break;
         }
      }
   };
   
   Array.prototype.transform = function(f){
      var newArray = [];
      this.iterate(function(item){
         newArray.push(f);
      });
      return newArray;
   };
   
   Array.prototype.sortBy = function(fields){
      
      if (fields === undefined) { return; }
      
      if (typeof(fields) === 'string'){
         fields = [ fields ];
      }
      
      this.sort(function(a, b){
         return compare(a, b, fields);
      });
   };
   
   function compare(a, b, fields, i){
      i = i || 0;
      if (i >= fields.length){
         return 0;
      }
      
      var field = sortInfo(fields[i]);
      var valA = a[field.prop];
      var valB = b[field.prop];
      
      var ret = handleUndefined(valA, valB);
      if (ret === false){
         if (valA.compareTo){
            ret = valA.compareTo(valB);
         } else {
            ret = valA - valB; //Dates?
         }
         
         if (ret === 0){
            return compare(a, b, fields, i+1);
         }
      }
      
      return ret * field.coef;
   }
   
   function handleUndefined(a, b){
      if(a === undefined || b === undefined){
         if (a === undefined && b === undefined) { return 0; }
         else if (a === undefined) { return -1; }
         return 1;
      }
      
      return false;
   }
   
   function sortInfo(field){
      var sv = {
         coef: field.startsWith('-') ? -1 : 1
      };
      if (sv.coef === -1){
         sv.prop = field.substr(1);
      } else {
         sv.prop = field;
      }
      return sv;
   }
})();
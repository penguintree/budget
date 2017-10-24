'use strict';

(function(){
   
   module.exports = createPromise;
   
   function createPromise(){
      var resolve;
      var reject;
      var promise = new Promise(function(res, rej) { resolve = res; reject = rej });
      
      return {
         $promise: promise,
         resolve: resolve,
         reject: function(e){
            console.log(e);
            reject(e);
         }
      };
   };
   
})();
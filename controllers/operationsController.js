'use strict';

(function(){  
   require('../lib/array.js');
   
   module.exports = Controller;
   
   function Controller(operationsRepository){
      
      return {
         get: get,
         post: post,
         delete: deleteOperation
      };
      
      function get(response, from, to, sort){
         var promise = operationsRepository.get(from, to);
         promise.then(function(ops){
            ops.sortBy(sort);
            response.json(ops);
         });
      }
      
      function post(response, operations){
         var promise = operationsRepository.add(operations);
         promise.then(
            function(){
               response.status(201);
               response.end();
            },
            function(e){
               response.status(500).json({error: e});
               response.end();
            }
         );
      }
      
      function deleteOperation(response, id){
         var promise = operationsRepository.delete(id);
         promise.then(function(){
            response.status(204).end();;
         }, 
         function(e){
            response.status(500).json({error: e}).end();
         });
      }
   }
   
})();
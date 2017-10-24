'use strict';

(function(){
   
   module.exports = Controller;
   
   function Controller(summaryRepository){
      
      return {
         getBalance: getBalance,
         getSummary: getSummary
      };
      
      function getBalance(response, date){
         var promise = summaryRepository.getBalance(date);
         promise.then(function(data){
            response.json({ total: data }).end();
         },function(e){
            response.status(500).json({ error: e }).end();
         });
      }
      
      function getSummary(response, date){
         var promise = summaryRepository.getSummary(date);
         promise.then(function(data){
            response.json(data).end();
         },function(e){
            response.status(500).json({ error: e }).end();
         });
      }
   }
})();
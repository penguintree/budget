'use strict';

(function(){
   
   var promiseFactory = require('../lib/promiseFactory.js');
   var dbClient;
   
   exports.init = init;
   exports.getBalance = getBalance;
   exports.getSummary = getSummary;
   
   function getBalance(date){
      var cmd = "SELECT ROUND(SUM(Amount), 2) as Total FROM Operations ";
      var params = [];
      if (date){
         cmd += "WHERE Date <= ? ";
         params.push(date);
      }
      
      var promise = promiseFactory();
      
      dbClient.serialize(function(){
         dbClient.get(cmd, params, function(e, row){
            if (e) { promise.reject(e) }
            else { promise.resolve(row.Total); }
         });
      });
      
      return promise.$promise;
   }
   
   function getSummary(date){
      var cmd = "SELECT Category, ROUND(SUM(Amount), 2) as Amount FROM Operations ";
      var params = [];
      if (date){
         cmd += "WHERE Date <= ? ";
         params.push(date);
      }
      cmd += "GROUP BY Category ";
      
      var promise = promiseFactory();
      
      var data = [];
      
      dbClient.serialize(function(){
         dbClient.each(cmd, params, function (e, row){
            if (row){
               data.push({
                  category: row.Category,
                  amount: row.Amount
               });
            }
         }, function(e){
            if (e) { promise.reject(e); }
            else { promise.resolve(data); }
         });
      });
      
      return promise.$promise;
   }
   
   function ensureInited(){
      if (!dbClient){
         throw 'database not initialized, call init(dataBase)';
      }
   }
   
   function init(db){
      console.log('initializing summary repository');
      
      dbClient = db;
         
      console.log('summary repository initialized');
   }
   
})();
'use strict';

(function(){

   var promiseFactory = require('../lib/promiseFactory.js');
   var dbClient;

   function Repository(database){
      this.dbClient = database;
      init(database);
   }
   Repository.prototype.getBalance = getBalance;
   Repository.prototype.getSummary = getSummary;

   module.exports = function(dataBase){
      return new Repository(dataBase);
   };

   function getBalance(date){
      var cmd = "SELECT ROUND(SUM(Amount), 2) as Total FROM Operations ";
      var params = [];
      if (date){
         cmd += "WHERE Date <= ? ";
         params.push(date);
      }

      var promise = promiseFactory();

      var dbClient = this.dbClient;
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

      var dbClient = this.dbClient
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

   function init(db){
      console.log('initializing summary repository');

      //......

      console.log('summary repository initialized');
   }

})();

'use strict';

(function(){
   
   var promiseFactory = require('../lib/promiseFactory.js');
   
   var dbClient;
   
   exports.init = init;
   exports.get = get;
   exports.add = add;
   exports.delete = deleteOperation;
   
   function get(from, to){
      ensureInited();
      
      var cmd = "SELECT o.Id, o.Title, o.Desc, o.Date, o.Amount, o.Category, g.Total FROM Operations o "
         + "INNER JOIN (Select Title, Date, SUM(Amount) as Total from Operations group by Title, Date) g "
         + "ON o.Title = g.Title AND o.Date = g.Date ";
      var params = [];
      if (from && to){
         cmd += "WHERE o.Date BETWEEN ? AND ?";
         params.push(from);
         params.push(to);
      } else if (from){
         cmd += "WHERE o.Date >= ? ";
         params.push(from);
      } else if (to){
         cmd += "WHERE o.Date <= ? ";
         params.push(to);
      }
      
      cmd += "ORDER BY o.Date ASC ";

      var promise = promiseFactory();
      
      var operations = [];
      dbClient.serialize(function(){
         dbClient.each(cmd, params, function(err, row) {
            if (row){
               var op = operationFromRow(row);
               operations.push(op);
            }
         }, function(e){
            if (e) { promise.reject(e); }
            else { promise.resolve(operations); }
         });
      });
      
      return promise.$promise;
   }
   
   function deleteOperation(id){
      ensureInited();
      
      var cmd = "DELETE FROM Operations WHERE Id = ? ";
      
      var promise = promiseFactory();
      
      dbClient.serialize(function(){
         dbClient.run(cmd, id, function(e){
            if (e) { promise.reject(e); }
            else { promise.resolve(); }
         });
      });
      
      return promise.$promise;
      
   }
   
   function operationFromRow(row){
      return {
         id : row.Id,
         group : row.Title,
         description : row.Desc,
         date: row.Date,
         amount: row.Amount,
         category: row.Category,
         groupAmount: row.Total
      };
   }
   
   function add(operations){
      ensureInited();
      
      var promise = promiseFactory();
      
      if (!operations.length){
         promise.reject('zero operations');
      }
      else {
         console.log ('adding ' + operations.length + ' operation(s)');
         
         var cmd = 'INSERT INTO Operations (Title, Desc, Date, Amount, Category) VALUES ';
         var values = '(?, ?, ?, ?, ?) '
         var params = [];
         
         for (var i = 0 ; i < operations.length ; i++){
            if (i > 0){
               cmd += ', ';
            }
            cmd += values;
            
            var op = operations[i];
            params.push(op.group);
            params.push(op.description);
            params.push(op.date);
            params.push(op.amount);
            params.push(op.category);
         }
         
         dbClient.serialize(function(){
            dbClient.run(cmd, params, function(e) { 
               if (e) { promise.reject(e); } else { promise.resolve(); }
            });
            //var statement = db.prepare(cmd, params, function(e) { if (e) { error(e); });
            //statement.run(params);
            //statment.finalize();
         });
      }
      return promise.$promise;
   }
   
   function ensureInited(){
      if (!dbClient){
         throw 'database not initialized, call init(dataBase)';
      }
   }
   
   function init(db){
      console.log('initializing operations repository');
      
      dbClient = db;
      
      var cmd = "CREATE TABLE IF NOT EXISTS Operations (Id INTEGER PRIMARY KEY, Title NVARCHAR(30), Desc NVARCHAR(30), Date DATE, Amount DECIMAL(5,2), Category INT)";
       
      db.serialize(function() {
        db.run(cmd);
      });
      
      //db.close();
         
      console.log('operations repository initialized');
   }
   
})();
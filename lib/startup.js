'use strict';

(function(){
   
   require('./array.js');
   var sqlite3 = require('sqlite3').verbose();
   
   module.exports = startup;
   
   function startup(express, configurations){
      var bodyParser = require('body-parser');
      var jsonParser = bodyParser.json();
      
      var app = express();
      
      configurations.iterate(function(c){
         bootstrap(app, c, express, bodyParser, jsonParser);
      });
      
      return app;
   }
   
   function initDatabase(dataBase, repositories){
      console.log('dataBase = ' + dataBase);
      
      var db = new sqlite3.Database(dataBase);
      
      for (var i = 0 ; i < repositories.length ; i++){
         repositories[i].init(db);
      }
   }
   
   function bootstrap(app, config, express, bodyParser, jsonParser){
      
      //Opérations
      var operationsRepository = require('../repositories/operationsRepository.js');
      var operationsController = require('../controllers/operationsController.js')(operationsRepository);
      var presetsController = require('../controllers/presetsController.js')(config);

      //Sommaire
      var summaryRepository = require('../repositories/summaryRepository.js');
      var summaryController = require('../controllers/summaryController.js')(summaryRepository);

      //Initialisation des repo.
      initDatabase(config.data.database, [operationsRepository, summaryRepository]);
      
      
      //Catégories
      app.use('/api/' + config.name + '/categories', express.static(config.data.categories));

      //Presets
      for(var preset in config.data.presets){
         app.use('/api/' + config.name + '/operations/presets/' + preset, express.static(config.data.presets[preset].path));
      }
      app.use('/api/' + config.name + '/operations/presets', function(req, res){
         presetsController.getPresets(res);
      });

      //Opérations
      app.get('/api/' + config.name + '/operations', function(req, res){
         operationsController.get(res, req.query.from, req.query.to, req.query.sort);
      });
      app.post('/api/' + config.name + '/operations', jsonParser, function(req, res){
         operationsController.post(res, req.body);
      });
      app.delete('/api/' + config.name + '/operations/:id', function(req, res){
         operationsController.delete(res, req.params.id);
      });

      //Sommaire
      app.get('/api/' + config.name + '/summary/:date', function(req, res){
         summaryController.getSummary(res, req.params.date);
      });
      app.get('/api/' + config.name + '/summary/:date/balance', function(req, res){
         summaryController.getBalance(res, req.params.date);
      });
   }
})();
'use strict'
(function(){
   
   var startup = require('./lib/startup.js');
   
   function init(express)
   
   function register(config){
      
      //Opérations
      var operationsRepository = require('./repositories/operationsRepository.js');
      var operationsController = require('./controllers/operationsController.js')(operationsRepository);
      var presetsController = require('./controllers/presetsController.js')(config);

      //Sommaire
      var summaryRepository = require('./repositories/summaryRepository.js');
      var summaryController = require('./controllers/summaryController.js')(summaryRepository);

      //Initialisation des repo.
      startup.initDatabase(config.data.database, [operationsRepository, summaryRepository]);
      
      
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
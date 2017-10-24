'use strict';

(function(){
   var defaultPort = 8080;
   
   require('./array.js');
   
   module.exports = getConfigurations();
   
   function getConfigurations(){
      var fs = require('fs');
      var path = require('path');
      
      var file = readFile(fs);
      var r = [];
      file.configurations.iterate(function(c){
         r.push(config(c, fs, path));
      });
      return {
         port: file.port || defaultPort,
         configurations: r
      };
   }
   
   function readFile(fs){
      var argv = require('minimist')(process.argv.slice(2));
      if (!argv.configuration){
         throw "configuration parameter not set";
      }
      var fcontent = fs.readFileSync(argv.configuration, 'utf8');
      var o = JSON.parse(fcontent);
      
      return o;
   }
   
   function config(o, fs, path){
      
      return{
         name: o.name,
         description: o.description,
         data: dataConfig(o, fs, path)
      };
   };
   
   function dataConfig(o, fs, path){
      /*
      "name": "secondary",
      "description": "configuration secondaire",
      "dataFolder": "data2",
      "database": "potato",
      "port": 9090
      */
      
      var dataDir = path.resolve(o.dataFolder)
      
      fs.access(dataDir, fs.R_OK | fs.W_OK, (err) => {
         if (err){
            throw err;
         }
      });
      
      var categories = path.join(dataDir, 'categories.json');
      
      if (!fs.existsSync(categories)){
         throw 'file "' + categories + '" does not exists';
      }
      
      var database = o.database;
      if (database){
         database = path.join(dataDir, database);
      } else {
         database = ':memory:';
      }
      
      return {
         database: database,
         categories: categories,
         presets: getPresets(fs, path, dataDir)
      };
   }
   
   function getPresets(fs, path, dataDir){
      var presetDir = path.join(dataDir, 'presets')
      var files = fs.readdirSync(presetDir).filter(function(f){ return f.endsWith('.json'); });
      
      var presets = {};
      files.iterate(function(f, i){
         var name = f.slice(0, -5);
         var fpath = path.join(presetDir, f);
         var title = readPresetTitle(fs, fpath);
         presets[name] = {
            title: title,
            path: fpath
         };
      });
      
      return presets;
   }
   
   function readPresetTitle(fs, file){
      var fcontent = fs.readFileSync(file, 'utf8');
      var o = JSON.parse(fcontent);
      return o.title;
   }
})();
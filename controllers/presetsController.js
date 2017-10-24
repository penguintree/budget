'use strict';

(function(){
   
   require('../lib/array.js');
   
   module.exports = Controller;
   
   function Controller(config){
      
      return {
         getPresets: getPresets
      };
            
      function getPresets(response){
         var presets = [];
         for(var name in config.data.presets){
            presets.push({
               key: name,
               title: config.data.presets[name].title
            });
         }
         response.json(presets).end();
      }
   }
})();
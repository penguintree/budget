'use strict';

/*
 * APP
 */ 
(function(){
   
   angular.module('app', ['ngSanitize']).run(function(){
      
   });
   
})();

/*
 * DATA SERVICE
 */
(function(){
   'use strict';
   
   angular
      .module('app')
      .factory('dataService', dataService);
      
   dataService.$inject = ['$http'];
      
   function dataService($http){
      
      var cache = {};
      
      return {
         getOperations: getOperations,
         postOperations: postOperations,
         deleteOperations: deleteOperations,
         getSummary: getSummary,
         getBalance: getBalance,
         getCategories: getCategories,
         getPreset: getPreset,
         getPresetNames: getPresetNames
      };
      
      function getOperations(sort, from, to){
         
         var params = {};
         if (from){ params.from = from; }
         if (to) { params.to = to };
         if (sort) { params.sort = sort };
         
         return $http.get(
            '/api/operations',{
               params: params
            }
         ).then(function(res){
            return res.data;
         });
      }
      
      function getPresetNames(){
         return $http.get('/api/operations/presets')
         .then(function (res){ return res.data; });
      }
      
      function getPreset(name){
         return $http.get('/api/operations/presets/' + name)
         .then(function (res){ return res.data; });
      }
      
      function postOperations(operations){
         return $http.post(
            '/api/operations',
            operations,{
               headers: { 'Content-Type' : 'application/json' }
            }
         ).then(
            function(){ return true; }, 
            function(){ return false; }
         );
      }
      
      function deleteOperations(id){
         return $http.delete('/api/operations/' + id)
            .then(
               function(){ return true; }, 
               function(){ return false; }
            );
      }
      
      function getSummary(date){
         return $http.get('/api/summary/' + date)
            .then(function(res) { return res.data });
      }
      
      function getBalance(date){
         return $http.get('/api/summary/' + date + '/balance')
            .then(function(res) { return res.data });
      }
      
      function getCategories(){
         cache.categories = cache.categories || $http.get(
            '/api/categories'
         );
         
         return cache.categories.then(function(res){ return res.data; });
      }
   }
})();

/*
 * APP CONTROLLERS
 */
(function(){   
   
   angular.module('app')
      .controller('appController', AppController);
   
   function AppController(){
      var ctrl = this;
      
      
   }
})();

/*
 * COMPONENT : Messages
 */
(function(){
   angular.module('app')
      .component('messagesList', {
         bindings:{
            informationMessages: '<',
            errorMessages: '<'
         },
         template:
           '<ul data-ng-click="$ctrl.informationMessages.length = 0" class="information" data-ng-if="$ctrl.informationMessages.length">'
            + '<li data-ng-repeat="infoMsg in $ctrl.informationMessages">{{infoMsg}}</li>'
         + '</ul>'
         + '<ul data-ng-click="$ctrl.errorMessages.length = 0" class="error" data-ng-if="$ctrl.errorMessages.length">'
            +'<li data-ng-repeat="errMsg in $ctrl.errorMessages">{{errMsg}}</li>'
         + '<ul>'
      });
})();

/*
 * COMPONENT : AppMenu
 */
(function(){
   angular.module('app')
      .component('appMenu', {
         template: '<ul class="appMenu"><li data-ng-repeat="page in $ctrl.pages">'
            + '<button data-ng-click="$ctrl.goto(page.id)">{{page.name}}</button>'
            + '</li>',
         controller: AppMenuController
      });
      
   AppMenuController.$inject = [ '$rootScope' ];
   function AppMenuController($rootScope){
      var ctrl = this;
      ctrl.goto = goto;
      
      ctrl.pages = [{
         id: 'summary',
         name: 'Sommaire'
      },{
         id: 'operationsList',
         name: 'Liste des opérations'
      }, {
         id: 'addOperations',
         name: 'Ajouter des operations'
      }];
      
      goto(ctrl.pages[0].id);
      
      function goto(pageId){
         $rootScope.activePage = pageId;
         console.log('$rootScope.activePage', $rootScope.activePage);
      }
   }
})();

/*
 * COMPONENT: Summary
 */
(function(){
   angular.module('app')
      .component('budgetSummary', {
         bindings: {
            date: '<'
         },
         template: '<h1>Sommaire en date du {{$ctrl.summaryDate}}</h1>'
         + '<table data-ng-if="$ctrl.entries.length">'
            + '<tbody>'
               + '<tr data-ng-class="{ negative: entry.amount < 0 }" data-ng-repeat="entry in $ctrl.entries">'
                  + '<td>{{entry.category}}</td>'
                  + '<td class="currency">{{entry.amount | number: 2}}</td>'
               + '</tr>'
            + '</tbody>'
            + '<tfoot>'
               + '<tr>'
                  + '<th>Total</th>'
                  + '<th class="currency">{{$ctrl.balance.total | number: 2}}</th>'
               + '</tr>'
            + '</tfoot>'
         + '</table>',
         controller: BudgetSummaryController
      });
      
   BudgetSummaryController.$inject = [ 'dataService' ];
   function BudgetSummaryController(dataService){
      var ctrl = this;
      var summaryDate = ctrl.date;
      if (!summaryDate){
         var today = new Date().toFormat();
         console.log('setting date', today);
         summaryDate = today;
      }
      ctrl.summaryDate = summaryDate;
      console.log('budget summary for', summaryDate);
      
      dataService.getSummary(summaryDate).then(function (summary){
         dataService.getCategories().then(function (categories){
            ctrl.entries = buildSummaryModel(summary, categories);
         });
      });
      
      dataService.getBalance(summaryDate).then(function(balance){
         ctrl.balance = balance;
      });
      
      function buildSummaryModel(summary, categories){
         //var keyedCat = arrayToObject(categories, 'id', 'name');
         var keyedSum = arrayToObject(summary, 'category');
         var model = [];
         for (var i = 0 ; i < categories.length ; i++){
            var cat = categories[i];
            var entry = keyedSum[cat.id];
            if (entry){
               entry.category = cat.name;
            } else {
               entry = {
                  category: cat.name,
                  amount: 0
               }
            }
            model.push(entry);
         }
         //for(var i = 0 ; i < summary.length ; i++){
         //   var entry = summary[i];
         //   entry.category = keyedCat[entry.category];
         //   model.push(entry);
         //}
         
         return model;
      }
   }
})();

/*
 * COMPONENT : OperationsList
 */
(function(){
   angular.module('app')
   .component('operationsList', {
      /*bindings:{
         from: '<',
         to: '<'
      },*/
      template: 'tri : '
      + '<select data-ng-model="$ctrl.activeSort" data-ng-change="$ctrl.listOperations()">'
         + '<option data-ng-repeat="sort in $ctrl.sortOptions" data-ng-value="sort.value" data-ng-bind-html="sort.descr"></option>'
      + '</select>'
      + '<br />'
      + 'filtre : '
      + '<select data-ng-model="opFilter.category">'
         + '<option value=""></option>'
         + '<option data-ng-repeat="cat in $ctrl.categories" data-ng-value="cat.name">{{cat.name}}</option>'
      + '</select>'
      + '<table class="operations" data-ng-if="$ctrl.opGroups">'
         + '<thead>'
            + '<tr>'
               + '<td colspan="2" />'
               + '<th>Montant</th>'
               + '<th>Solde</th>'
               + '<td class="del"/>'
            + '</tr>'
         + '</thead>'
         + '<tbody data-ng-repeat="g in $ctrl.opGroups">'
            + '<tr class="groupRow" data-ng-class="{ future: g.future }" data-ng-click="g.show = !g.show">'
               + '<th class="group" colspan="2">{{::g.date}}&nbsp;-&nbsp;<span>{{::g.group}}<span></th>'
               + '<th class="currency amount">{{::g.amount | number: 2}}</th>'
               + '<th class="currency balance" data-ng-class="{ actual: g.actual }">{{::g.balance | number: 2}}</th>'
               + '<td class="del" />'
            + '</tr>'
            + '<tr data-ng-class="{ future: g.future, deleted: op.deleted, error: op.error }" data-ng-show="g.show || !!opFilter.category" data-ng-repeat="op in g.operations | filter:opFilter:strict">'
               + '<td class="category">{{::op.category}}</td>'
               + '<td class="description">{{::op.description}}</td>'
               + '<td class="currency amount">{{::op.amount | number: 2}}</td>'
               + '<td class="currency balance">' /*{{::op.balance | number: 2}}*/ + '</td>'
               + '<td class="del"><button data-ng-click="$ctrl.deleteOp(op);">X</button></td>'
            + '</tr>'
         + '</tbody>'
      +'</table>',
      controller: OperationsListController
   });
   
   OperationsListController.$inject = [ 'dataService' ];
   function OperationsListController(dataService){
      var ctrl = this;
      
      ctrl.sortOptions = [
         { descr: '&uarr;', value: { sort: ['date', 'id'], key: 'asc' } },
         { descr: '&darr;', value: { sort: ['-date', 'id'], key: 'desc' }}
      ];
      ctrl.activeSort = ctrl.sortOptions[0].value;
      
      ctrl.listOperations = listOperations;
      ctrl.deleteOp = deleteOp;
      
      var today = new Date();
      
      listOperations();
      
      function listOperations(){
         dataService.getOperations(ctrl.activeSort.sort).then(function(operations){
            dataService.getCategories().then(function(categories){
               ctrl.categories = categories;
               ctrl.opGroups = buildModel(operations, categories);
            });
         });
      }
      
      function deleteOp(operation){
         var msg = "Supprimer l'opération "
         + operation.category + " en date du " + operation.date + "au montant de " + operation.amount + "$";
         if (operation.description){
            msg += ' "' + operation.description + '"';
         }
         msg += ' ?';
         
         if (confirm(msg)){
            console.log('deleting', operation);
            dataService.deleteOperations(operation.id)
               .then(function(result){
                  if (result){
                     operation.deleted = true;
                  } else {
                     operation.error = true;
                  }
               });
         }
      }
      
      function buildModel(operations, categories){
         var keyedCat = arrayToObject(categories, 'id', 'name');
         var model = [];
         
         var asc = ctrl.activeSort.key === 'asc';
         
         var currentBalance = initialBalance(asc, operations);
         var lastGroup;
         for(var i = 0 ; i < operations.length ; i++){
            var op = operations[i];
            op.category = keyedCat[op.category];
            var lastIndex = model.length - 1;
            if (lastIndex >= 0){
               lastGroup = model[lastIndex];
               if (lastGroup.group === op.group && lastGroup.date === op.date){
                  lastGroup.operations.push(op);
                  continue;
               }
            }
            
            var future = Date.fromFormat(op.date) > today;
            currentBalance += balanceAdjustement(asc, op, lastGroup);
            var group = {
               future: future,
               group: op.group,
               amount: op.groupAmount,
               balance: currentBalance,
               date: op.date,
               operations: [ op ]
            };
            
            model.push(group);
         }
         
         if (model.length > 0){
            var lastOpIndex = asc ? model.length - 1 : 0;
            var increment = asc ? -1 : 1;
            var checkLimit = asc ? (i) => { return i >= 0 } : (i) => { return i < model.length };
            
            for (var i = lastOpIndex ; checkLimit(i) ; i+= increment){
               if (!model[i].future){
                  model[i].actual = true;
                  break;
               }
            }
         }
         
         return model;
      };
      
      function initialBalance(asc, operations){
         if (asc){ return 0; }
         
         //sort === 'desc'
         var balance = 0;
         for (var i = 0 ; i < operations.length ; i++){
            balance += operations[i].amount;
         }
         return balance;
      }
      
      function balanceAdjustement(asc, operation, lastGroup){
         if (asc){
            return operation.groupAmount;
         } else if (lastGroup){
            return lastGroup.amount * -1;
         }
         
         return 0;
      }
   }
})();

/*
 * COMPONENT ADD OPERATIONS
 */
(function(){
   angular.module('app')
      .component('addOperations', {
         template: 
           '<messages-list data-information-messages="$ctrl.infoMessages" data-error-messages="$ctrl.errorMessages"></messages-list>'
         + '<label for="date">Date&nbsp;</label><input type="date" data-ng-model="$ctrl.opDate" />'
         + '<br />'
         + '<div data-ng-if="$ctrl.presets.length">'
            + '<label for="presetList">Charger un preset&nbsp;</label>'
            + '<select id="presetList" data-ng-model="activePreset" data-ng-change="$ctrl.loadPreset(activePreset)">'
               + '<option value=""></option>'
               + '<option data-ng-repeat="preset in $ctrl.presets" data-ng-value="preset.key">{{::preset.title}}</option>'
            + '</select>'
         + '</div>'
         + '<label for="group">Titre de l\'opération&nbsp;</label><input id="group" type="text" maxlength="30" data-ng-model="$ctrl.group" />'
         + '<br />'
         + '<table>'
         + '<tr>'
            + '<th>Categorie</th><th>Description</th><th>Montant</th><th></th>'
         + '</tr>'
         + '<tr data-ng-class="{ error: op.error || !op.amount}" data-ng-repeat="op in $ctrl.operations">'
            + '<td>'
               + '<select data-ng-model="op.category">'
                  + '<option value="">Choisir</option>'
                  + '<option data-ng-repeat="cat in $ctrl.categories" data-ng-value="cat.id">{{cat.name}}</option>'
               + '</select>'
            + '</td>'
            + '<td><input type="text" data-ng-model="op.description" maxlength="30" /></td>'
            + '<td><input class="currency" type="number" data-ng-model="op.amount" step="0.001" /></td>' //STEP 0.001 because 0.01 cause bug with 9.04
            + '<td><button data-ng-click="$ctrl.removeRow(op)">X</button></td>'
         + '</tr>'
         + '<tr><td colspan="3" class="currency">{{$ctrl.getTotal()}}</td><td></td></tr>'
         + '</table>'
         + '<p>ajouter <input type="number" data-ng-model="$ctrl.numRow" min="1" max="10" /> ligne <button data-ng-click="$ctrl.addRow()">+</button>'
         + '<br />'
         + '<button data-ng-click="$ctrl.process();">Go</button>',
         controller: AddOperationsController
      });
      
   AddOperationsController.$inject = [ 'dataService' ];
   function AddOperationsController(dataService){
      var ctrl = this;
      
      //Models
      ctrl.opDate = new Date();
      ctrl.group = '';
      ctrl.errorMessages = [];
      ctrl.infoMessages = [];
      ctrl.categories = [];
      ctrl.operations = [];
      ctrl.presets = [];
      ctrl.numRow = 1;
      
      //Functions
      ctrl.process = process;
      ctrl.addRow = addRow;
      ctrl.removeRow = removeRow;
      ctrl.getTotal = getTotal;
      ctrl.loadPreset = loadPreset;
      
      dataService.getCategories().then(function(categories){
         ctrl.categories = categories;
         ctrl.operations.push(emptyModel());
      });
      
      dataService.getPresetNames().then(function(presets){
         ctrl.presets = presets;
      });
      
      function emptyModel(){
         return {
            category: undefined,
            description: '',
            amount: 0.00
         };
      }
      
      function addRow(){
         for(var i = 0 ; i < ctrl.numRow ; i++){
            ctrl.operations.push(emptyModel());
         }
      }
      
      function removeRow(op){
         ctrl.operations.remove(op);
      }
      
      function loadPreset(preset){
         if (!preset){
            return;
         }
         
         dataService.getPreset(preset)
            .then(function(def){
               ctrl.operations.length = 0;
               ctrl.group = def.title;
               for(var i = 0 ; i < def.operations.length ; i++){
                  var d = def.operations[i];
                  var op = emptyModel();
                  op.category = d.category;
                  op.amount = d.amount;
                  ctrl.operations.push(op);
               }
            });
      }
      
      function process(){
         if (validate()){
            var operations = [];
            for (var i = 0 ; i < ctrl.operations.length ; i++){
               var o = modelToEntity(ctrl.operations[i]);
               if (o){
                  operations.push(o);
               }
            }
            dataService.postOperations(operations)
               .then(function(result){
                  ctrl.infoMessages.push('Opération(s) ajoutée(s)');
                  ctrl.operations.length = 0;
                  ctrl.operations.push(emptyModel);
               });
         }
      }
      
      function validate(){
         ctrl.errorMessages.length = 0;
         var count = 0;
         if (ctrl.group === ''){
            ctrl.errorMessages.push("Le titre de l'opération est obligatoire");
         }
         if (!ctrl.opDate){
            ctrl.errorMessages.push("L'opération doit avoir une date");
         }
         for (var i = 0 ; i < ctrl.operations.length ; i++){
            var op = ctrl.operations[i];
            if(!modelEmpty(op)){
               if(modelValid(op)){
                  count += 1;
               } else {
                  var msg = "Les opérations doivent avoir une catégorie et un montant";
                  if (ctrl.errorMessages.indexOf(msg) < 0){
                     ctrl.errorMessages.push(msg);
                  }
                  op.error = true;
               }
            }
         }
         if (count === 0){
            ctrl.errorMessages.push("Aucune opération");
         }
         return ctrl.errorMessages.length === 0;
      }
      
      function modelEmpty(op){
         return (!op.category) && (!op.amount)
      }
      
      function modelValid(op){
         return (!!op.category) && (!!op.amount);
      }
      
      function modelToEntity(op){
         if (modelEmpty(op)){
            return null;
         }
         return {
            group : ctrl.group,
            description : op.description,
            date: ctrl.opDate.toFormat(),
            amount: op.amount,
            category: op.category
         };
      }
      
      function getTotal(){
         var total = 0;
         for (var i = 0 ; i < ctrl.operations.length ; i ++){
            total += ctrl.operations[i].amount;
         }
         return total.toFixed(2);
      }
   }
})();

/*
 * Utilities
 */
function arrayToObject(array, key, val){
   var o = {};
   
   var selector = val ?
      function(t) { return t[val]; } :
      function(t) { return t; };
   
   for(var i = 0 ; i < array.length ; i++){
      var item = array[i];
      var k = item[key];
      o[k] = selector(item);
   }
   return o;
};

function arrayToDict(array, key){
   var d = {};
   for(var i = 0 ; i < array.length ; i++){
      var item = array[i];
      var val = item[key];
      d[val] = o[val] || [];
      d[val].push(item);
   }
   return d;
}

Date.prototype.toFormat = function(){
   var year = this.getFullYear();
   var month = this.getMonth() + 1;
   var date = this.getDate();
   
   return year + '-' + month.toString().padLeft('0', 2) + '-' + date.toString().padLeft('0', 2);
};

Date.fromFormat = function(format){
   var values = format.split('-');
   var parts = [
      parseInt(values[0]),
      parseInt(values[1]) - 1,
      parseInt(values[2]),
   ];
   return new Date(parts[0], parts[1], parts[2]);
};

String.prototype.padLeft = function(char, length){
   var diff = length - this.length;
   if (diff > 0){
      return Array(diff+1).join(char) + this;
   }
   
   return this;
};

Array.prototype.remove = function(item){
   var index = this.indexOf(item);
   if (index >= 0){
      this.splice(index,1);
   }
};

Array.prototype.addArray = function(array){
   this.push.apply(this, array);
};
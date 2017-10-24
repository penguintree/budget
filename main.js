'use strict';

var config = require('./lib/config.js');
var express = require('express');
var app = require('./lib/startup.js')(express, config.configurations);

//SITE
app.use(express.static(__dirname + '/ui')); //Path passed to static must be absolute.

app.listen(config.port);
console.log('server started on port ' + config.port);

// app.js
'use strict';

// libary
require('./ngReqShim')();
require('angular-route');

// default include
require("bootstrap-webpack");            // include bootstrap
require("./../stylesheets/styles.scss"); // default css

// plugin loader
require("semantic-ui/dist/semantic.min.css");
require("semantic-ui/dist/semantic.min.js");
require("modernizr/Modernizr.js");
require("imports?require=>global.ngReqShim!ng-dialog");
    // pluginAll = require('./vendor/pluginAll.min.js');

// other page
require('./go')();
require('./foo')();
require('./one').face();

var callTwoOcc = require('./two');

callTwoOcc.occ();
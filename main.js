
// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var yaml = require('js-yaml');

// config
var config = require(path.join(__dirname, 'config.yaml'));

// local dependencies
var twimlRoutes = require('./routes/twiml');

// main app
var app = express();

// config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// not sure if this should go on production
console.log('TODO: sort out the cross-site headers or work out how we should be doing this');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(app.router);

// dev only error logger
console.log('TODO: dev only: remove errorHandler');
app.use(express.errorHandler());

// routes
app.post('/twiml/incoming-call', twimlRoutes.incomingCall());

// start the server
var port = config.http.listenPort;
var host = config.http.listenHost;
http.createServer(app).listen(port, host, function() {
    console.log('server listening at ' + host + ':' + port);
});

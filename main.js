
// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var yaml = require('js-yaml');
var amqp = require('amqp');

// config
var config = require(path.join(__dirname, 'config.yaml'));

// local dependencies
var generalRoutes = require('./routes/general');
var brokerRoutes = require('./routes/broker');
var handlerRoutes = require('./routes/handler');
var callRoutes = require('./routes/call');
var bodyLogger = require('./middleware/bodyLogger');
var guids = require('./middleware/guids');
var publisher = require('./middleware/publisher');
var exchange;

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

// custom middleware for logging the request bodies
app.use(bodyLogger.log(path.join(__dirname, 'request.log')));

// not sure if this should go on production
console.log('TODO: sort out the cross-site headers or work out how we should be doing this');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(app.router);

// start the amqp connection, starting the server when it's ready
var brokerConnection = amqp.createConnection({
    host: config.rabbitMq.server,
    port: config.rabbitMq.port,
    login: config.rabbitMq.user,
    password: config.rabbitMq.password,
    vhost: config.rabbitMq.vhost
});

brokerConnection.on('ready', function() {
    exchange = brokerConnection.exchange(config.rabbitMq.exchange, { type: 'direct' }, startServer);
});

function startServer() {
    // routes
    app.post('/call', callRoutes.call());

    app.post('/twiml/status-callback', generalRoutes.handleStatusCallback(publisher.callEnded(exchange)));

    app.post('/twiml/broker/incoming-call', brokerRoutes.handleIncomingCall(config.keys));
    app.post('/twiml/broker/handle-choice', brokerRoutes.handleChoice(config.keys, guids.generator(), publisher.newBrokerCallWaiting(exchange)));
    app.post('/twiml/broker/handle-message', brokerRoutes.handleMessage(publisher.newBrokerMessage(exchange)));

    app.post('/twiml/handler/contacted/:type/:data', handlerRoutes.handleContacted(config.keys));
    app.post('/twiml/handler/choice/:type/:data', handlerRoutes.handleChoice(config.keys, publisher.handlerAccepted(exchange), publisher.handlerRejected(exchange)));
    app.post('/twiml/handler/replay-broker-message/:data', handlerRoutes.handleReplayBrokerMessage());

    app.get('/request.log', function(request, response) {
        response.sendfile(path.join(__dirname, 'request.log'));
    });

    // dev only error logger
    console.log('TODO: dev only: remove errorHandler');
    app.use(express.errorHandler());

    // start the server
    console.log('starting server');
    var port = config.http.listenPort;
    var host = config.http.listenHost;
    http.createServer(app).listen(port, host, function() {
        console.log('server listening at ' + host + ':' + port);
    });
}

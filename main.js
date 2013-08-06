// dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var yaml = require('js-yaml');
var amqp = require('amqp');

// config
var config = require(path.join(__dirname, 'config.yaml'));

// logger
var logger = require('./utils/logger');

// local dependencies
var generalRoutes = require('./routes/general');
var brokerRoutes = require('./routes/broker');
var handlerRoutes = require('./routes/handler');
var bodyLogger = require('./middleware/bodyLogger');
var guids = require('./utils/guids');
var publisher = require('./utils/publisher');
var exchange;

// main app
var app = express();

// config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.favicon());

// middleware: logging: set up stream from express' logger to the winston logger
var loggerStream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
app.use(express.logger({ stream: loggerStream, format: 'request log: remote-addr: :remote-addr, method: :method, url: :url, http-version: HTTP/:http-version, status: :status, response length: :res[content-length], response time: :response-time ms' }));

// more middleware
app.use(express.bodyParser());
app.use(express.methodOverride());

// custom middleware for logging the request bodies
app.use(bodyLogger.log(logger));


// not sure if this should go on production
logger.error('TODO: sort out the cross-site headers or work out how we should be doing this');
app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(app.router);

// only start the amqp stuff if configured to do so
if (config.rabbitMq.enabled) {
    logger.info('starting amqp connection');
    // start the amqp connection, starting the server when it's ready
    var brokerConnection = amqp.createConnection({
        host: config.rabbitMq.server,
        port: config.rabbitMq.port,
        login: config.rabbitMq.user,
        password: config.rabbitMq.password,
        vhost: config.rabbitMq.vhost
    });

    brokerConnection.on('ready', function() {
        logger.info('amqp connection is ready, starting server');
        exchange = brokerConnection.exchange(config.rabbitMq.exchange, { type: 'direct' }, startServer);
    });
}
else {    
    logger.error('not using amqp connection');
    startServer();
}

function startServer() {
    // routes
    app.post('/twiml/status-callback', generalRoutes.handleStatusCallback(publisher.callEnded(exchange)));
    app.post('/twiml/broker/incoming-call', brokerRoutes.handleIncomingCall(config.keys));
    app.post('/twiml/broker/handle-choice', brokerRoutes.handleChoice(config.keys, guids.generator(), publisher.newBrokerCallWaiting(exchange)));
    app.post('/twiml/broker/handle-message', brokerRoutes.handleMessage(publisher.newBrokerMessage(exchange)));
    app.post('/twiml/handler/contacted/:type/:data', handlerRoutes.handleContacted(config.keys));
    app.post('/twiml/handler/choice/:type/:data', handlerRoutes.handleChoice(config.keys, publisher.handlerAccepted(exchange), publisher.handlerRejected(exchange)));
    app.post('/twiml/handler/replay-broker-message/:data', handlerRoutes.handleReplayBrokerMessage());
    app.post('/twiml/hang-up-redirect', generalRoutes.handleHangUp());
    
    // only error handler
    app.use(express.errorHandler());

    // start the server
    logger.info('starting server');
    var port = config.http.listenPort;
    var host = config.http.listenHost;
    http.createServer(app).listen(port, host, function() {
        logger.info('server started and listening at ' + host + ':' + port);
    });
}

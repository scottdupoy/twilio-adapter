// dependencies
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var yaml = require('js-yaml');
var auth = require('http-auth');
var fs = require('fs');

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

// authentication
if (config.security.authentication.enabled) {
  if (config.security.authentication.method == 'digest') {
    logger.info('Using DIGEST authentication');
    var digest = auth.digest({
      realm: 'Twilio protected area',
      file: __dirname + '/htdigest-passwd'
    });
    app.use(auth.connect(digest));
  }
  else if (config.security.authentication.method == 'basic') {
    logger.info('Using BASIC authentication');
    var basic = auth.basic({
      realm: 'Twilio protected area',
      file: __dirname + '/htbasic-passwd'
    });
    app.use(auth.connect(basic));
  }
  else {
    logger.error('Unknown authentication method (should be "basic" or "digest") - ' + config.security.authentication.method);
  }
}

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

var rabbitMqPublisher = new publisher(config, logger);
rabbitMqPublisher.rmqConnect();

// not sure if this should go on production
logger.error('TODO: sort out the cross-site headers or work out how we should be doing this');
app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(app.router);

// routes
app.get('/', function(req, res) { res.end('GET: connection working'); });
app.post('/', function(req, res) { res.end('POST: connection working'); });

app.post('/twiml/status-callback', generalRoutes.handleStatusCallback(rabbitMqPublisher));
app.post('/twiml/broker/incoming-call', brokerRoutes.handleIncomingCall(config.keys));
app.post('/twiml/broker/handle-choice', brokerRoutes.handleChoice(config.keys, guids.generator(), rabbitMqPublisher));
app.post('/twiml/broker/handle-message', brokerRoutes.handleMessage(rabbitMqPublisher));
app.post('/twiml/handler/contacted/:type/:data', handlerRoutes.handleContacted(config));
app.post('/twiml/handler/choice/:type/:data', handlerRoutes.handleChoice(config, rabbitMqPublisher));
app.post('/twiml/handler/replay-broker-message/:data', handlerRoutes.handleReplayBrokerMessage());
app.post('/twiml/hang-up-redirect', generalRoutes.handleHangUp());

// only error handler
app.use(express.errorHandler());

// start the server
logger.info('starting server');
var port = config.http.port;
var host = config.http.host;

// create the server differently depending on https enabled or not
var server;
if (config.security.ssl.enabled) {
  logger.info('creating https server');
  var credentials = {
    key: fs.readFileSync(__dirname + '/private-key.pem'),
    cert: fs.readFileSync(__dirname + '/public-certificate.pem'),
    passphrase: config.security.ssl.passphrase
  };
  server = https.createServer(credentials, app);
}
else {
  logger.info('creating http server');
  server = http.createServer(app);
}

server.listen(port, host, function() {
    logger.info('server started and listening at ' + host + ':' + port);
});


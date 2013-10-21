var amqp = require('amqp');

var Publisher = function(config, logger) {
    // keep a handle to the whole publisher in scope
    var self = this;
    self.exchange = null;
    
    this.publishNewBrokerCallWaiting = function(callId, conferenceRoomId) {
        if (config.rabbitMq.enabled) {
            logger.info('publisher: Publishing NewBrokerCallWaitingEvent: callId: ' + callId + ', conferenceRoomId: ' + conferenceRoomId);
            self.exchange.publish('Contact.NewBrokerCallWaiting', {
                "$type": config.company.name + '.AlertHandler.Messages.Contact.NewBrokerCallWaitingEvent, ' + config.company.name + '.AlertHandler.Messages',
                'CallId': callId,
                'ConferenceRoomId': conferenceRoomId
            }, {});
        }
    };
    
    this.publishCallEnded = function(callId, from, to, direction, callStatus) {
        if (config.rabbitMq.enabled) {
            // need to know if a broker hangs up or when a handler hangs
            // up so that we can call the next handler if necessary
            // (basically so synchronous handler calls can be made)
            logger.info('publisher: Publishing CallEndedEvent: callId: ' + callId + ', from: ' + from + ', to: ' + to + ', direction ' + direction + ', callStatus: ' + callStatus);
            self.exchange.publish('Contact.CallEnded', {
                "$type": config.company.name + '.AlertHandler.Messages.Contact.CallEndedEvent, ' + config.company.name + '.AlertHandler.Messages',
                'CallId': callId,
                'From': from,
                'To': to,
                'Direction': direction,
                'CallStatus': callStatus
            }, {});
        }
    };
    
    this.publishNewBrokerMessage = function(callId, messageRecordingUrl) {
        if (config.rabbitMq.enabled) {
            // call-id not really necessary
            logger.info('publisher: Publishing NewBrokerMessageEvent, callId: ' + callId + ', messageRecordingUrl: ' + messageRecordingUrl);
            self.exchange.publish('Contact.NewBrokerMessage', {
                "$type": config.company.name + '.AlertHandler.Messages.Contact.NewBrokerMessageEvent, ' + config.company.name + '.AlertHandler.Messages',
                'CallId': callId,
                'MessageRecordingUrl': messageRecordingUrl
            }, {});
        }
    };
    
    this.publishHandlerAccepted = function(callId, to) {
        if (config.rabbitMq.enabled) {
            logger.info('publisher: Publishing HandlerAcceptedEvent, callId: ' + callId + ', to: ' + to);
            self.exchange.publish('Contact.HandlerAccepted', {
                "$type": config.company.name + '.AlertHandler.Messages.Contact.HandlerAcceptedEvent, ' + config.company.name + '.AlertHandler.Messages',
                'CallId': callId,
                'To': to
            }, {});
        }
    };
    
    this.publishHandlerRejected = function(callId, to) {
        if (config.rabbitMq.enabled) {
            logger.info('publisher: Publishing HandlerRejectedEvent, callId: ' + callId + ', to: ' + to);
            self.exchange.publish('Contact.HandlerRejected', {
                "$type": config.company.name + '.AlertHandler.Messages.Contact.HandlerRejectedEvent, ' + config.company.name + '.AlertHandler.Messages',
                'CallId': callId,
                'To': to
            }, {});
        }
    };
    
    this.rmqConnect = function() {
        if (!config.rabbitMq.enabled) {
            logger.info('publisher: rabbitmq disabled, not connecting to broker.');
            return;
        }
    
        logger.info('publisher: connecting to rabbitmq broker.');
        var timeoutSet = false;
        var connected = false;
        
        var connection = amqp.createConnection({
          host: config.rabbitMq.server,
          port: config.rabbitMq.port,
          login: config.rabbitMq.user,
          password: config.rabbitMq.password,
          vhost: config.rabbitMq.vhost 
        });

        connection.on('ready', function() {            
          var localExchange = connection.exchange(config.rabbitMq.exchange, {durable: true, autoDelete: false, type: 'direct'});
          localExchange.on('open', function() {
            self.exchange = localExchange;
          });
          connected = true;
        }).on('error', function(e) {
          if(!timeoutSet) {
            timeoutSet = true;
            setTimeout(function() {
              self.rmqConnect();
            }, config.rabbitMq.connectionRetryInterval);
          }
        }).on('close', function() {
          if(connected) {
            connected = false;
            if(!timeoutSet) {
              timeoutSet = true;
              setTimeout(function() { 
                self.rmqConnect();
              }, config.rabbitMq.connectionRetryInterval);
            }
          }
        });
    };
};

module.exports = Publisher;


//scott:todo:timestamps

var logger = require('./logger');

exports.newBrokerCallWaiting = function(exchange) {
    if (exchange) {
        return function(callId, conferenceRoomId) {
            logger.info('publisher: Publishing NewBrokerCallWaitingEvent: callId: ' + callId + ', conferenceRoomId: ' + conferenceRoomId);
            exchange.publish('Twilio.NewBrokerCallWaiting', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.NewBrokerCallWaitingEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'ConferenceRoomId': conferenceRoomId
            }, {});
        };
    }
    return function(callId, conferenceRoomId) {
        logger.warn('publisher: configured not to send NewBrokerCallWaitingEvent');
    };
};

exports.callEnded = function(exchange) {
    if (exchange) {
        return function(callId, from, to, direction, callStatus) {
            // need to know if a broker hangs up or when a handler hangs
            // up so that we can call the next handler if necessary
            // (basically so synchronous handler calls can be made)
            logger.info('publisher: Publishing CallEndedEvent: callId: ' + callId + ', from: ' + from + ', to: ' + to + ', direction ' + direction + ', callStatus: ' + callStatus);
            exchange.publish('Twilio.CallEnded', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.CallEndedEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'From': from,
                'To': to,
                'Direction': direction,
                'CallStatus': callStatus
            }, {});
        };
    }
    return function(callId, from, to, direction, callStatus) {
        logger.warn('publisher: configured not to send CallEndedEvent');
    };
};

exports.newBrokerMessage = function(exchange) {
    if (exchange) {
        return function(callId, messageRecordingUrl) {
            // call-id not really necessary
            logger.info('publisher: Publishing NewBrokerMessageEvent, callId: ' + callId + ', messageRecordingUrl: ' + messageRecordingUrl);
            exchange.publish('Twilio.NewBrokerMessage', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.NewBrokerMessageEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'MessageRecordingUrl': messageRecordingUrl
            }, {});
        };
    }
    return function(callId, messageRecordingUrl) {
        logger.warn('publisher: configured not to send NewBrokerMessageEvent');
    };
};

exports.handlerAccepted = function(exchange) {
    if (exchange) {
        return function(callId, to) {
            logger.info('publisher: Publishing HandlerAcceptedEvent, callId: ' + callId + ', to: ' + to);
            exchange.publish('Twilio.HandlerAccepted', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.HandlerAcceptedEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'To': to
            }, {});
        };
    }
    return function(callId, to) {
        logger.warn('publisher: configured not to send HandlerAcceptedEvent');
    };
};

exports.handlerRejected = function(exchange) {
    if (exchange) {
        return function(callId, to) {
            logger.info('publisher: Publishing HandlerRejectedEvent, callId: ' + callId + ', to: ' + to);
            exchange.publish('Twilio.HandlerRejected', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.HandlerRejectedEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'To': to
            }, {});
        };
    }
    return function(callId, to) {
        logger.warn('publisher: configured not to send HandlerRejectedEvent');
    };
};

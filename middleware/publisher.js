//scott:todo:timestamps

exports.newBrokerCallWaiting = function(exchange) {
    if (exchange) {
        return function(callId, conferenceRoomId) {
            console.log('Publishing NewBrokerCallWaitingEvent');
            exchange.publish('Twilio.NewBrokerCallWaiting', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.NewBrokerCallWaitingEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'ConferenceRoomId': conferenceRoomId
            }, {});
        };
    }
    return function(callId, conferenceRoomId) {
        console.log('WARN: configured not to send NewBrokerCallWaitingEvent');
    };
};

exports.callEnded = function(exchange) {
    if (exchange) {
        return function(callId, from, to, direction, callStatus) {
            // need to know if a broker hangs up or when a handler hangs
            // up so that we can call the next handler if necessary
            // (basically so synchronous handler calls can be made)
            console.log('Publishing CallEndedEvent');
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
        console.log('WARN: configured not to send CallEndedEvent');
    };
};

exports.newBrokerMessage = function(exchange) {
    if (exchange) {
        return function(callId, messageRecordingUrl) {
            // call-id not really necessary
            console.log('Publishing NewBrokerMessageEvent');
            exchange.publish('Twilio.NewBrokerMessage', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.NewBrokerMessageEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'MessageRecordingUrl': messageRecordingUrl
            }, {});
        };
    }
    return function(callId, messageRecordingUrl) {
        console.log('WARN: configured not to send NewBrokerMessageEvent');
    };
};

exports.handlerAccepted = function(exchange) {
    if (exchange) {
        return function(callId, to) {
            console.log('Publishing HandlerAcceptedEvent');
            exchange.publish('Twilio.HandlerAccepted', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.HandlerAcceptedEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'To': to
            }, {});
        };
    }
    return function(callId, to) {
        console.log('WARN: configured not to send HandlerAcceptedEvent');
    };
};

exports.handlerRejected = function(exchange) {
    if (exchange) {
        return function(callId, to) {
            console.log('Publishing HandlerRejectedEvent');
            exchange.publish('Twilio.HandlerRejected', {
                "$type": 'Altis.AlertHandler.Messages.Twilio.HandlerRejectedEvent, Altis.AlertHandler.Messages',
                'CallId': callId,
                'To': to
            }, {});
        };
    }
    return function(callId, to) {
        console.log('WARN: configured not to send HandlerRejectedEvent');
    };
};

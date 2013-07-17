//scott:todo:timestamps

exports.newBrokerCallWaiting = function(exchange) {
    return function(callId, conferenceRoomId) {
        console.log('Publishing NewBrokerCallWaitingEvent');
        exchange.publish('Twilio.NewBrokerCallWaiting', {
            "$type": 'Altis.AlertHandler.Messages.Twilio.NewBrokerCallWaitingEvent, Altis.AlertHandler.Messages',
            'CallId': callId,
            'ConferenceRoomId': conferenceRoomId
        }, {});
    };
};

exports.callEnded = function(exchange) {
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
};

exports.newBrokerMessage = function(exchange) {
    return function(callId, messageRecordingUrl) {
        // call-id not really necessary
        console.log('Publishing NewBrokerMessageEvent');
        exchange.publish('Twilio.NewBrokerMessage', {
            "$type": 'Altis.AlertHandler.Messages.Twilio.NewBrokerMessageEvent, Altis.AlertHandler.Messages',
            'CallId': callId,
            'MessageRecordingUrl': messageRecordingUrl
        }, {});
    };
};

exports.handlerAccepted = function(exchange) {
    return function(callId, to) {
        console.log('Publishing HandlerAcceptedEvent');
        exchange.publish('Twilio.HandlerAccepted', {
            "$type": 'Altis.AlertHandler.Messages.Twilio.HandlerAcceptedEvent, Altis.AlertHandler.Messages',
            'CallId': callId,
            'To': to
        }, {});
    };
};

exports.handlerRejected = function(exchange) {
    return function(callId, to) {
        console.log('Publishing HandlerRejectedEvent');
        exchange.publish('Twilio.HandlerRejected', {
            "$type": 'Altis.AlertHandler.Messages.Twilio.HandlerRejectedEvent, Altis.AlertHandler.Messages',
            'CallId': callId,
            'To': to
        }, {});
    };
};

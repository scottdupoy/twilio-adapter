
exports.incomingCall = function(keys) {
    return function(request, response) {
        console.log('INCOMING CALL');
        response.render('twiml/incoming-initial-response', { brokerConnect: keys.brokerConnect, brokerMessage: keys.brokerMessage});
    };
};

exports.handleBrokerChoice = function(keys) {
    return function(request, response) {
        if (request.body.Digits && request.body.Digits == keys.brokerConnect) {
            console.log('BROKER CHOICE: CONNECT TO HANDLER');
            response.render('twiml/connecting-to-handler');
        }
        else if (request.body.Digits && request.body.Digits == keys.brokerMessage) {
            console.log('BROKER CHOICE: LEAVING A MESSAGE');
            response.render('twiml/leave-a-message');
        }
        else {
            console.log('BROKER CHOICE: INVALID DIGIT');
            response.render('twiml/hang-up', { message: 'Invalid option, good bye.' });
        }        
    }
};

exports.statusCallback = function() {
    return function(request, response) {
        console.log('STATUS CALLBACK');
        response.end();
    }
};

exports.handleBrokerMessage = function(keys) {
    return function(request, response) {        
        console.log('BROKER MESSAGE: MESSAGE DURATION = ' + request.body.RecordingDuration + ' SECONDS - TODO: IGNORE IF TO SHORT');
        if (request.body.CallStatus && request.body.CallStatus == "in-progress") {
            // either timedout or broker pressed a key to complete message.  need to hang-up either way.
            console.log('BROKER MESSAGE: BROKER STILL ON LINE - HANGING UP');
            response.render('twiml/hang-up', { message: 'Your message will be forwarded to a handler. Good bye.' });
        }
        else {
            // broker hung-up to complete message
            console.log('BROKER MESSAGE: BROKER HUNG UP TO COMPLETE MESSAGE');
            response.end();
        }
    };
};

exports.handleHandlerContacted = function(keys) {
    return function(request, response) {    
        console.log('HANDLER CONTACTED');        
        var type = request.params.type;
        var data = request.params.data;
        if (!type || !data) {
            console.log('ERROR: MISSING TYPE OR DATA');
            response.render('twiml/hang-up', { message: 'Sorry, contact reasons are missing. Good bye.' });
            return;
        }
                
        console.log('  type: ' + type);
        console.log('  data: ' + data);
        
        var parameters = {
            handlerAccept: keys.handlerAccept,
            handlerReject: keys.handlerReject,
            type: type,
            data: data
        };
        
        if (type == "alert") {
            console.log('TODO: NEED TO ADD ALERT MESSAGE');
            parameters["message"] = 'An Altis alert has occurred. Message goes here.'; 
            response.render('twiml/handler/accept', parameters);
        }
        else if (type == "connect") {
            parameters["message"] = 'An Altis broker is waiting to speak with a handler.'; 
            response.render('twiml/handler/accept', parameters);
        }
        else if (type == "message") {
            parameters["message"] = 'An Altis broker has left a message.'; 
            response.render('twiml/handler/accept', parameters);
        }
        else {
            console.log('ERROR: UNKNOWN CONTACT REASON HAS BEEN USED');
            response.render('twiml/hang-up', { message: 'Sorry, unknown contact reason has been used. Good bye.' });
        }        
    };
};
/*
<?xml version='1.0' encoding='UTF-8'?>
<Response>                                                                                                
    <Gather action='/twiml/handler/accept-result/<%= type %>/<%= data %>' timeout='12' method='POST' numDigits='1'>                             
        <Say>                                                                                             
            <%= message => Please press <%= handlerAccept %> to accept, <%= handlerReject %> to reject or hang up if you do not work for Altis.
        </Say>                                                                                            
    </Gather>
    <Say>
        No response detected, good bye.
    </Say>
    <Hangup/>
</Response>
*/


exports.handleContacted = function(keys) {
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
        renderHandlerChoice(response, type, data, keys, '');        
    };
};

exports.handleChoice = function(keys) {
    return function(request, response) {  
        console.log('HANDLER CHOICE');        
        var type = request.params.type;
        var data = request.params.data;
        if (!type || !data) {
            console.log('ERROR: MISSING TYPE OR DATA');
            response.render('twiml/hang-up', { message: 'Sorry, invalid response. Good bye.' });
            return;
        }
        console.log('  type: ' + type);
        console.log('  data: ' + data);

        if (request.body.Digits && request.body.Digits == keys.handlerAccept) {
            console.log('HANDLER CHOICE: ACCEPT');
            handlerAccepted(request, response, type, data);
        }
        else if (request.body.Digits && request.body.Digits == keys.handlerReject) {
            console.log('HANDLER CHOICE: REJECT');
            response.render('twiml/hang-up', { message: 'Rejected. The system will contact the next handler.' });
        }
        else {
            console.log('HANDLER CHOICE: INVALID DIGIT');
            renderHandlerChoice(response, type, data, keys, 'Unrecognised response, please try again. ');
        }
    };
};

exports.handleReplayBrokerMessage = function() {
    return function(request, response) {
        if (!request.body.Digits || request.body.Digits == 'hangup' || !request.params.data) {
            response.render('/twiml/hang-up', 'Unrecognised response. Good bye.');       
            return;
        }
        response.render('twiml/handler/replay-broker-message', {
            messageUrl: 'http://api.twilio.com/2010-04-01/Accounts/' + request.body.AccountSid + '/Recordings/' + request.params.data,
            data: request.params.data
        });
    };
};

function renderHandlerChoice(response, type, data, keys, messagePrefix) {    
    var parameters = {
        handlerAccept: keys.handlerAccept,
        handlerReject: keys.handlerReject,
        type: type,
        data: data
    };
    
    switch (type) {
    
        case "alert":
            console.log('TODO: NEED TO ADD ALERT MESSAGE');
            parameters["message"] = messagePrefix + 'An Altis alert has occurred. Message goes here.'; 
            response.render('twiml/handler/contacted', parameters);
            break;
            
        case "connect":
            parameters["message"] = messagePrefix + 'An Altis broker is waiting to speak with a handler.'; 
            response.render('twiml/handler/contacted', parameters);
            break;

        case "message":
            parameters["message"] = messagePrefix + 'An Altis broker has left a message.'; 
            response.render('twiml/handler/contacted', parameters);
            break;
            
        default:
            console.log('ERROR: UNKNOWN CONTACT REASON HAS BEEN USED');
            response.render('twiml/hang-up', { message: 'Sorry, unknown contact type has been used. Good bye.' });
            
    }
}

function handlerAccepted(request, response, type, data) {
    switch (type) {
        
        case "alert":
            response.render('twiml/handler/accepted-alert');
            break;
            
        case "connect":
            response.render('twiml/handler/accepted-broker-connection');
            break;
        
        case "message":
            response.render('twiml/handler/accepted-broker-message', {
                messageUrl: 'http://api.twilio.com/2010-04-01/Accounts/' + request.body.AccountSid + '/Recordings/' + data,
                data: data
            });
            break;
        
        default:
            response.render('twiml/hang-up', { message: 'Sorry, you have accepted an alert for an unknown contact type. Ignoring. Good bye.' });
        
    }
}



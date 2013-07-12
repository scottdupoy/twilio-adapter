
exports.handleStatusCallback = function() {
    return function(request, response) {
        console.log('STATUS CALLBACK');
        response.end();
    }
};

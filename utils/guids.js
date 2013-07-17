exports.generator = function() {
    return function() {
        // want 32 character hex guid
        var guid = '';
        for (var i = 0; i < 8; i++) {
            guid += Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1);
        }
        return guid;
    };
};

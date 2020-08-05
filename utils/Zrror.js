var _ = require('lodash');

class Zrror extends Error {
    constructor(msg) {
        let xMsg = ''
        if (_.isString(msg)) {
            xMsg = msg;
        }

        super(xMsg);

        this.objMessage = msg;
    }
}

module.exports = Zrror;
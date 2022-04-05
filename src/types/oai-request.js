const Str = require('@supercharge/strings');

class OpenAIRequest {
    id;
    msg;

    constructor(msg) {
        this.msg = msg;
        this.id = Str.random(10)
    }
}

module.exports = OpenAIRequest;
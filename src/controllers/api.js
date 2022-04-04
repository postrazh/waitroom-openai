const express = require('express');

class APIController {
    router = null;

    constructor() {
        this.router = express.Router();
        this.configure();
    }

    configure() {
        this.router.get('/', (req, res) => {
            res.send('API TEST!');
        })
    }
}

module.exports = APIController;
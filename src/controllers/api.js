const express = require('express');
const OpenAIRequest = require('../types/oai-request');
const OAIRequestStatus = require('../types/oai-request-status');

class APIController {
    router = null;
    openaiService = null;

    constructor(openaiService) {
        this.openaiService = openaiService;

        this.router = express.Router();
        this.configure();
    }

    configure() {
        this.router.post('/request', (req, res) => {
            const { content } = req.body || {};

            // Validate
            if (!content) {
                req.send({
                    error: 1,
                    msg: 'INVALID MESSAGE CONTENT'
                })
                return;
            }

            // TODO: check if message content already exists

            // Send request to OpenAI service
            const request = new OpenAIRequest(content);
            this.openaiService.sendMessage(request);

            res.send({
                error: 0,
                id: request.id,
                status: OAIRequestStatus.QUEUED
            });
        })
    }
}

module.exports = APIController;
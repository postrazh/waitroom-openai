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
        this.router.post('/request', async (req, res) => {
            const { content } = req.body || {};

            // Validate
            if (!content) {
                req.send({
                    error: 1,
                    errMsg: 'INVALID MESSAGE CONTENT'
                })
                return;
            }

            try {
                const duplicate = await this.openaiService.checkDuplicate(content);
                if (duplicate) {
                    const response = {
                        id: duplicate.id,
                        ...duplicate
                        // status: duplicate.status,
                        // ...(duplicate.status == OAIRequestStatus.COMPLETE ? {
                        //     resp: duplicate.resp
                        // } : {})
                    }
                    res.send({
                        error: 0,
                        ...response
                    });
                    return;
                }

                // Send request to OpenAI service
                const request = new OpenAIRequest(content);
                if (!await this.openaiService.sendMessage(request)) {
                    throw 'MAX RATE EXCEEDED';
                }

                res.send({
                    error: 0,
                    id: request.id,
                    status: OAIRequestStatus.QUEUED
                });
            } catch (err) {
                res.send({
                    error: 1,
                    errMsg: err
                });
            }
        })

        this.router.get('/request/:id', async (req ,res) => {
            const { id } = req.params;

            try {
                const request = await this.openaiService.getRequest(id);
                if (!request) {
                    throw 'NO REQUEST FOUND';
                }

                res.send({
                    error: 0,
                    ...request
                });
            } catch (err) {
                res.send({
                    error: 1,
                    errMsg: err
                });
            }
        })
    }
}

module.exports = APIController;
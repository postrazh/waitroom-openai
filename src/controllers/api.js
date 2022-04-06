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
                    msg: 'INVALID MESSAGE CONTENT'
                })
                return;
            }

            try {
                const duplicate = await this.openaiService.checkDuplicate(content);
                if (duplicate) {
                    const response = {
                        id: duplicate.id,
                        status: duplicate.status,
                        ...(duplicate.status == OAIRequestStatus.COMPLETE ? {
                            content: duplicate.resp
                        } : {})
                    }
                    res.send({
                        error: 0,
                        ...response
                    });
                    return;
                }

                // Send request to OpenAI service
                const request = new OpenAIRequest(content);
                this.openaiService.sendMessage(request);

                res.send({
                    error: 0,
                    id: request.id,
                    status: OAIRequestStatus.QUEUED
                });
            } catch (err) {
                res.send({
                    error: 1,
                    msg: err
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
                    msg: err
                });
            }
        })
    }
}

module.exports = APIController;
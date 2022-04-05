// const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { createClient } = require('redis');

// const client = new SQSClient({
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     },
//     region: 'us-east-1'
// })
// const SQS_URL = process.env.AWS_SQS_URL || '';

const REDIS_URL = process.env.REDIS_URL || '';
const QUEUE_CHANNEL = process.env.QUEUE_CHANNEL || '';

class OpenAIService {
    constructor() {
        this.setupRedis();
    }

    async setupRedis() {
        try {
            this.client = createClient({
                // url: 'redis://alice:foobared@awesome.redis.server:6380'
                url: REDIS_URL
            });
            this.client.on('error', (err) => console.log('Redis Client Error', err));

            console.log("Redis Client connecting ...");

            await this.client.connect();
            console.log("Redis Client connected!");
        } catch (err) {
            console.log("Redis Client connection failed", err);
        }
    }

    async sendMessage(openaiRequest) {
        // TODO: add connection check
        const jsonstr = JSON.stringify({
            id: openaiRequest.id,
            msg: openaiRequest.msg
        })
        this.client.publish(QUEUE_CHANNEL, jsonstr)
    }

    // async sendMessage(openaiRequest) {
    //     const jsonstr = JSON.stringify({
    //         id: openaiRequest.id,
    //         msg: openaiRequest.msg
    //     })

    //     try {
    //         const response = await client.send(new SendMessageCommand({
    //             // DelaySeconds: 10,
    //             // MessageAttributes: {
    //             //   "Title": {
    //             //     DataType: "String",
    //             //     StringValue: "The Whistler"
    //             //   },
    //             //   "Author": {
    //             //     DataType: "String",
    //             //     StringValue: "John Grisham"
    //             //   },
    //             //   "WeeksOn": {
    //             //     DataType: "Number",
    //             //     StringValue: "6"
    //             //   }
    //             // },
    //             MessageBody: jsonstr,
    //             QueueUrl: SQS_URL
    //         }))
    //         console.log('SQS SEND SUCCESS', response);
    //     } catch (err) {
    //         console.log('SQS SEND ERROR', err);
    //     }
    // }
}

module.exports = OpenAIService;
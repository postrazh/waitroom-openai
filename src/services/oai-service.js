const { createClient } = require('redis');

// TODO: Use npm convict
const REDIS_URL = process.env.REDIS_URL || '';
const QUEUE_CHANNEL = process.env.QUEUE_CHANNEL || '';

const MAX_RATE = process.env.MAX_RATE || 5;
const MAX_RATE_SPAN = process.env.MAX_RATE_SPAN || 1; // in seconds

const TBL_PREFIX = 'request';
const TBL_FIELD_ID = 'id';
const TBL_FIELD_MSG = 'msg';
const TBL_FIELD_RESPONSE = 'resp';
const TBL_FIELD_STATUS = 'status';
const INDEX_SET_PREFIX = 'msg';

class OpenAIService {
    last5requestTimestamp = []

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
        if (this.last5requestTimestamp.length >= MAX_RATE) {
            const now = new Date();
            const diff = now.getTime() - this.last5requestTimestamp[MAX_RATE - 1].getTime();
            if (diff >= MAX_RATE_SPAN * 1000) {
                return false;
            }
        }

        // TODO: add connection check
        const jsonstr = JSON.stringify({
            id: openaiRequest.id,
            msg: openaiRequest.msg
        })
        this.client.publish(QUEUE_CHANNEL, jsonstr)
        this.last5requestTimestamp.unshift(new Date())
        this.last5requestTimestamp = this.last5requestTimestamp.slice(0, MAX_RATE);
        return true;
    }

    async checkDuplicate(msg) {
        try {
            const indexSetKey = `${INDEX_SET_PREFIX}:${msg}`;
            const requests = await this.client.sMembers(indexSetKey);
            if (!requests || requests.length === 0) {
                return null;
            }

            const reqKey = requests[0];
            const req = await this.client.hGetAll(reqKey);

            const id = reqKey.slice(8);
            return {
                ...req,
                id
            }
        } catch (err) {
            console.log('REDIS DUPLICATE CHECK ERROR', err);
            return null;
        }
    }

    async getRequest(id) {
        try {
            const key = `${TBL_PREFIX}:${id}`;
            const req = await this.client.hGetAll(key);

            if (!req || !req.msg) return null;
            return {
                ...req,
                id
            }
        } catch (err) {
            console.log('REDIS REQUEST CHECK ERROR', err);
            return null;
        }
    }
}

module.exports = OpenAIService;
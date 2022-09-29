process.env.TZ = 'UTC';
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

import Fastify from 'fastify';
import fastifyAutoload from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import 'dotenv/config';
import fs from 'fs';
import { configuration } from './configuration';
import { getPaaskerPath } from './util';
import { log } from './log';


if (!fs.existsSync(getPaaskerPath())) {
    fs.mkdirSync(getPaaskerPath(), { recursive: true });
}

const fastify = Fastify({
    logger: false
});

fastify.register(fastifyCors, {

});

// basic api auth
fastify.addHook('onRequest', async (request, reply) => {
    log.info(`---------- ${request.method} ${request.url} ----------`);

    if (request.url.startsWith('/api')) {
        const token = request.headers.authorization?.replace('Bearer ', '') ?? '';

        if (!token || !configuration.paaska.api.keys.includes(token)) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
    }
});

fastify.register(fastifyAutoload, {
    dir: __dirname + '/routes',
    dirNameRoutePrefix: false
});

fastify.listen({ host: '0.0.0.0', port: 9000 }, async (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`🚀 Server ready at: ${address}`);
});
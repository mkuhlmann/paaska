import { FastifyPluginAsync } from "fastify";
import { configuration } from "../configuration";
import { signJWT, verifyJWT } from "../jwt";
import { log } from "../log";
import { paaskaBuild } from "../paas/build";
import { paaskaStart } from "../paas/start";

type PaaskaWebhookToken = {
    service: string;
};

const plugin: FastifyPluginAsync = async (fastify, opts) => {

    fastify.post<
        {
            Querystring: {
                token: string;
            }
        }
    >('/webhook/jwt', async (request, reply) => {

        let payload;
        try {
            payload = await verifyJWT<PaaskaWebhookToken>(request.query.token);
        } catch (e) {
            return reply.code(401).send({ error: true, message: 'signature verification failed' });
        }

        await configuration.loadDockerCompose();
        const service = configuration.getService(payload.service);

        if (!service) {
            return { error: true, message: `Service ${payload.service} not found` };
        }

        paaskaBuild(service)
            .then(() => paaskaStart(service.project))
            .then(() => {
                log.info(`✅ Webhook for ${service.name} successfully executed`);
            })


        return { error: false, message: 'webhook queued' };

    });

    fastify.post<
        {
            Body: {
                service: string;
            }
        }
    >('/api/webhook', async (request, reply) => {
        await configuration.loadDockerCompose();

        const serviceName = request.body.service;
        const service = configuration.getService(serviceName);

        if (!service) {
            return { error: `Service ${serviceName} not found` };
        }


        const jwt = await signJWT({
            service: serviceName
        });

        return { jwt };


    });

};

export default plugin;
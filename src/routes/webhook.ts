import { FastifyPluginAsync } from "fastify";
import { configuration } from "../configuration";
import { signJWT } from "../jwt";


const plugin: FastifyPluginAsync = async (fastify, opts) => {

    fastify.post('/webhook/jwt/:id', async (request, reply) => {

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
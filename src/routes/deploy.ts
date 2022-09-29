
import { FastifyPluginAsync } from 'fastify';

import { configuration } from '../configuration';
import { log } from '../log';
import { paaskaBuild } from '../paas/build';
import { paaskaStart } from '../paas/start';
import { run } from '../shell';





const plugin: FastifyPluginAsync = async (fastify, opts) => {

    fastify.post<{
        Body: {
            service: string;
        }
    }>('/api/deploy', async (request, reply) => {
        await configuration.loadDockerCompose();
        const serviceName = request.body.service;

        const service = configuration.getService(serviceName);

        if (!service) {
            return { error: true, message: `Service ${serviceName} not found` };
        }

        try {
            await paaskaBuild(service);
            await paaskaStart(service.project);
        } catch (e) {
            if (e instanceof Error) {
                return { error: true, message: e.message };
            }
        }

        return { error: false };
    });

};

export default plugin;
import { FastifyPluginAsync } from "fastify";
import { configuration } from "../configuration";


const plugin: FastifyPluginAsync = async (fastify, opts) => {


    fastify.get('/api/ping', async (request, reply) => {
        return { pong: 'it worked!' }
    });


    fastify.get('/api/services', async (request, reply) => {
        await configuration.loadDockerCompose();

        return configuration.services;
    });

}

export default plugin;
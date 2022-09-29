import { FastifyPluginAsync } from "fastify";
import { configuration } from "../configuration";
import { run } from "../shell";


const plugin: FastifyPluginAsync = async (fastify, opts) => {


    fastify.get('/api/ping', async (request, reply) => {
        return { pong: 'it worked!' }
    });


    fastify.get('/api/services', async (request, reply) => {
        await configuration.loadDockerCompose();

        return configuration.services;
    });

    fastify.post<{
        Body: {
            service?: string;
            project?: string;

            command: string;
        }

    }>('/api/docker/control', async (request, reply) => {

        if (!['restart', 'start', 'stop', 'up', 'down'].includes(request.body.command)) {
            return { error: true, message: `Invalid command ${request.body.command}` };
        }

        const command = request.body.command;

        await configuration.loadDockerCompose();

        let project, service;

        if (request.body.service) {
            service = configuration.getService(request.body.service);
            if (!service) {
                return { error: true, message: `Service ${request.body.service} not found` };
            }
            project = service.project;
        } else if (request.body.project) {
            project = configuration.getProject(request.body.project);
            if (!project) {
                return { error: true, message: `Project ${request.body.project} not found` };
            }
        } else {
            return { error: true, message: `No service or project provided` };
        }

        let cmd = `${configuration.dockerComposeBinary} -f ${project.file} -p ${project.name} ${command}`;
        if (command == 'up') cmd += ' -d';

        if (service) {
            cmd += ` ${service.name}`;
        }

        try {
            const { stdout, stderr } = await run(cmd);
            return { error: false, stdout, stderr };
        } catch (e) {
            if (e instanceof Error) {
                return { error: true, message: e.message };
            }
        }
    });


}

export default plugin;
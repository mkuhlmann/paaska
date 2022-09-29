import { configuration, PaaskaProject, PaaskaService } from '../configuration';
import { log } from '../log';
import { run } from '../shell';


export const paaskaStartService = async (service: PaaskaService) => {
    const project = service.project;
    log.info(`🚀 Starting service ${service.name}`);

    if (service.name == 'paaska') {
        log.info(`⚠️ Trying to start paaska service, exiting instead`);
        process.exit(0);
    }

    await run(`${configuration.dockerComposeBinary} -f ${project.file} -p ${project.name} up -d ${service.name}`, { cwd: project.path });
};


export const paaskaStartProject = async (project: PaaskaProject) => {
    log.info(`🚀 Starting project ${project.name} (${project.path}/${project.file})`);

    await run(`${configuration.dockerComposeBinary} -f ${project.file} -p ${project.name} up -d`, { cwd: project.path });
};


export const paaskaStartAll = async () => {

    for (const project of configuration.paaska.projects) {
        await paaskaStartProject(project);
    }

};
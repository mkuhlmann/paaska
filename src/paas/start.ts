import { configuration, PaaskaProject } from '../configuration';
import { log } from '../log';
import { run } from '../shell';


export const paaskaStart = async (project: PaaskaProject) => {
    log.info(`🚀 Starting project ${project.name} (${project.path}/${project.file})`);
    run(`${configuration.dockerComposeBinary} -f ${project.file} -p ${project.name} up -d`, { cwd: project.path });

};


export const paaskaStartAll = async () => {

    for (const project of configuration.paaska.projects) {
        await paaskaStart(project);
    }

};
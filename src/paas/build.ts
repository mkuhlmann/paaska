import { configuration, PaaskaService } from '../configuration';
import fs from 'fs';
import path from 'path';
import { log } from '../log';
import { run } from '../shell';

export const paaskaBuild = async (service: PaaskaService) => {

    if (service.build || service.labels['paaska.build']) {
        const build = service.build ?? service.labels['paaska.build'];
        const image = service.image ?? service.labels['paaska.image'];
        const repo = service.labels['paaska.repo'];


        const buildPath = path.join(service.project.path, build);

        if (!repo) {
            throw new Error(`Service ${service.name} has no repo`);
        }

        if (!service.build && !image) {
            throw new Error(`Service ${service.name} has no build path or image defined`);
        }



        let gitSshCommand = 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no';
        if (service.labels['paaska.sshKey']) {
            const sshKeyPath = path.join(service.project.path, service.labels['paaska.sshKey']);
            if (!fs.existsSync(sshKeyPath)) {
                throw new Error(`SSH Key ${sshKeyPath} does not exist`);
            }
            gitSshCommand += ` -i ${sshKeyPath}`;
        }

        if (fs.existsSync(buildPath)) {
            log.info(`🔃 Pulling git repo ${repo}`);
            try {
                await run(`git fetch --depth 1`, { cwd: buildPath, env: { GIT_SSH_COMMAND: gitSshCommand } });
                await run(`git reset --hard origin`, { cwd: buildPath });
                await run(`git clean -fdx`, { cwd: buildPath });
            } catch (e) {
                log.error(`Error pulling repo ${repo}`, e);
                return { error: true, message: `Failed to pull repo ${repo}` };
            }


        } else {
            log.info(`⬇️ Cloning repo ${repo}`);
            let { stdout, stderr } = await run(`git clone --depth 1 ${repo} ${buildPath}`, { env: { GIT_SSH_COMMAND: gitSshCommand } });
        }


        if (service.build) {
            log.info(`🔨 Building ${service.name} with docker compose build`);
            let { stdout, stderr } = await run(`${configuration.dockerComposeBinary} -p ${service.project.name} -f ${service.project.file} build ${service.name}`, { cwd: service.project.path });
        } else if (service.image) {
            log.info(`🔨 Building ${service.name} with docker build`);
            let { stdout, stderr } = await run(`docker build -t ${image} ${buildPath}`, { cwd: service.project.path });
        }

    } else if (service.image) {
        log.info(`🔃 Pulling docker image ${service.name}`);
        let { stdout, stderr } = await run(`docker pull ${service.image}`);
    }

};
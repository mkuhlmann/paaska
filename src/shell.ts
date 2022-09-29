
import util from 'util';
import child_process from 'child_process';
import { log } from './log';
import { configuration } from './configuration';
const exec = util.promisify(child_process.exec);

export const run = async (command: string, { cwd, env }: { cwd?: string, env?: { [key: string]: string } } = {}) => {
    const ts = Date.now();
    log.info(`💻 Executing ${command}` + (cwd ? ` (cwd: ${cwd})` : ''));

    if (process.env.DRY_RUN) {
        log.info(`✅ Dry run, skipping execution`);
        return { 'stdout': '', 'stderr': '' };
    }

    const { stdout, stderr } = await exec(command, { cwd, env });

    log.info(`✅ Executed in ${Math.round(Date.now() - ts / 100) / 10} s`);
    return { stdout, stderr };
};


export const searchBinaries = async () => {
    let error = false;

    if (await searchBinary('git version')) {
        log.info(`✅ Found git`);
    } else {
        log.error(`❌ git not found`);
        error = true;
    }

    if (await searchBinary('docker version')) {
        log.info(`✅ Found docker`);
    } else {
        log.error(`❌ docker not found`);
        error = true;
    }

    if (await searchBinary('docker-compose version')) {
        log.info(`✅ Found docker-compose`);
    } else {
        if (await searchBinary('docker compose version')) {
            log.info(`✅ Found docker compose`);
            configuration.dockerComposeBinary = 'docker compose';
        } else {
            log.error(`❌ docker compose not found`);
            error = true;
        }
    }

    if (error) {
        log.warn(`⚠️ Some binaries are missing, setting DRY_RUN`);
        process.env.DRY_RUN = 'true';
    }

};


const searchBinary = async (binary: string) => {
    try {
        let { stdout, stderr } = await exec(`${binary}`);
        return true;
    }
    catch (e) {
        return false;
    }
};

import util from 'util';
import child_process from 'child_process';
import { log } from './log';
import { configuration } from './configuration';
const exec = util.promisify(child_process.exec);

export const run = async (command: string, { cwd, env }: { cwd?: string, env?: { [key: string]: string } } = {}) => {
    const ts = Date.now();
    log.info(`💻 Executing ${command}` + (cwd ? ` (cwd: ${cwd})` : ''));

    return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {

        if (process.env.DRY_RUN) {
            log.info(`✅ Dry run, skipping execution`);
            resolve({ 'stdout': '', 'stderr': '' });
            return;
        }

        const child = child_process.exec(command, { cwd, env }, (error, stdout, stderr) => {
            if (error) {
                log.error(`❌ Failed to execute`);
                reject(error);
            } else {
                log.info(`✅ Executed  ${Math.round((Date.now() - ts) / 100) / 10} s`);
                resolve({ stdout, stderr });
            }
        });

        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);

    });

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

    if (await searchBinary('docker compose version')) {
        log.info(`✅ Found docker compose`);
    } else {
        if (await searchBinary('docker-compose version')) {
            log.info(`✅ Found docker-compose`);
            configuration.dockerComposeBinary = 'docker-compose';
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

import util from 'util';
import child_process from 'child_process';
import { log } from './log';
const exec = util.promisify(child_process.exec);

export const run = async (command: string, { cwd }: { cwd?: string } = {}) => {
    const ts = Date.now();
    log.info(`💻 Executing ${command}` + (cwd ? ` (cwd: ${cwd})` : ''));

    if (process.env.DRY_RUN) {
        log.info(`✅ Dry run, skipping execution`);
        return { 'stdout': '', 'stderr': '' };
    }

    const { stdout, stderr } = await exec(command, { cwd });

    log.info(`✅ Executed in ${Math.round(Date.now() - ts / 100) / 10} s`);
    return { stdout, stderr };
};
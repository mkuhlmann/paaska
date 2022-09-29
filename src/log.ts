import util from 'util';

const colors = {
    info: '36',
    error: '31;1',
    warn: '33',
    debug: '90',
}

type LogFn = (msg: string, level: string) => void

export type Log = LogFn & {
    error: (...p: any[]) => void
    warn: (...p: any[]) => void
    info: (...p: any[]) => void
    debug: (...p: any[]) => void
}

type LogLevel = keyof typeof colors;

const formatDate = (date: Date) => {
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((n) => n.toString().padStart(2, '0'))
        .join(':')
}

export const makeLog = function (quiet = false, timestamp = true, debug = false): Log {
    function log(msg: string, level: LogLevel) {
        if (quiet && level === 'info') return
        if (timestamp) msg = color(formatDate(new Date()), '30;1') + '  ' + msg
        const c = colors[level.toLowerCase() as LogLevel] || '32';

        let levelStr = '[' + color(level.toUpperCase(), c) + ']' + ' '.repeat(6 - level.length);
        console.log(levelStr + msg)
    }

    function color(s: string, c: string) {
        if (process.stdout.isTTY) {
            return '\x1B[' + c + 'm' + s + '\x1B[0m'
        }
        return s
    }

    log.debug = function () {
        if (debug) return
        log(util.format(...arguments), 'debug')
    }
    log.info = function () {
        log(util.format(...arguments), 'info')
    }

    log.warn = function () {
        log(util.format(...arguments), 'warn')
    }

    log.error = function () {
        log(util.format(...arguments), 'error')
    }

    return log as Log;
}


export const log = makeLog();
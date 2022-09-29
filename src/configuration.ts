import { parse } from 'yaml';
import fs from 'fs';
import path from 'path';
import { getPath } from './util';

export type PaaskaProject = {
    name: string;
    file: string;
    path: string;
};

export type PaaskaConfig = {
    secret: string;

    defaultProject: string;

    projects: PaaskaProject[];

    api: {
        keys: string[];
    }
}

export type PaaskaService = {
    name: string;
    key: string;
    build?: string;
    image?: string;

    labels: { [key: string]: string };

    project: PaaskaProject;
};

class Configuration {
    public paaska: PaaskaConfig;
    public services: PaaskaService[] = [];

    public dockerComposeBinary: string = 'docker-compose';


    constructor() {
        this.paaska = {} as PaaskaConfig; // hacky hack
        this.loadConfigurationSync();

    }

    public loadConfigurationSync() {
        const yaml = fs.readFileSync(getPath('paaska.yml'), 'utf8');

        this.paaska = parse(yaml) as PaaskaConfig;

        for (let compose of this.paaska.projects) {
            if (!compose.name) {
                compose.name = compose.file.split('.', 2)[0];
                compose.path = getPath(path.dirname(compose.file));
            }
        }
    }

    public async loadDockerCompose() {
        this.services = [];

        for (let compose of this.paaska?.projects ?? []) {
            const yaml = await fs.promises.readFile(getPath(compose.file), 'utf8');
            const config = parse(yaml);


            for (let [key, service] of Object.entries(config.services) as [string, any][]) {
                let _service = service as PaaskaService;

                _service.name = key;
                let labels: { [key: string]: string } = {};

                if (service.labels && Array.isArray(service.labels)) {
                    for (let label of service.labels as string[]) {
                        let [key, value] = label.split('=', 2);
                        labels[key] = value;
                    }

                } else if (service.labels && typeof service.labels === 'object') {
                    labels = service.labels;
                }

                _service.key = key;
                _service.labels = labels;
                _service.project = compose;

                this.services.push(_service);
            }

        }
    }

    public getService(name: string) {
        return this.services.find(service => service.key === name);
    }
}


export const configuration = new Configuration();

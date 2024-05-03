export type DockerCompose = {
	version: string;
	services: { [key: string]: DockerComposeService };
	networks: { [key: string]: DockerComposeNetwork };
	volumes: { [key: string]: DockerComposeVolume };
	secrets: { [key: string]: DockerComposeSecret };
};

export type DockerComposeService = {
	image?: string;
	build?: {
		context: string;
		dockerfile: string;
	};
	command?: string;
	ports?: string[];
	volumes?: string[];
	environment?: { [key: string]: string };
	labels?: { [key: string]: string };
	networks?: string[];
	secrets?: string[];
	depends_on?: string[];
	restart?: string;
	logging?: {
		driver?: string;
		options?: { [key: string]: string };
	};
	deploy?: any;
};

export type DockerComposeNetwork = {
	driver?: string;
	driver_opts?: { [key: string]: string };
	external?: boolean;
	internal?: boolean;
	ipam?: any;
	labels?: { [key: string]: string };
};

export type DockerComposeVolume = {
	driver?: string;
	driver_opts?: { [key: string]: string };
	external?: boolean;
	labels?: { [key: string]: string };
};

import path from 'path';

export const getPath = (...paths: string[]) => {
	if (process.env.NODE_ENV === 'development') {
		return path.join(__dirname, '..', 'data', ...paths);
	}
	return path.join('/data', ...paths);
};

export const getPaaskerPath = (...paths: string[]) => {
	return getPath('.paaska', ...paths);
};

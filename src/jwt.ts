import { createSecretKey } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { configuration } from './configuration';

export const signJWT = async (payload: any) => {
    const key = createSecretKey(Buffer.from(configuration.paaska.secret, 'base64'));

    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(key);

    return jwt;
};


export const verifyJWT = async <T>(token: string): Promise<T> => {
    const key = createSecretKey(Buffer.from(configuration.paaska.secret, 'base64'));
    const { payload, protectedHeader } = await jwtVerify(token, key);

    return payload as T;
};
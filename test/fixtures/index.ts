import { readFile } from '../read-file';

export const resolveFixturePath = (path: string): string => `${__dirname}/${path}`;

export const readFixture = (path: string, charset: string | null = 'utf8'): string | Buffer => readFile(resolveFixturePath(path), charset);

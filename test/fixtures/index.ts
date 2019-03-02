import { readFile } from '../read-file';

export const resolveFixturePath = (path: string) => `${__dirname}/${path}`;

export const readFixture = (path: string, charset: string | null = 'utf8') => readFile(resolveFixturePath(path), charset);

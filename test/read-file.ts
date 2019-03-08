import { readFileSync } from 'fs';

export const readFile = (filename: string, charset: string | null = 'utf8'): string | Buffer => readFileSync(filename, charset);

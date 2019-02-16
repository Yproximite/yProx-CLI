import { readFileSync } from 'fs';

export const readFile = (filename: string, charset: string | null = 'utf8') => readFileSync(filename, charset);

import dotenv from 'dotenv';
import fs from 'fs';

export const loadEnv = (path: string) => {
  const config = dotenv.parse(fs.readFileSync(path));

  Object.entries(config).forEach(([key, value]) => {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value;
    }
  });
};

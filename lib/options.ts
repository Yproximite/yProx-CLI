import joi, { ValidationError } from 'joi';
import { ProjectOptions } from '../types';

const schema = joi.object().keys({
  assets: joi.object(),
  path: joi.object(),
  handlers: joi.object({
    sass: joi.object(),
    javascript: joi.object({
      nodeResolve: joi.alternatives(joi.object(), joi.boolean()),
      commonjs: joi.alternatives(joi.object(), joi.boolean()),
      json: joi.alternatives(joi.object(), joi.boolean()),
      vue: joi.alternatives(joi.object(), joi.boolean()),
      shims: joi.object(),
      babel: joi.object(),
    }),
  }),
  eslint: joi.object({
    extensions: joi.array(),
  }),
  autoprefixer: joi.object(),
  babel: joi.boolean(),
  cssnano: joi.object(),
  terser: joi.object(),
  gifsicle: joi.object(),
  jpegtran: joi.object(),
  optipng: joi.object(),
  svgo: joi.object(),
});

export function validate(options: ProjectOptions, cb: (err: ValidationError) => void): void {
  joi.validate(options, schema, cb);
}

export function defaults(): ProjectOptions {
  return {
    path: {},
    handlers: {
      sass: {},
      javascript: {
        nodeResolve: {
          mainFields: ['module'],
          browser: true,
          extensions: ['.mjs', '.js', '.json', '.node', '.vue'],
        }, // https://github.com/rollup/rollup-plugin-node-resolve
        commonjs: {}, // https://github.com/rollup/rollup-plugin-commonjs
        json: {}, // https://github.com/rollup/rollup-plugin-json#usage
        vue: {}, // https://rollup-plugin-vue.vuejs.org/options.html#options
        shims: {},
        babel: {
          exclude: [
            '/node_modules/**',
            // /\/core-js\//, // see https://github.com/rollup/rollup-plugin-babel/issues/254
          ],
        },
      },
    },
    eslint: {
      extensions: ['.js', '.vue'],
    },
    autoprefixer: {},
    babel: true,
    cssnano: {
      preset: 'default',
    },
    terser: {},
    gifsicle: {
      interlaced: true,
    },
    jpegtran: {
      progressive: true,
    },
    optipng: {
      optimizationLevel: 5,
    },
    svgo: {
      plugins: [{ removeViewBox: true }],
    },
  };
}

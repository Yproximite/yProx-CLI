const joi = require('joi');

const schema = joi.object().keys({
  path: joi.object(),
  handlers: joi.object({
    autoprefixer: joi.object({
      browsers: joi.string(),
    }),
    cssnano: joi.object({
      safe: joi.boolean(),
      autoprefixer: joi.boolean(),
    }),
    uglify: joi.object({
      compress: joi.object({
        drop_console: joi.boolean(),
      }),
    }),
    gifsicle: joi.object({
      interlaced: joi.boolean(),
    }),
    jpegtran: joi.object({
      progressive: joi.boolean(),
    }),
    optipng: joi.object({
      optimizationLevel: joi.number(),
    }),
    svgo: joi.object({
      plugins: joi.array(),
    }),
    rollup: joi.object({
      shims: joi.object(),
      nodeResolve: joi.object(),
      commonjs: joi.object(),
      vue: joi.object(),
      buble: joi.object(),
      string: joi.object(),
      json: joi.object(),
    }),
  }),
});

module.exports.validate = (options, cb) => {
  joi.validate(options, schema, cb);
};

module.exports.defaults = () => ({
  path: {},
  handlers: {
    autoprefixer: {},
    cssnano: {
      safe: true,
      autoprefixer: false,
    },
    uglify: {
      compress: {
        drop_console: true,
      },
    },
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
      plugins: [
        {
          removeViewBox: true,
        },
      ],
    },
    rollup: {
      shims: {},
      nodeResolve: {}, // https://github.com/rollup/rollup-plugin-node-resolve
      commonjs: {}, // https://github.com/rollup/rollup-plugin-commonjs
      vue: {},
      buble: {},
      string: {}, // https://github.com/TrySound/rollup-plugin-string#usage
      json: {}, // https://github.com/rollup/rollup-plugin-json#usage
    },
  },
});

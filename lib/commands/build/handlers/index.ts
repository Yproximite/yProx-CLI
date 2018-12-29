export default {
  js: () => require('./js').default,
  css: () => require('./css').default,
  sass: () => require('./sass').default,
  file: () => require('./file').default,
  image: () => require('./image').default,
  rollup: () => require('./rollup').default,
};

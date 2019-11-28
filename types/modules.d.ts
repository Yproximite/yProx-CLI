interface Options {
  [k: string]: any;
}

declare module 'vinyl-sourcemaps-apply' {
  function fn(file: any, map: any): any;

  export default fn;
}

declare module 'gulp-postcss' {
  function fn(plugins: Function[]): any;

  export default fn;
}

declare module 'gulp-terser' {
  function fn(options: Options): any;

  export default fn;
}

declare module 'gulp-dart-sass' {
  function fn(options: Options): any;

  export default fn;
}

declare module 'rollup-plugin-node-builtins' {
  function fn(): any;

  export default fn;
}

declare module 'rollup-plugin-node-globals' {
  function fn(): any;

  export default fn;
}

declare module 'rollup-plugin-replace' {
  function fn(options: Options): any;

  export default fn;
}

declare module 'rollup-plugin-commonjs' {
  function fn(options: Options): any;

  export default fn;
}

declare module '@kocal/rollup-plugin-graphql' {
  function fn(): any;

  export default fn;
}

declare module 'rollup-plugin-terser' {
  function terser(options: Options): any;

  export { terser };
}

declare module 'node-sass-tilde-importer' {
  import { Importer } from 'sass';

  function importer(): Importer;

  export default importer;
}

declare module 'stylelint-formatter-pretty' {}

declare module 'defaults-deep' {
  function fn(obj1: { [k: string]: any }, ...objs: { [k: string]: any }[]): { [k: string]: any };

  export default fn;
}

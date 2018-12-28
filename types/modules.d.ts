interface Options {
  [k: string]: any
}

declare module 'gulp-postcss' {
  function fn(plugins: Function[]): any;
  export default fn;
}

declare module 'gulp-terser' {
  function fn(options: Options): any;
  export default fn;
}

declare module 'rollup-plugin-node-builtins' {
  function fn(): any;
  export default fn;
}

declare module 'rollup-plugin-node-resolve' {
  function fn(options: Options): any;
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

declare module 'rollup-plugin-graphql' {
  function fn(): any;
  export default fn;
}

declare module 'rollup-plugin-buble' {
  function fn(options: Options): any;
  export default fn;
}

declare module 'rollup-plugin-terser' {
  function terser(options: Options): any;
  export { terser };
}

declare module 'node-sass-tilde-importer' {}

declare module 'stylelint-formatter-pretty' {}

declare module 'defaults-deep' {
  function fn(obj1: {}, ...objs: {}[]): {};

  export default fn;
}

declare module '@kocal/logger' {
  export interface Context {
    level: string;
    levelColor: (level: string) => any;
    message: string;
    chalk: any;
    luxon: any;
  }

  export type Variables = {[k: string]: any} | (() => {[k: string]: any})

  class Logger {
    static getLogger(name: string, options: {}): Logger;
    setLevel(level: string): void;
    setFormat(format: (ctx: Context, variables: Variables) => string): void;
    setVariables(variables: Variables): void;
    debug(message: string, additionalVariables?: Variables): void;
    log(message: string, additionalVariables?: Variables): void;
    info(message: string, additionalVariables?: Variables): void;
    warn(message: string, additionalVariables?: Variables): void;
    error(message: string, additionalVariables?: Variables): void;
  }

  export default Logger;
}

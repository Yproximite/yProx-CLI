import { Options as GifsicleOptions } from 'imagemin-gifsicle';
import { Options as JpegtranOptions } from 'imagemin-jpegtran';
import { Options as OptipngOptions } from 'imagemin-optipng';
import { Options as SvgoOptions } from 'imagemin-svgo';

type Asset =
  string  // for import
  | Entry[]
  | ((api: any, projectOptions: ProjectOptions) => Entry[]);

type ProjectOptions = {
  assets?: { [k: string]: Asset }
  path: { [k: string]: string }
  handlers: {
    sass: { [k: string]: any }
    rollup: {
      nodeResolve: { [k: string]: any } | boolean;
      commonjs: { [k: string]: any } | boolean;
      json: { [k: string]: any } | boolean;
      vue: { [k: string]: any } | boolean;
      shims: { [k: string]: any };
    }
  }
  buble: { [k: string]: any }
  autoprefixer: { [k: string]: any }
  cssnano: { [k: string]: any }
  terser: { [k: string]: any }
  gifsicle: GifsicleOptions;
  jpegtran: JpegtranOptions;
  optipng: OptipngOptions;
  svgo: SvgoOptions;
}

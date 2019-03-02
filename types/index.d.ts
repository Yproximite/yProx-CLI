import { Options as AutoprefixerOptions } from 'autoprefixer';
import { TransformOptions as BubleTransformOptions } from 'buble';
import { CssNanoOptions } from 'cssnano';
import { Options as GifsicleOptions } from 'imagemin-gifsicle';
import { Options as JpegtranOptions } from 'imagemin-jpegtran';
import { Options as OptipngOptions } from 'imagemin-optipng';
import { Options as SvgoOptions } from 'imagemin-svgo';
import { Options as SassOptions } from 'sass';
import { MinifyOptions } from 'terser';
import { Options as RollupResolveOptions } from 'rollup-plugin-node-resolve';
import { VuePluginOptions as RollupVueOptions } from 'rollup-plugin-vue';
import { Entry } from './entry';

type Asset =
  | string // for import
  | Entry[]
  | ((api: any, projectOptions: ProjectOptions) => Entry[]);

type ProjectOptions = {
  assets?: { [k: string]: Asset };
  path: { [k: string]: string };
  handlers: {
    sass: SassOptions;
    rollup: {
      nodeResolve: RollupResolveOptions | boolean;
      commonjs: { [k: string]: any } | boolean;
      json: { [k: string]: any } | boolean;
      vue: RollupVueOptions | boolean;
      shims: { [k: string]: any };
    };
  };
  eslint: {
    extensions: string[];
  };
  autoprefixer: AutoprefixerOptions;
  buble: BubleTransformOptions;
  cssnano: CssNanoOptions;
  terser: MinifyOptions;
  gifsicle: GifsicleOptions;
  jpegtran: JpegtranOptions;
  optipng: OptipngOptions;
  svgo: SvgoOptions;
};

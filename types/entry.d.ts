export interface Entry {
  handler: 'css' | 'file' | 'image' | 'js' | 'sass';
  name?: string;
  src: string[];
  dest: string;
  sourceMaps: boolean;
  [k: string]: any;
}

export type EntryCSS = Entry & { concat?: string };
export type EntryJS = Entry & {
  name: string;
  destFile: string;
  concat?: string; // deprecated, use `destFile`
  format?: 'umd' | 'amd' | 'cjs' | 'esm' | 'iife';
};
export type EntrySass = Entry & {
  destFile: string;
  concat?: string; // deprecated, use `destFile`
};
export type EntryFile = Entry & {};
export type EntryImage = Entry & {};

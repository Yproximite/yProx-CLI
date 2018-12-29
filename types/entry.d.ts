type Entry = {
  src: string[];
  dest: string;
  [k: string]: any;
};

type EntryCSS = Entry & { concat?: string };
type EntryJS = Entry & { concat?: string };
type EntrySass = Entry & { concat?: string };
type EntryRollup = Entry & {
  destFile: string;
  name: string;
  concat?: string; // deprecated, use `destFile`
  format?: 'umd' | 'amd' | 'cjs' | 'esm' | 'iife';
};
type EntryFile = Entry & {};
type EntryImage = Entry & {};

const watch = require('gulp-watch');
const log = require('fancy-log');

module.exports = (cli, entry, args) => {
  return (build) => {
    const doBuild = () => build(cli, entry, args);

    let filesToWatch = entry.src;
    if (entry.handler === 'sass' && /\.s[ac]ss$/.test(entry.src)) {
      filesToWatch = [
        entry.src,
        path.join(path.dirname(entry.src), '**', '**'),
      ];
    }

    // Build at least one time... :)
    doBuild();

    return watch(entry.src, { usePolling: true, ignored: ['**/node_modules/**'] }, (file) => {
      log.info(`Handle: ${file.path}`);

      return doBuild();
    });
  };
};

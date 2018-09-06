const path = require('path');
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

    log.info(`[watch] Watching "${Array.isArray(filesToWatch) ? filesToWatch.join(', ') : filesToWatch}"`);

    // Build at least one time... :)
    doBuild();

    return watch(filesToWatch, { usePolling: true, ignored: ['**/node_modules/**'] }, (file) => {
      const normalizedFilePath = file.path.replace(process.cwd(), '').replace(/^[\\/]+/, '');
      log.info(`[watch] File "${normalizedFilePath}" has been modified`);
      log.info(`[watch] Building "${Array.isArray(filesToWatch) ? filesToWatch.join(', ') : filesToWatch}"`);

      return doBuild();
    });
  };
};

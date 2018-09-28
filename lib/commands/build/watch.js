const path = require('path');
const watch = require('gulp-watch');

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

    cli.logger.info(`watch :: watching "${Array.isArray(filesToWatch) ? filesToWatch.join(', ') : filesToWatch}"`);

    // Build at least one time... :)
    doBuild();

    return watch(filesToWatch, { usePolling: true, ignored: ['**/node_modules/**'] }, (file) => {
      const normalizedFilePath = file.path.replace(process.cwd(), '').replace(/^[\\/]+/, '');
      cli.logger.info(`watch :: file "${normalizedFilePath}" has been modified`);
      cli.logger.info(`watch :: handling "${Array.isArray(filesToWatch) ? filesToWatch.join(', ') : filesToWatch}"`);

      return doBuild();
    });
  };
};

const path = require('path');
const watch = require('gulp-watch');

module.exports = (api, entry, args) => {
  return (build) => {
    const doBuild = () => build(api, entry, args);

    let filesToWatch = entry.src;
    if (entry.handler === 'sass' && /\.s[ac]ss$/.test(entry.src[0])) {
      filesToWatch = filesToWatch.concat([
        path.join(path.dirname(entry.src[0]), '**', '**'),
      ]);
    }

    api.logger.info(`watch :: watching "${filesToWatch}"`);

    // Build at least one time... :)
    doBuild();

    return watch(filesToWatch, { usePolling: true, ignored: ['**/node_modules/**'] }, (file) => {
      const normalizedFilePath = file.path.replace(process.cwd(), '').replace(/^[\\/]+/, '');
      api.logger.info(`watch :: file "${normalizedFilePath}" has been modified`);
      api.logger.info(`watch :: handling ""${filesToWatch}"`);

      return doBuild();
    });
  };
};

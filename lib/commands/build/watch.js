const watch = require('gulp-watch');
const log = require('fancy-log');

module.exports = (cli, entry, args) => {
  return (build) => {
    const doBuild = () => build(cli, entry, args);

    log.info(`Watching ${Array.isArray(entry.src) ? entry.src.join(', ') : entry.src}`);

    // Build at least one time... :)
    doBuild();

    return watch(entry.src, { usePolling: true, ignored: ['**/node_modules/**'] }, (file) => {
      log.info(`Handle: ${file.path}`);

      return doBuild();
    });
  };
};

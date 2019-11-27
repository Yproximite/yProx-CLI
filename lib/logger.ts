import Logger, { Context, Variables } from '@kocal/logger';

export { Logger } from '@kocal/logger';

export const initLogger = (verbose = false): Logger => {
  return Logger.getLogger('yprox-cli', {
    level: verbose ? 'log' : 'info',
    format: (ctx: Context, variables: Variables) => {
      const date = new Date();
      const dateFormatted = [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        String(date.getSeconds()).padStart(2, '0'),
      ].join(':');

      return `[${ctx.chalk.blue(dateFormatted)}] ${ctx.levelColor(ctx.level)} :: ${ctx.message}`;
    },
  });
};

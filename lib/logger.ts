import Logger, { Context, Variables } from '@kocal/logger';

export { Logger } from '@kocal/logger';

export const initLogger = (verbose = false): Logger => {
  return Logger.getLogger('yprox-cli', {
    level: verbose ? 'log' : 'info',
    format: (ctx: Context, variables: Variables) => `[${ctx.chalk.blue(ctx.luxon.toFormat('HH:mm:ss'))}] ${ctx.levelColor(ctx.level)} :: ${ctx.message}`,
  });
};

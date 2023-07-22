import type { Params } from 'nestjs-pino';

//
const pinoLoggerConfig: Params = {
  pinoHttp: {
    customProps: () => ({
      context: 'HTTP',
    }),
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
      },
    },
    autoLogging: false,
  },
};

//
export default pinoLoggerConfig;

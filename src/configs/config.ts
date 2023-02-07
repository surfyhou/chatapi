import type { Config } from './config.interface';
import packageJson from '../../package.json';
const config: Config = {
  nest: {
    port: 3000 || Number(process.env.PORT),
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: `${packageJson?.name}`,
    description: `The ${packageJson?.name} API description`,
    version: packageJson?.version,
    path: 'api',
  },
  chatgpt: {
    apiKey: process.env.API_KEY,
  },
  appConfig: {
    enableMessageRecord:
      process.env.ENABLE_MESSAGE_RECORD === 'true' ? true : false,
  },
};

export default (): Config => config;

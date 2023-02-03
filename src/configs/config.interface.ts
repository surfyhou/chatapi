export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  chatgpt: ChatgptConfig;
  appConfig: AppConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}
export interface ChatgptConfig {
  apiKey: string;
}

export interface AppConfig {
  enableMessageRecord?: boolean;
}

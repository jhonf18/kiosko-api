export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      DATABASE_NAME: string;
      DATABASE_PASSWORD: string;
    }
  }
}

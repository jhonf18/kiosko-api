export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;

      // variables for database
      DATABASE_URL: string;
      DATABASE_NAME: string;
      DATABASE_PASSWORD: string;

      // variables for tokens
      JWT_EXPIRES: string;
      JWT_ALGO: any;
      JWT_SECRET: string;
    }
  }
}

declare module 'jsonwebtoken' {
  interface JwtPayloadApp extends jwt.JwtPayload {
    jti: string;
    id: string;
  }
}

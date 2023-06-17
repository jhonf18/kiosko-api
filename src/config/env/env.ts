import 'dotenv/config';

const PORT: number = parseInt(process.env.PORT!);
const DATABASE_URL: string = process.env.DATABASE_URL!;
const DATABASE_NAME: string = process.env.DATABASE_NAME!;
const DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD!;
const JWT_EXPIRES: string = process.env.JWT_EXPIRES!;
const JWT_ALGO: any = process.env.JWT_ALGO!;
const JWT_SECRET: string = process.env.JWT_SECRET!;
const FRONTEND_URL: string = process.env.FRONTEND_URL! || 'http://localhost:3000';
const REALTIME_URL: string = process.env.REALTIME_URL! || 'http://localhost:3002';

export {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_URL,
  FRONTEND_URL,
  JWT_ALGO,
  JWT_EXPIRES,
  JWT_SECRET,
  PORT,
  REALTIME_URL
};

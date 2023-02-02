import 'dotenv/config';

const PORT: number = parseInt(process.env.PORT!);
const DATABASE_URL: string = process.env.DATABASE_URL!;
const DATABASE_NAME: string = process.env.DATABASE_NAME!;
const DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD!;
const JWT_EXPIRES: string = process.env.JWT_EXPIRES!;
const JWT_ALGO: any = process.env.JWT_ALGO!;
const JWT_SECRET: string = process.env.JWT_SECRET!;

export { PORT, DATABASE_NAME, DATABASE_URL, DATABASE_PASSWORD, JWT_EXPIRES, JWT_ALGO, JWT_SECRET };

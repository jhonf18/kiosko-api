import 'dotenv/config';

const PORT: number = parseInt(process.env.PORT!);
const DATABASE_URL: string = process.env.DATABASE_URL!;
const DATABASE_NAME: string = process.env.DATABASE_NAME!;
const DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD!;

export { PORT, DATABASE_NAME, DATABASE_URL, DATABASE_PASSWORD };

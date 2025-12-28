import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

const EnvSchema = z.object({
	PORT: z.string().default('6001'),
	ALLOWED_ORIGIN: z.string().url().default('http://localhost:3000'),
	MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
	MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),

	OPENAI_MODEL: z.string().default('gpt-4o-mini'),
	OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
	OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error('Invalid environment variables');
}

const raw = parsed.data;

export const env = Object.freeze({
	PORT: Number(raw.PORT),
	ALLOWED_ORIGIN: raw.ALLOWED_ORIGIN,
	MONGODB_URI: raw.MONGODB_URI,
	MONGODB_DB_NAME: raw.MONGODB_DB_NAME,

	OPENAI_API_KEY: raw.OPENAI_API_KEY,
	OPENAI_MODEL: raw.OPENAI_MODEL,
	OPENAI_EMBEDDING_MODEL: raw.OPENAI_EMBEDDING_MODEL,
});

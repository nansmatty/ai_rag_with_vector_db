import { Db, MongoClient } from 'mongodb';
import { env } from './env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
	if (client) return client;

	const uri = env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI is not defined in environment variables');
	}
	client = new MongoClient(uri);
	await client.connect();
	console.log('Connected to MongoDB');
	return client;
}

export async function getDb(): Promise<Db> {
	if (db) return db;

	const mongoClient = await getMongoClient();
	const dbName = env.MONGODB_DB_NAME;
	if (!dbName) {
		throw new Error('MONGODB_DB_NAME is not defined in environment variables');
	}
	db = mongoClient.db(dbName);
	console.log(`Current DB Name -> ${dbName}`);

	return db;
}

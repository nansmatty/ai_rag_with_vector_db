import { Collection as MongoCollection } from 'mongodb';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { getDb } from '../utils/mongo';
import { getEmbeddingsModel } from '../utils/openai';

// IIFE function means Immediately Invoked Function Expression

const KB_COLLECTION_NAME = 'kb_chunks';
const KB_INDEX_NAME = 'kb_chunks_index';

let collectionPromise: Promise<MongoCollection> | null = null;
let vectorStorePromise: Promise<MongoDBAtlasVectorSearch> | null = null;

export async function getKBCollection(): Promise<MongoCollection> {
	if (!collectionPromise) {
		collectionPromise = (async () => {
			const db = await getDb();
			return db.collection(KB_COLLECTION_NAME);
		})();
	}
	return collectionPromise;
}

export async function getVectorStore(): Promise<MongoDBAtlasVectorSearch> {
	if (!vectorStorePromise) {
		vectorStorePromise = (async () => {
			const collection = await getKBCollection();
			const vectorStore = new MongoDBAtlasVectorSearch(getEmbeddingsModel, {
				collection: collection as any,
				indexName: KB_INDEX_NAME,
				textKey: 'text',
				embeddingKey: 'embedding',
			});
			return vectorStore;
		})();
	}

	return vectorStorePromise;
}

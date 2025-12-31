import { Document } from 'langchain';
import { getVectorStore } from './03_vectorStore';

export interface RetrieverResult {
	docs: Document[];
	confidence: number;
}

export async function retrieveRelevantChunks(query: string, namespace: string = 'default', k: number = 2): Promise<RetrieverResult> {
	if (!query.trim()) return { docs: [], confidence: 0 };

	const vectorStore = await getVectorStore();
	const results = await vectorStore.similaritySearchWithScore(query, k, { namespace });

	if (!results.length) return { docs: [], confidence: 0 };

	const docs: Document[] = results.map(([doc]) => doc);
	const scores = results.map(([, score]) => score);

	// Simple confidence calculation based on scores ( Instructor version)
	const bestScore = Math.max(...scores);
	const normalizedScores = Math.max(0, Math.min(1, bestScore));
	const confidence = Number(normalizedScores.toFixed(2));

	// MongoDB Atlas Vector Search: (ChatGPT)
	// - score = similarity
	// - higher is better
	// - typical range ~0–1
	// const best = Math.max(...scores);
	// const secondBest = scores.sort((a, b) => b - a)[1] ?? 0;
	// const gap = best - secondBest;
	// const confidence = Number(Math.min(1, best * (gap > 0.05 ? 1 : 0.8)).toFixed(2));

	return { docs, confidence };
}

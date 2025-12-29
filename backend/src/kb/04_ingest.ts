import { Document } from 'langchain';
import { getVectorStore } from './03_vectorStore';

export interface IngestSummary {
	ok: boolean;
	namespace: string;
	totalChunks: number;
	sources: string[];
}

export async function ingestDoucments(namespace: string, chunks: Document[]): Promise<IngestSummary> {
	if (!namespace) throw new Error('Namespace is required for ingestion');

	if (!chunks.length) {
		return {
			ok: false,
			namespace,
			totalChunks: 0,
			sources: [],
		};
	}

	const vectorStore = await getVectorStore();

	// Stable metadata for all chunks in this ingestion

	let currentId = 0;

	const docsWithMetadata = chunks.map((chunk) => {
		const source = chunk.metadata?.source || 'unknown_source';
		const doc = new Document({
			pageContent: chunk.pageContent,
			metadata: {
				namespace,
				source,
				chunkId: currentId++,
			},
		});

		return doc;
	});

	await vectorStore.addDocuments(docsWithMetadata);

	const sources = Array.from(new Set(docsWithMetadata.map((doc) => doc.metadata.source as string)));

	return {
		ok: true,
		namespace,
		totalChunks: docsWithMetadata.length,
		sources,
	};
}

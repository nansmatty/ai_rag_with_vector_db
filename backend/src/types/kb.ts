export interface KnowledgeBaseChunk {
	namespace: string;
	source: string;
	chunkId: number;
	text: string;
	embedding: number[];
}

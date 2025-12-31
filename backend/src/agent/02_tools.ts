// Tools are nothing but functions that the agent can call to perform specific actions.

import { tool } from 'langchain';
import { z } from 'zod';
import { retrieveRelevantChunks } from '../kb/05_retriever';

// Tool to search the knowledge base vector store.
export const kbSearchTool = tool(
	async ({ question, namespace = 'default' }) => {
		const { docs, confidence } = await retrieveRelevantChunks(question, namespace, 2);

		const contexts = docs.map((doc) => ({
			source: doc?.metadata?.source || 'unknown_source',
			chunkId: (doc?.metadata?.chunkId as number) || (doc?.metadata._chunkIndex as number) || 0,
			preview: doc?.pageContent.length > 400 ? doc.pageContent.slice(0, 400) + '...' : doc.pageContent, // First 200 characters as preview
		}));

		return { contexts, confidence, namespace };
	},
	{
		name: 'kb_search',
		description: 'Search the documentation for relevant information to answer user questions.',
		schema: z.object({
			question: z.string().describe(`User's question or follow-up that must be answered using the documentation.`),
			namespace: z.string().describe('KB namespace to query'),
		}),
	}
);

export const agentTools = [kbSearchTool];

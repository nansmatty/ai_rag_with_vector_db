// Define the exact response shape you want from the agent.

import { createAgent, providerStrategy } from 'langchain';
import { z } from 'zod';
import { getChatModel } from '../utils/openai';
import { agentTools } from './02_tools';
import { AGENT_SYSTEM_PROMPT } from './01_policy';

const AgentResponseSchema = z.object({
	answer: z.string(), //The final answer to the user question, based ONLY on the provided documentation.
	citations: z.array(
		z.object({
			source: z.string(), // 'The source document from which the information was retrieved.
			chunkId: z.number(), // 'The specific chunk ID within the source document.'
			preview: z.string(), //'A preview snippet of the content from the chunk.'
		})
	),
});

export const ProductAgent = createAgent({
	model: getChatModel,
	tools: agentTools,
	systemPrompt: AGENT_SYSTEM_PROMPT,
	responseFormat: providerStrategy(AgentResponseSchema),
});

export async function runProductAgent(messages: { role: string; content: string }[]): Promise<{ answer: string; citations: any[] }> {
	const result: any = await ProductAgent.invoke({ messages });

	if (result?.structuredResponse) {
		return {
			answer: result.structuredResponse.answer,
			citations: result.structuredResponse.citations ?? [],
		};
	}

	// Fallback in case structuredResponse is not available
	return {
		answer: "I don't know based on the available documentation.",
		citations: [],
	};
}

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

// 1. Function to run with responseFormat using provideStrategy but required the langchain version ^1.0.4

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

// 2. Function to run without responseFormat using provideStrategy for langchain versions <1.0.4
// export async function runProductAgent(messages: { role: string; content: string }[]): Promise<{ answer: string; citations: any[] }> {
// 	const result: any = await ProductAgent.invoke({ messages });

// 	try {
// 		// Get only the final AI message
// 		const lastMessage = result.messages[result.messages.length - 1];

// 		if (typeof lastMessage?.content !== 'string') {
// 			throw new Error('No final AI message');
// 		}

// 		const parsed = JSON.parse(lastMessage.content);

// 		return {
// 			answer: parsed.answer,
// 			citations: parsed.citations ?? [],
// 		};
// 	} catch {
// 		return {
// 			answer: "I don't know based on the available documentation.",
// 			citations: [],
// 		};
// 	}
// }

// Centralized model instance talk to our Models or OpenAI services

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { env } from './env';

export const getChatModel = new ChatOpenAI({
	apiKey: env.OPENAI_API_KEY,
	model: env.OPENAI_MODEL,
	temperature: 0.2,
});

export const getEmbeddingsModel = new OpenAIEmbeddings({
	apiKey: env.OPENAI_API_KEY,
	model: env.OPENAI_EMBEDDING_MODEL,
});

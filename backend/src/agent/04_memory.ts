import { Collection, WithId } from 'mongodb';
import { getDb } from '../utils/mongo';
import { nanoid } from 'nanoid';

export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
	role: ChatRole;
	content: String;
	timestamp?: Date;
}

export interface ConversationDoc {
	threadId: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
}

const CONVERSATION_COLLECTION = 'conversations';

let conversationCollectionPromise: Promise<Collection<ConversationDoc>> | null = null;

async function getConversationCollection(): Promise<Collection<ConversationDoc>> {
	if (!conversationCollectionPromise) {
		conversationCollectionPromise = (async () => {
			const db = await getDb();
			const collection = db.collection<ConversationDoc>(CONVERSATION_COLLECTION);

			await collection.createIndex({ threadId: 1 }, { unique: true });
			return collection;
		})();
	}
	return conversationCollectionPromise;
}

export async function ensureThreadExists(isThreadIdPresent?: string): Promise<string> {
	const collection = await getConversationCollection();
	if (isThreadIdPresent) {
		const existing = await collection.findOne({ threadId: isThreadIdPresent });
		if (existing) return isThreadIdPresent;
	}

	const newThreadId = nanoid(12);
	const now = new Date();
	await collection.insertOne({
		threadId: newThreadId,
		messages: [],
		createdAt: now,
		updatedAt: now,
	});
	return newThreadId;
}

export async function getHistoryForThread(threadId: string): Promise<ChatMessage[]> {
	const collection = await getConversationCollection();
	const doc: WithId<ConversationDoc> | null = await collection.findOne({ threadId });

	if (!doc) return [];

	return doc.messages.map((msg) => ({
		role: msg.role,
		content: msg.content,
		timestamp: msg.timestamp,
	}));
}

export async function appendMessageToThread(threadId: string, ...message: ChatMessage[]): Promise<void> {
	if (message.length === 0) return;

	const collection = await getConversationCollection();
	const now = new Date();

	const messagesWithTimestamp = message.map((msg) => ({
		role: msg.role,
		content: msg.content,
		timestamp: msg.timestamp ?? now,
	}));

	await collection.updateOne(
		{ threadId },
		{
			$push: { messages: { $each: messagesWithTimestamp } },
			$set: { updatedAt: now },
		}
	);
}

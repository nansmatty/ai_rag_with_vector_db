import { Router } from 'express';
import { runProductAgent } from '../agent/03_agent';
import { appendMessageToThread, ensureThreadExists, getHistoryForThread } from '../agent/04_memory';

export const agentRouter = Router();

agentRouter.post('/chat', async (req, res) => {
	try {
		const { message, threadId: incomingThreadId } = req.body as { message?: string; threadId?: string };

		if (!message || !message.trim()) {
			return res.status(400).json({ success: false, message: 'Message is required' });
		}

		const threadId = await ensureThreadExists(incomingThreadId);

		const history = await getHistoryForThread(threadId);

		const userMessage = { role: 'user' as const, content: message.trim() };

		await appendMessageToThread(threadId, userMessage);

		const messagesForAgent = [...history, userMessage];

		const { answer, citations } = await runProductAgent(messagesForAgent);

		const assistantMessage = { role: 'assistant' as const, content: answer };

		await appendMessageToThread(threadId, assistantMessage);

		return res.json({ success: true, threadId, answer, citations });
	} catch (error) {
		console.error('Error in /agent/chat:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error });
	}
});

import { Router } from 'express';
import { runProductAgent } from '../agent/03_agent';

export const agentRouter = Router();

agentRouter.post('/chat', async (req, res) => {
	try {
		const { message } = req.body as { message?: string };

		if (!message || !message.trim()) {
			return res.status(400).json({ success: false, message: 'Message is required' });
		}

		const userMessage = { role: 'user' as const, content: message.trim() };
		const { answer, citations } = await runProductAgent([userMessage]);

		return res.json({ success: true, answer, citations });
	} catch (error) {
		console.error('Error in /agent/chat:', error);
		return res.status(500).json({ success: false, message: 'Internal server error', error });
	}
});

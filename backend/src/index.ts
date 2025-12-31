import express from 'express';
import { kbRouter } from './routes/kbRoute';
import { env } from 'process';
import cors from 'cors';
import { agentRouter } from './routes/agentRoute';

const app = express();
const PORT = env.PORT || 6001;

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type'],
		credentials: false,
	})
);

app.use(express.json({ limit: '10mb' }));

app.use('/kb', kbRouter);
app.use('/agent', agentRouter);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

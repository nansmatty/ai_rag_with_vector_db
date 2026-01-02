'use client';

import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

type Citation = {
	source: string;
	chunkId: string;
	preview: string;
};

type RunResult = {
	success: boolean;
	threadId: string;
	answer: string;
	citations: Citation[];
};

type ChatBubble = {
	role: 'user' | 'assistant';
	content: string;
	citations?: Citation[];
};

export default function Home() {
	// Chat State
	const [input, setInput] = useState('');
	const [thread, setThread] = useState<ChatBubble[]>([]);
	const [loading, setLoading] = useState(false);

	// ThreadId
	const [threadId, setThreadId] = useState<string | null>(null);

	// KB upload UI Panel;
	const [source, setSource] = useState('');
	const [showUploadPanel, setShowUploadPanel] = useState(false);
	const [uploadMsg, setUploadMsg] = useState<string | null>(null);
	const [ingestMsg, setIngestMsg] = useState<string | null>(null);

	return (
		<div className='h-screen flex flex-col bg-linear-to-b from-slate-600 to-slate-700'>
			<div className='border-b border-slate-200 bg-white shadow-sm'>
				<div className='max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='w-8 h-8 rounded-lg flex items-center justify-center bg-purple-600'>
							<span className='text-white font-bold text-sm'>AG</span>
						</div>
						<h1 className='text-lg font-bold text-slate-900'>Agent</h1>
					</div>
					<Button variant='outline' className='gap-2' onClick={() => setShowUploadPanel(!showUploadPanel)}>
						<UploadIcon className='w-4 h-4' />
						Upload K
					</Button>
				</div>
			</div>

			{/* main content */}
		</div>
	);
}

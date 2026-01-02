'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@radix-ui/react-separator';
import { Send, UploadIcon } from 'lucide-react';
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
	const [showUploadPanel, setShowUploadPanel] = useState(false);
	const [uploadMsg, setUploadMsg] = useState<string | null>(null);
	const [ingestRes, setIngestRes] = useState<string | null>(null);

	async function uploadFile(file: File) {
		setUploadMsg('Uploading file...');
		try {
			const formData = new FormData();
			formData.append('file', file);

			const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

			const res = await fetch(`${BACKEND_URL}/kb/upload`, {
				method: 'POST',
				body: formData,
			});

			const data = await res.json();
			setIngestRes(JSON.stringify(data, null, 2));

			if (res.ok && data.success) {
				setUploadMsg('File uploaded and ingested successfully.');
			} else {
				setUploadMsg('Failed to upload file and ingest.');
			}
		} catch (error) {
			setUploadMsg('Failed to upload file.');
		}
	}

	const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) uploadFile(file);
		e.currentTarget.value = '';
	};

	const onRun = async () => {
		if (!input.trim()) return;

		const userContent = input.trim();
		const userMessage: ChatBubble = { role: 'user', content: userContent };
		const updatedThread = [...thread, userMessage];
		setThread(updatedThread);
		setInput('');
		setLoading(true);

		try {
			const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

			const res = await fetch(`${BACKEND_URL}/agent/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userContent, threadId }),
			});

			const data: RunResult = await res.json();

			if (res.ok && data.success) {
				const agentMessage: ChatBubble = {
					role: 'assistant',
					content: data.answer,
					citations: data.citations || [],
				};
				setThread([...updatedThread, agentMessage]);
				setThreadId(data.threadId);
			} else {
				const errorMessage: ChatBubble = {
					role: 'assistant',
					content: 'Error: Failed to get response from agent.',
				};
				setThread([...updatedThread, errorMessage]);
			}
		} catch (error) {
			const errorMessage: ChatBubble = {
				role: 'assistant',
				content: 'Error: An unexpected error occurred.',
			};
			setThread([...updatedThread, errorMessage]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='h-screen flex flex-col bg-linear-to-b from-slate-50 to-slate-100'>
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
			<div className='flex-1 flex overflow-auto'>
				{/* Chat Area */}
				<div className='flex-1 flex flex-col'>
					<ScrollArea className='flex-1 p-4'>
						<div className='max-w-3xl mx-auto space-y-4 pb-8'>
							{thread.length === 0 && !loading && (
								<div className='flex items-center justify-center h-full'>
									<div className='text-center space-y-4'>
										<div className='w-16 h-16 rounded-2xl cursor-pointer bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto'>
											<UploadIcon className='w-8 h-8 text-white' />
										</div>
										<div className=''>
											<h2 className='text-2xl font-bold text-slate-800 mb-2'>Welcome to Agent</h2>
											<p className='text-slate-600 font-semibold tracking-wide'>Upload your knowledge base to get started.</p>
										</div>
									</div>
								</div>
							)}

							{thread.map((bubble, index) => (
								<ChatRow key={index} msg={bubble} />
							))}

							{loading && (
								<div className='flex justify-start'>
									<div className='rounded-2xl px-4 py-4 text-sm leading-relaxed bg-slate-100 text-slate-900 animate-pulse'>
										<div className='whitespace-pre-wrap'>Agent is typing...</div>
									</div>
									{/* Instructor Version */}
									{/* <div className='rounded-2xl px-4 py-4 flex gap-3 bg-slate-100 text-slate-900'>
										<div className='w-2 h-2 rounded-full bg-slate-400 animate-bounce' />
										<div className='w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay: 0.2s]' />
										<div className='w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay: 0.4s]' />
									</div> */}
								</div>
							)}
						</div>
					</ScrollArea>
					<div className='border-t border-slate-200 bg-white p-5 md:p-6'>
						<div className='max-w-3xl mx-auto space-y-3'>
							<Textarea
								value={input}
								onChange={(event) => setInput(event.target.value)}
								placeholder='Ask anything about your uploaded docs...'
								className='resize-none min-h-25 rounded-xl border-slate-400 bg-slate-50'
							/>
							<div className='flex items-center justify-between'>
								<div className='text-xs text-slate-800'>
									{threadId && (
										<span className='font-bold'>
											Thread ID: <code className='font-semibold'>{threadId}</code>
										</span>
									)}
								</div>
								<Button onClick={onRun} className='gap-1 cursor-pointer rounded-lg bg-linear-to-br from-blue-500 to-purple-600 text-white'>
									{loading ? 'Thinking...' : 'Send'}
									<Send className='w-4 h-4' />
								</Button>
							</div>
						</div>
					</div>
				</div>
				{/* KB Upload Panel */}
				{showUploadPanel && (
					<div className='w-96 border-l border-slate-200 flex flex-col overflow-hidden'>
						<div className='border-b border-slate-200 p-4'>
							<div className='flex items-center justify-between'>
								<h2 className='font-semibold text-slate-900'>Knowledge Base</h2>
								<Button
									variant='outline'
									className='font-extrabold cursor-pointer bg-linear-to-br from-blue-500 to-purple-600 text-white hover:text-white rounded-full p-0 w-7 h-7 flex items-center justify-center'
									size='sm'
									onClick={() => setShowUploadPanel(false)}>
									✕
								</Button>
							</div>
						</div>
						<ScrollArea className='flex-1 p-4 space-y-4'>
							<div className='space-y-2 mb-4'>
								<Label className='text-slate-800 font-semibold'>Namespace: Default</Label>
							</div>
							<Separator />
							<div className='space-y-2'>
								<Label className='text-slate-800 font-semibold'>Upload Source</Label>
								<div className='rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center'>
									<Input type='file' accept='.pdf, .txt, .md, application/pdf, text/plain, text/markdown' onChange={onFileInput} id='file-upload' />
								</div>
							</div>
						</ScrollArea>
						{uploadMsg && <div className='p-4 border-t border-slate-200 text-sm bg-slate-50'>{uploadMsg}</div>}
						{ingestRes && (
							<div className='p-4 border-t border-slate-200 text-sm bg-slate-50'>
								<Label className='font-semibold text-slate-900 mb-2'>Ingestion Result:</Label>
								<div className='max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-700'>{ingestRes}</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

const ChatRow = ({ msg }: { msg: ChatBubble }) => {
	const isUser = msg.role === 'user';

	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
			<div className='flex gap-3 max-w-2xl'>
				{!isUser && (
					<div className='w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 shrink-0 flex items-center justify-center'>
						<span className='text-white font-bold text-xs'>AG</span>
					</div>
				)}

				<div className={`rounded-xl px-4 py-4 text-sm leading-relaxed ${isUser ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
					<div className='whitespace-pre-wrap'>{msg.content}</div>
					{!isUser && msg.citations && msg.citations.length > 0 && (
						<div className='mt-3 flex flex-wrap gap-2'>
							{msg.citations.map((citation, idx) => (
								<Badge key={idx} variant='secondary' className='text-xs bg-slate-100 text-slate-800'>
									{citation.source} #{citation.chunkId}
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

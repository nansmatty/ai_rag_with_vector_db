import { Document } from 'langchain';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

type SupportedMimeTypes = 'application/pdf' | 'text/plain' | 'text/markdown';

interface LoadFileArgs {
	filePath: string;
	mimeType: SupportedMimeTypes;
	originalName: string;
}

function getExt(filename: string): string {
	const index = filename.lastIndexOf('.');
	return index === -1 ? '' : filename.slice(index + 1).toLowerCase();
}

export async function loadFileAsDocuments(args: LoadFileArgs): Promise<Document[]> {
	const { filePath, mimeType, originalName } = args;
	const extractExtention = getExt(originalName);

	const isMarkdown = mimeType === 'text/markdown' || extractExtention === 'md' || extractExtention === 'markdown';
	const isPlainText = mimeType === 'text/plain' || extractExtention === 'txt';
	const isPDF = mimeType === 'application/pdf' || extractExtention === 'pdf';

	if (isPDF) {
		const loader = new PDFLoader(filePath);
		const docs = await loader.load();
		return docs.map((doc) => ({
			...doc,
			metadata: { ...doc.metadata, source: originalName }, // Sources or Citations
		}));
	}

	if (isPlainText || isMarkdown) {
		const loader = new TextLoader(filePath);
		const docs = await loader.load();
		return docs.map((doc) => ({
			...doc,
			metadata: { ...doc.metadata, source: originalName }, // Sources or Citations
		}));
	}

	return [];
}

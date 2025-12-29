import multer from 'multer';
import { Router } from 'express';
import { loadFileAsDocuments } from '../kb/01_loaders';
import { spiltDocuments } from '../kb/02_splitter';
import { ingestDoucments } from '../kb/04_ingest';

export const kbRouter = Router();

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

kbRouter.post('/upload', upload.single('file'), async (req, res) => {
	try {
		const namespace = 'default'; // You can customize this as needed

		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded.', success: false });
		}

		const { path, mimetype, originalname } = req.file;

		const rawDocs = await loadFileAsDocuments({ filePath: path, mimeType: mimetype as any, originalName: originalname });

		if (!rawDocs.length) {
			return res.status(400).json({ message: 'Unsupported file type or empty document.', success: false });
		}

		const chunks = await spiltDocuments(rawDocs);

		if (!chunks.length) {
			return res.status(400).json({ message: 'No content to ingest after splitting.', success: false });
		}

		const ingestDoc = await ingestDoucments(namespace, chunks);

		if (!ingestDoc.ok) {
			return res.status(500).json({ message: 'Ingestion failed.', success: false });
		}

		return res.status(200).json({
			message: 'File uploaded and ingested successfully.',
			success: true,
			data: {
				namespace: ingestDoc.namespace,
				totalChunks: ingestDoc.totalChunks,
				sources: ingestDoc.sources,
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Something went wrong while uploading the file.', success: false });
	}
});

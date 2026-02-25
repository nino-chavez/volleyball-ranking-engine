import type { ImportFormat } from '../types.js';
import type { SourceAdapter, SourceAdapterConfig } from './source-adapter.js';

/**
 * Adapter for XLSX files that are uploaded directly (e.g., from a stored file path).
 * In practice, this wraps the existing manual upload flow for automation.
 * The file data is expected to be passed directly as config.fileData (base64 encoded).
 */
export class XlsxFileAdapter implements SourceAdapter {
	private format: ImportFormat;

	constructor(format: ImportFormat) {
		this.format = format;
	}

	async fetch(config: SourceAdapterConfig): Promise<ArrayBuffer> {
		const fileData = (config as Record<string, unknown>).fileData;
		if (!fileData || typeof fileData !== 'string') {
			throw new Error('XlsxFileAdapter requires config.fileData (base64 encoded string)');
		}

		// Decode base64 to ArrayBuffer
		const binaryString = atob(fileData);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}

	getFormat(): ImportFormat {
		return this.format;
	}
}

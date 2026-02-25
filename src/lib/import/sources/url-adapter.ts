import type { ImportFormat } from '../types.js';
import type { SourceAdapter, SourceAdapterConfig } from './source-adapter.js';

/**
 * Adapter that fetches an XLSX file from a URL.
 * Supports optional HTTP headers for authenticated endpoints.
 */
export class UrlAdapter implements SourceAdapter {
	private format: ImportFormat;

	constructor(format: ImportFormat) {
		this.format = format;
	}

	async fetch(config: SourceAdapterConfig): Promise<ArrayBuffer> {
		if (!config.url) {
			throw new Error('UrlAdapter requires config.url');
		}

		const headers: Record<string, string> = {
			Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			...(config.headers ?? {}),
		};

		const response = await globalThis.fetch(config.url, { headers });

		if (!response.ok) {
			throw new Error(`Failed to fetch XLSX from ${config.url}: ${response.status} ${response.statusText}`);
		}

		return response.arrayBuffer();
	}

	getFormat(): ImportFormat {
		return this.format;
	}
}

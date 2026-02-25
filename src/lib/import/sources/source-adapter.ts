import type { ImportFormat } from '../types.js';

/**
 * Configuration for a source adapter, stored in the import_sources.config JSONB column.
 */
export interface SourceAdapterConfig {
	/** For xlsx_url: the URL to fetch the XLSX file from */
	url?: string;
	/** Optional HTTP headers for authenticated URL fetches */
	headers?: Record<string, string>;
}

/**
 * Interface that all source adapters must implement.
 * Source adapters are responsible for fetching raw XLSX data from their respective sources.
 */
export interface SourceAdapter {
	/**
	 * Fetch the raw file content from the source.
	 * @param config - Source-specific configuration from import_sources.config
	 * @returns ArrayBuffer of the XLSX file content
	 */
	fetch(config: SourceAdapterConfig): Promise<ArrayBuffer>;

	/**
	 * Get the import format this adapter produces.
	 */
	getFormat(): ImportFormat;
}

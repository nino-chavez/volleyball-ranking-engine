import { z } from 'zod';

const uuidSchema = z.uuid();
const datetimeSchema = z.iso.datetime();

export const importJobSchema = z.object({
	id: uuidSchema,
	source_id: uuidSchema,
	status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
	started_at: datetimeSchema.nullable().optional(),
	completed_at: datetimeSchema.nullable().optional(),
	rows_processed: z.number().int().min(0).default(0),
	rows_inserted: z.number().int().min(0).default(0),
	rows_updated: z.number().int().min(0).default(0),
	rows_skipped: z.number().int().min(0).default(0),
	error_message: z.string().nullable().optional(),
	metadata: z.record(z.string(), z.unknown()).nullable().optional(),
	created_at: datetimeSchema,
	updated_at: datetimeSchema,
});

export type ImportJob = z.infer<typeof importJobSchema>;

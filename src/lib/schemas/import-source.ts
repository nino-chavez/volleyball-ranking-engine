import { z } from 'zod';

const uuidSchema = z.uuid();
const datetimeSchema = z.iso.datetime();

export const importSourceSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1),
	source_type: z.enum(['xlsx_file', 'xlsx_url']),
	config: z.record(z.string(), z.unknown()).default({}),
	season_id: uuidSchema,
	age_group: z.enum(['15U', '16U', '17U', '18U']),
	format: z.enum(['finishes', 'colley']).default('finishes'),
	enabled: z.boolean().default(true),
	last_run_at: datetimeSchema.nullable().optional(),
	created_at: datetimeSchema,
	updated_at: datetimeSchema,
});

export const importSourceInsertSchema = importSourceSchema.omit({
	id: true,
	last_run_at: true,
	created_at: true,
	updated_at: true,
});

export const importSourceUpdateSchema = importSourceInsertSchema.partial();

export type ImportSource = z.infer<typeof importSourceSchema>;
export type ImportSourceInsert = z.infer<typeof importSourceInsertSchema>;
export type ImportSourceUpdate = z.infer<typeof importSourceUpdateSchema>;

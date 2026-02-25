import { z } from 'zod';

const uuidSchema = z.uuid();
const datetimeSchema = z.iso.datetime();

export const clubSchema = z.object({
	id: uuidSchema,
	name: z.string().min(1),
	region: z.string().nullable().optional(),
	website: z.string().nullable().optional(),
	created_at: datetimeSchema,
	updated_at: datetimeSchema,
});

export const clubInsertSchema = clubSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export const clubUpdateSchema = clubInsertSchema.partial();

export type Club = z.infer<typeof clubSchema>;
export type ClubInsert = z.infer<typeof clubInsertSchema>;
export type ClubUpdate = z.infer<typeof clubUpdateSchema>;

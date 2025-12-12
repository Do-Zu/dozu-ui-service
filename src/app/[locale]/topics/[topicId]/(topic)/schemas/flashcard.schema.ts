import { z } from 'zod';

export const ResponseFlashCardGenerateSchema = z.object({
    q: z.string(),
    a: z.string(),
    type: z.string(),
});

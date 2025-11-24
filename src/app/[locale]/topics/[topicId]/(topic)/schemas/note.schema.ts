import { z } from 'zod';

export const GeneratedShortSummarySchema = z
    .array(
        z.string().transform((str) => {
            const parsed = JSON.parse(str);
            return z
                .object({
                    summary: z.string().min(1),
                })
                .parse(parsed);
        }),
    )
    .length(1);

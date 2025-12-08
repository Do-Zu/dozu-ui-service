import { z } from 'zod';
import { ResponseFlashCardGenerateSchema } from './flashcard.schema';

export const GenerateNodeFlashcardsItemSchema = z.object({
    nodeId: z.string(),
    flashcards: z.array(ResponseFlashCardGenerateSchema),
});

export const MultiNodeGeneratedFlashcardsSchema = z.array(GenerateNodeFlashcardsItemSchema);

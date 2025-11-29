import { GeneratedShortSummarySchema } from '../schemas/note.schema';

class NoteUtils {
    public validateGeneratedSummary(data: unknown): { isValid: boolean; summary: string } {
        const parseResult = GeneratedShortSummarySchema.safeParse(data);
        if (!parseResult.success || parseResult.error) {
            return { isValid: false, summary: '' };
        }
        return { isValid: true, summary: parseResult.data[0].summary };
    }
}

export default new NoteUtils();

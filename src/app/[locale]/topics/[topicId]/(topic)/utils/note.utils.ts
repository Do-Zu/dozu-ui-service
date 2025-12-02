import { GeneratedShortSummarySchema } from '../schemas/note.schema';
import imageService from '@/services/image/image.service';

class NoteUtils {
    public validateGeneratedSummary(data: unknown): { isValid: boolean; summary: string } {
        const parseResult = GeneratedShortSummarySchema.safeParse(data);
        if (!parseResult.success || parseResult.error) {
            return { isValid: false, summary: '' };
        }
        return { isValid: true, summary: parseResult.data[0].summary };
    }

    public async handleImageUpload(file: File, onProgress?: (event: { progress: number }) => void): Promise<string> {
        const result = await imageService.uploadImage({ file, onProgress });
        return result;
    }
}

export default new NoteUtils();

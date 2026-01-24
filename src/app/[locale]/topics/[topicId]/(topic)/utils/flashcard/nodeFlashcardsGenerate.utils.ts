import { ValidateGeneratedDataResult } from '@/hooks/generate/type';
import { MultiNodeGeneratedFlashcardsSchema } from '../../schemas/mindmap.schema';
import { IGenerateNodeFlashcardsItem } from '../../types/generate.type';

class NodeFlashcardsGenerateUtils {
    public validateMultiNodeGeneratedFlashcards(
        data: IGenerateNodeFlashcardsItem[],
    ): ValidateGeneratedDataResult<IGenerateNodeFlashcardsItem[]> {
        const parseResult = MultiNodeGeneratedFlashcardsSchema.safeParse(data);
        if (!parseResult.success) {
            return { ok: false, error: 'Invalid multi-node generated flashcards format.' };
        }
        return { ok: true, data: parseResult.data };
    }
}

export default new NodeFlashcardsGenerateUtils();

import { getRequest } from '@/api/api';
import { IResponseFileFromInputSet } from '@/app/[locale]/mindmap/types/context.types';
import { IInputSetResponse } from '../types/learningMaterial.type';

export interface ITranscriptSegment {
    startTime: number;
    endTime: number;
    text: string;
}

export type ILearningMaterial =
    | {
          type: 'file';
          blobUrl: string;
          file: File;
      }
    | {
          type: 'youtube';
          videoId: string;
          embedUrl: string;
          content: string | ITranscriptSegment[];
      };

class LearningMaterialService {
    private async getPdfDocument(fileResponse: IResponseFileFromInputSet) {
        try {
            if (!fileResponse?.data?.fileUrl) {
                throw new Error('No file URL provided');
            }
            const fileContent = fileResponse.data;

            const response = await fetch(fileContent.fileUrl, {
                method: 'GET',
                headers: {
                    Accept: 'application/pdf, */*',
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const fileName = fileResponse.title;

            const file = new File([blob], fileName, {
                type: blob.type || 'application/pdf',
                lastModified: Date.now(),
            });

            const blobUrl = URL.createObjectURL(blob);

            return { blobUrl, file };
        } catch (err) {
            throw err;
        }
    }

    public async getLearningMaterial({ topicId }: { topicId: number }): Promise<ILearningMaterial> {
        try {
            const { data: response } = await getRequest<unknown, IInputSetResponse>(`/input-set/document/${topicId}`);
            if (!response?.data) {
                throw new Error('Data not found, please try again.');
            }
            if (response.data.fileUrl) {
                const result = await this.getPdfDocument(response as IResponseFileFromInputSet);
                return { ...result, type: 'file' };
            } else {
                const youtubeContent = response.data as {
                    url?: string | null | undefined;
                    content?: null | undefined | string | ITranscriptSegment[];
                    videoInfo?: { videoId: string } | null | undefined;
                };
                if (
                    !youtubeContent ||
                    youtubeContent.url === null ||
                    youtubeContent.url === undefined ||
                    youtubeContent.content === null ||
                    youtubeContent.content === undefined ||
                    youtubeContent.videoInfo === null ||
                    youtubeContent.videoInfo === undefined
                ) {
                    throw new Error('Error: Youtube content does not exist');
                }
                return {
                    type: 'youtube',
                    videoId: youtubeContent.videoInfo.videoId,
                    embedUrl: `https://www.youtube.com/embed/${youtubeContent.videoInfo.videoId}`,
                    content: youtubeContent.content,
                };
            }
        } catch (err) {
            throw err;
        }
    }
}

export default new LearningMaterialService();

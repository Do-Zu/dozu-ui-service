import { getRequest } from '@/api/api';
import { IResponseFileFromInputSet } from '@/app/[locale]/mindmap/types/context.types';
import { EnumLearningMaterial, IInputSetResponse, ITranscriptSegment } from '../types/learningMaterial.type';
import { RESOURCE_CONTENT_TYPE } from '@/app/[locale]/generate/constants/resource';

export type ILearningMaterial =
    | {
          type: EnumLearningMaterial.file;
          blobUrl: string;
          file: File;
      }
    | {
          type: EnumLearningMaterial.youtube;
          videoId: string;
          embedUrl: string;
          content: ITranscriptSegment[];
      }
    | {
          type: EnumLearningMaterial.media;
          blobUrl: string;
          file: File;
          content: ITranscriptSegment[];
      };

class LearningMaterialService {
    private async getFileDocument(fileResponse: IResponseFileFromInputSet) {
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
    }

    private async getMediaDocument(fileResponse: IResponseFileFromInputSet) {
        if (!fileResponse?.data?.fileUrl) {
            throw new Error('No file URL provided');
        }
        const fileContent = fileResponse.data;

        const response = await fetch(fileContent.fileUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const fileName = fileResponse.title;

        const file = new File([blob], fileName, {
            type: blob.type,
            lastModified: Date.now(),
        });

        const blobUrl = URL.createObjectURL(blob);

        return { blobUrl, file };
    }

    public async getLearningMaterial({ topicId }: { topicId: number }): Promise<ILearningMaterial | null> {
        const { data: response } = await getRequest<unknown, IInputSetResponse>(`/input-set/document/${topicId}`);

        if (!response?.data) {
            throw new Error('Data not found, please try again.');
        }

        switch (response.contentType) {
            case RESOURCE_CONTENT_TYPE.FILE: {
                if (response?.data?.fileUrl) {
                    const result = await this.getFileDocument(response as IResponseFileFromInputSet);
                    return { ...result, type: EnumLearningMaterial.file };
                }
                return null;
            }

            case RESOURCE_CONTENT_TYPE.YOUTUBE: {
                const youtubeContent = response.data as {
                    url?: string | null | undefined;
                    content?: null | undefined | ITranscriptSegment[];
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
                    type: EnumLearningMaterial.youtube,
                    videoId: youtubeContent.videoInfo.videoId,
                    embedUrl: `https://www.youtube.com/embed/${youtubeContent.videoInfo.videoId}`,
                    content: youtubeContent.content,
                };
            }

            case RESOURCE_CONTENT_TYPE.MEDIA: {
                if (response?.data?.fileUrl) {
                    const result = await this.getMediaDocument(response as IResponseFileFromInputSet);
                    const content = (response.data as { content: ITranscriptSegment[] }).content;
                    if (!content || !Array.isArray(content)) {
                        throw new Error('Error: Media content transcript is missing or invalid');
                    }
                    return { ...result, content, type: EnumLearningMaterial.media };
                }
                return null;
            }

            default: {
                return null;
            }
        }
    }
}

export default new LearningMaterialService();

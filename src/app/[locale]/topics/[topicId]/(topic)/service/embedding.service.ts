import { postRequest } from '@/api/api';

const EnumEmbeddingInput = {
    TEXT: 'text',
    FILE: 'file',
    YOUTUBE: 'youtube',
};

type EmbeddingInputType = (typeof EnumEmbeddingInput)[keyof typeof EnumEmbeddingInput];

interface IQuerySimilarity {
    type: EmbeddingInputType;
    query: string;
    topicId: number;
    topK?: number;
}

type TypeMetaDataChunkEmbed = {
    type: string;
    content: string | number | object | Array<unknown>;
};

interface ReturnColumnEmbedding {
    embeddingId: number;
    topicId: number;
    contentType: string;
    originContent: TypeMetaDataChunkEmbed;
    metadata: unknown;
    createdAt: Date;
}

interface IReturnItemQuery extends ReturnColumnEmbedding {
    similarity: number;
}

type IResponseQuery = IReturnItemQuery[];

const BASE_API = '/v1/embedding';

class EmbeddingService {
    public async queryTopSimilarity(payload: IQuerySimilarity) {
        const response = await postRequest<IQuerySimilarity, IResponseQuery>(`${BASE_API}/query`, payload);
        return response;
    }
}

export const embeddingService = new EmbeddingService();

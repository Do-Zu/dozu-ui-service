type TypeMetaDataChunkEmbed = {
    type: string;
    content: string | number | object | Array<unknown>;
};

type MetaDataYoutubeContent = { startTime: number };

type MetaDataFileContent = {
    pageNumber: number;
};

interface IReturnItemQuery {
    embeddingId: number;
    topicId: number;
    contentType: string;
    originContent: TypeMetaDataChunkEmbed;
    metadata: MetaDataYoutubeContent | MetaDataFileContent | null;
    createdAt: string | Date;
    similarity: number;
}

interface IReturnItemFileReference {
    embeddingId: number;
    topicId: number;
    contentType: string;
    originContent: TypeMetaDataChunkEmbed;
    metadata: MetaDataFileContent;
    createdAt: string | Date;
    similarity: number;
}

export type { MetaDataYoutubeContent, MetaDataFileContent, IReturnItemQuery, IReturnItemFileReference };

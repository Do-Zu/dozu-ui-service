export interface LlmApiKeyModel {
  id: number;
  apiKeyId: number;
  modelId: number;
  modelName?: string;
  providerName?: string;
  requestPerMinute: number;
  requestPerDay: number;
  createdAt: string;
}

export interface CreateLlmApiKeyModelInput {
  apiKeyId: number;
  modelId: number;
  requestPerMinute: number;
  requestPerDay: number;
}

export interface UpdateLlmApiKeyModelInput {
  apiKeyId?: number;
  modelId?: number;
  requestPerMinute?: number;
  requestPerDay?: number;
}

export interface GetLlmApiKeyModelsQuery {
  apiKeyId?: string;
  modelId?: string;
  providerId?: string;
  page?: string;
  limit?: string;
}

export interface LlmApiKeyModelsResponse {
  relations: LlmApiKeyModel[];
  total: number;
  page: number;
  limit: number;
}


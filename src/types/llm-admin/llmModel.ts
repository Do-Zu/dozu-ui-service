import type { LlmProvider } from './llmProvider';

export interface LlmModel {
  modelId: number;
  providerId: number;
  providerName?: string;
  name: string;
  priority: number;
  isAvailable: boolean;
  isDefault: boolean;
  description?: string | null;
  createdAt: string;
}

export interface CreateLlmModelInput {
  providerId: number;
  name: string;
  priority?: number;
  isAvailable?: boolean;
  isDefault?: boolean;
  description?: string | null;
}

export interface UpdateLlmModelInput {
  providerId?: number;
  name?: string;
  priority?: number;
  isAvailable?: boolean;
  isDefault?: boolean;
  description?: string | null;
}

export interface GetLlmModelsQuery {
  providerId?: string;
  providerName?: string;
  isAvailable?: 'true' | 'false' | '';
  isDefault?: 'true' | 'false' | '';
  page?: string;
  limit?: string;
  search?: string;
}

export interface LlmModelsResponse {
  models: LlmModel[];
  total: number;
  page: number;
  limit: number;
}

export type { LlmProvider };


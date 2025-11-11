export interface LlmProvider {
  providerId: number;
  name: string;
  isDefault: boolean;
  isAvailable: boolean;
  index: number;
  description?: string | null;
  baseUrl?: string | null;
  createdAt: string;
}

export interface CreateLlmProviderInput {
  name: string;
  isDefault?: boolean;
  isAvailable?: boolean;
  index: number;
  description?: string;
  baseUrl?: string;
}

export interface UpdateLlmProviderInput {
  name?: string;
  isDefault?: boolean;
  isAvailable?: boolean;
  index?: number;
  description?: string | null;
  baseUrl?: string | null;
}

export interface GetLlmProvidersQuery {
  isAvailable?: 'true' | 'false' | '';
  isDefault?: 'true' | 'false' | '';
  page?: string;
  limit?: string;
  search?: string;
}

export interface LlmProvidersResponse {
  providers: LlmProvider[];
  total: number;
  page: number;
  limit: number;
}


export interface LlmApiKey {
  keyId: number;
  providerId: number;
  providerName?: string;
  isDefault: boolean;
  priority: number;
  index: number;
  keyValue: string;
  keyType: 'free' | 'paid';
  status: 'active' | 'inactive' | 'expired' | 'rate_limited';
  usageLimitPerDay?: number | null;
  createdAt: string;
}

export interface CreateLlmApiKeyInput {
  providerId: number;
  isDefault?: boolean;
  priority?: number;
  index: number;
  keyValue: string;
  keyType: 'free' | 'paid';
  status?: 'active' | 'inactive' | 'expired' | 'rate_limited';
  usageLimitPerDay?: number | null;
}

export interface UpdateLlmApiKeyInput {
  providerId?: number;
  isDefault?: boolean;
  priority?: number;
  index?: number;
  keyValue?: string;
  keyType?: 'free' | 'paid';
  status?: 'active' | 'inactive' | 'expired' | 'rate_limited';
  usageLimitPerDay?: number | null;
}

export interface GetLlmApiKeysQuery {
  providerId?: string;
  providerName?: string;
  status?: 'active' | 'inactive' | 'expired' | 'rate_limited' | '';
  keyType?: 'free' | 'paid' | '';
  isDefault?: 'true' | 'false' | '';
  page?: string;
  limit?: string;
  search?: string;
}

export interface LlmApiKeysResponse {
  apiKeys: LlmApiKey[];
  total: number;
  page: number;
  limit: number;
}


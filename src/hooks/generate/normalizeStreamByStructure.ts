import { safeJsonParse } from '@/utils';

type SourceType = 'array' | 'string' | 'object' | 'unknown';
type RecoveryStrategy = 'direct' | 'json-recovery' | 'streaming-json' | 'line-split' | 'single-item-fallback' | 'empty';

interface NormalizedMeta {
    sourceType: SourceType;
    recoveryStrategy: RecoveryStrategy;
    originalLength?: number;
}

export interface NormalizedLLMResponse<T = string> {
    /**
     * Always true if normalization completed without fatal failure.
     * False only if input was unrecoverable.
     */
    ok: boolean;

    /**
     * Always present.
     * Guaranteed to be a list of render-safe items of type T.
     */
    items: T[];

    /**
     * Optional diagnostics for observability, never required by UI.
     */
    meta?: NormalizedMeta;
}

/**
 * Transformer function type for extracting structured items from raw strings.
 * Return `null` or `undefined` to skip an item.
 */
export type ItemExtractor<T> = (rawItem: string, index: number) => T | null | undefined;

/**
 * Normalizes raw LLM output into a list of strings.
 * Use `normalizeAndExtract` for type-safe structured extraction.
 */
export function normalizeLLMChunk(input: unknown): NormalizedLLMResponse<string> {
    try {
        if (Array.isArray(input)) {
            return buildResponse(sanitizeList(input), 'array', 'direct', input.length);
        }

        if (typeof input === 'string') {
            return normalizeFromString(input);
        }

        if (typeof input === 'object' && input !== null) {
            const values = Object.values(input);
            return buildResponse(sanitizeList(values), 'object', 'direct', values.length);
        }

        return emptyResponse('unknown');
    } catch {
        return emptyResponse('unknown');
    }
}

/**
 * Normalizes LLM output and extracts structured items using a provided extractor.
 * Items that fail extraction (return null/undefined) are filtered out.
 * Handles streaming/partial JSON arrays.
 */
export function normalizeAndExtract<T>(input: unknown, extractor: ItemExtractor<T>): NormalizedLLMResponse<T> {
    // Handle direct array of objects (common LLM response format)
    if (Array.isArray(input)) {
        const extractedItems: T[] = [];
        for (let i = 0; i < input.length; i++) {
            const item = input[i];
            // If item is already an object, validate it directly
            if (typeof item === 'object' && item !== null) {
                const validated = extractor(JSON.stringify(item), i);
                if (validated != null) {
                    extractedItems.push(validated);
                }
            } else if (typeof item === 'string') {
                const extracted = extractor(item, i);
                if (extracted != null) {
                    extractedItems.push(extracted);
                }
            }
        }
        return {
            ok: extractedItems.length > 0,
            items: extractedItems,
            meta: { sourceType: 'array', recoveryStrategy: 'direct', originalLength: input.length },
        };
    }

    // Handle JSON string (complete or streaming/partial)
    if (typeof input === 'string') {
        const trimmed = input.trim();

        // Try complete JSON array first
        if (looksLikeJsonArray(trimmed)) {
            const parsed = safeJsonParse(trimmed);
            if (Array.isArray(parsed)) {
                return normalizeAndExtract(parsed, extractor);
            }
        }

        // Handle streaming/partial JSON array
        if (trimmed.startsWith('[')) {
            const objects = extractCompleteObjectsFromStream(trimmed);
            if (objects.length > 0) {
                const extractedItems: T[] = [];
                for (let i = 0; i < objects.length; i++) {
                    const validated = extractor(JSON.stringify(objects[i]), i);
                    if (validated != null) {
                        extractedItems.push(validated);
                    }
                }
                return {
                    ok: extractedItems.length > 0,
                    items: extractedItems,
                    meta: { sourceType: 'string', recoveryStrategy: 'streaming-json', originalLength: objects.length },
                };
            }
        }
    }

    const normalized = normalizeLLMChunk(input);

    if (!normalized.ok) {
        return {
            ok: false,
            items: [],
            meta: normalized.meta,
        };
    }

    const extractedItems: T[] = [];

    for (let i = 0; i < normalized.items.length; i++) {
        const extracted = extractor(normalized.items[i], i);
        if (extracted != null) {
            extractedItems.push(extracted);
        }
    }

    return {
        ok: extractedItems.length > 0,
        items: extractedItems,
        meta: normalized.meta,
    };
}

/**
 * Helper to create an extractor that validates parsed objects directly.
 * Works with both JSON strings and pre-parsed objects.
 */
export function createJsonExtractor<T>(validator: (parsed: unknown) => T | null): ItemExtractor<T> {
    return (rawItem: string) => {
        const parsed = safeJsonParse(rawItem);

        if (parsed == null) {
            return null;
        }

        return validator(parsed);
    };
}

/**
 * Helper to create an extractor that validates objects with required fields.
 */
export function createObjectExtractor<T>(requiredFields: (keyof T)[]): ItemExtractor<T> {
    return (rawItem: string) => {
        const parsed = safeJsonParse(rawItem);

        if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return null;
        }

        const obj = parsed as Record<string, unknown>;

        for (const field of requiredFields) {
            if (!(field in obj)) {
                return null;
            }
        }

        return parsed as T;
    };
}

function normalizeFromString(text: string): NormalizedLLMResponse<string> {
    const cleaned = text.trim();

    if (!cleaned) {
        return emptyResponse('string');
    }

    // Phase 1: JSON array recovery
    if (looksLikeJsonArray(cleaned)) {
        const parsed = safeJsonParse(cleaned);
        if (Array.isArray(parsed)) {
            return buildResponse(sanitizeList(parsed), 'string', 'json-recovery', parsed.length);
        }
    }

    // Phase 2: Logical line splitting
    const items = splitByLogicalDelimiters(cleaned);
    if (items.length > 0) {
        return buildResponse(items, 'string', 'line-split', items.length);
    }

    // Phase 3: Hard fallback
    return buildResponse([cleaned], 'string', 'single-item-fallback', 1);
}

function sanitizeList(input: unknown[]): string[] {
    return input
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item == null) return '';
            return String(item).trim();
        })
        .filter(Boolean);
}

function splitByLogicalDelimiters(text: string): string[] {
    const items: string[] = [];
    let buffer = '';
    const pushBuffer = () => {
        const trimmed = buffer.trim();
        if (trimmed) {
            items.push(trimmed);
        }
        buffer = '';
    };

    let i = 0;
    while (i < text.length) {
        const char = text[i];

        if (char === '\n') {
            while (i < text.length && text[i] === '\n') {
                i++;
            }
            pushBuffer();
            continue;
        }

        if (char === '•') {
            i++;
            pushBuffer();
            continue;
        }

        if (char === '-' && text[i + 1] === ' ') {
            i += 2;
            pushBuffer();
            continue;
        }

        if (char >= '0' && char <= '9') {
            let j = i;
            while (j < text.length && text[j] >= '0' && text[j] <= '9') {
                j++;
            }
            if (text[j] === '.') {
                let k = j + 1;
                while (k < text.length && /\s/.test(text[k])) {
                    k++;
                }
                if (k > j + 1) {
                    i = k;
                    pushBuffer();
                    continue;
                }
            }
        }

        buffer += char;
        i++;
    }

    pushBuffer();
    return items;
}

function looksLikeJsonArray(text: string): boolean {
    return text.startsWith('[') && text.endsWith(']');
}

function buildResponse(
    items: string[],
    sourceType: SourceType,
    strategy: RecoveryStrategy,
    originalLength?: number,
): NormalizedLLMResponse {
    return {
        ok: true,
        items,
        meta: {
            sourceType,
            recoveryStrategy: strategy,
            originalLength,
        },
    };
}

function emptyResponse(sourceType: SourceType): NormalizedLLMResponse {
    return {
        ok: false,
        items: [],
        meta: {
            sourceType,
            recoveryStrategy: 'empty',
        },
    };
}

/**
 * Extracts complete JSON objects from a potentially incomplete/streaming JSON array string.
 *
 */
function extractCompleteObjectsFromStream(streamText: string): Record<string, unknown>[] {
    const objects: Record<string, unknown>[] = [];
    let depth = 0;
    let objectStart = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < streamText.length; i++) {
        const char = streamText[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\' && inString) {
            escapeNext = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        if (char === '{') {
            if (depth === 0) {
                objectStart = i;
            }
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0 && objectStart !== -1) {
                const objectStr = streamText.slice(objectStart, i + 1);
                const parsed = safeJsonParse(objectStr);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    objects.push(parsed as Record<string, unknown>);
                }
                objectStart = -1;
            }
        }
    }

    return objects;
}

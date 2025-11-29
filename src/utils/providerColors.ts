/**
 * Get color scheme for a provider based on its name
 */
export function getProviderColor(providerName: string): {
    bg: string;
    text: string;
    border: string;
    hover: string;
    gradientFrom: string;
    gradientTo: string;
} {
    const name = providerName.toLowerCase();
    
    // Google Gemini - Blue/Purple gradient
    if (name.includes('google') || name.includes('gemini')) {
        return {
            bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
            text: 'text-white',
            border: 'border-blue-500',
            hover: 'hover:from-blue-600 hover:to-purple-600',
            gradientFrom: '#3b82f6',
            gradientTo: '#a855f7',
        };
    }
    
    // Anthropic Claude - Orange/Red gradient
    if (name.includes('anthropic') || name.includes('claude')) {
        return {
            bg: 'bg-gradient-to-r from-orange-500 to-red-500',
            text: 'text-white',
            border: 'border-orange-500',
            hover: 'hover:from-orange-600 hover:to-red-600',
            gradientFrom: '#f97316',
            gradientTo: '#ef4444',
        };
    }
    
    // OpenAI - Green/Teal gradient
    if (name.includes('openai') || name.includes('gpt')) {
        return {
            bg: 'bg-gradient-to-r from-green-500 to-teal-500',
            text: 'text-white',
            border: 'border-green-500',
            hover: 'hover:from-green-600 hover:to-teal-600',
            gradientFrom: '#22c55e',
            gradientTo: '#14b8a6',
        };
    }
    
    // Grok - Purple/Pink gradient
    if (name.includes('grok')) {
        return {
            bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
            text: 'text-white',
            border: 'border-purple-500',
            hover: 'hover:from-purple-600 hover:to-pink-600',
            gradientFrom: '#a855f7',
            gradientTo: '#ec4899',
        };
    }
    
    // Default - Gray gradient
    return {
        bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
        text: 'text-white',
        border: 'border-gray-500',
        hover: 'hover:from-gray-600 hover:to-slate-600',
        gradientFrom: '#6b7280',
        gradientTo: '#64748b',
    };
}

/**
 * Get simple badge color class for provider
 */
export function getProviderBadgeClass(providerName: string): string {
    const colors = getProviderColor(providerName);
    return `${colors.bg} ${colors.text} ${colors.hover} border ${colors.border}`;
}


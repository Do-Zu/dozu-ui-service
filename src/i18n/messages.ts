'use server';

/**
 * Message loader utility for next-intl
 * Centralizes loading of translation messages by locale
 */

/**
 * Loads all message files for a specific locale
 * @param locale The locale to load messages for (e.g., 'en', 'vi')
 * @returns An object containing all messages for the specified locale
 */
export async function getMessages(locale: string) {
    // Load base/common messages that are needed across the application

    //-----------------------------SPREAD MESSAGES-------------------------------//
    const messages = {
        ...(await import(`../../messages/${locale}/common.json`)).default,
        ...(await import(`../../messages/${locale}/home.json`)).default,
        ...(await import(`../../messages/${locale}/login.json`)).default,
        ...(await import(`../../messages/${locale}/registerPage.json`)).default,
        ...(await import(`../../messages/${locale}/verifyEmailPage.json`)).default,
        ...(await import(`../../messages/${locale}/welcome.json`)).default,
        ...(await import(`../../messages/${locale}/topic.json`)).default,
        ...(await import(`../../messages/${locale}/flashcard.json`)).default,
        ...(await import(`../../messages/${locale}/progress.json`)).default,
        ...(await import(`../../messages/${locale}/generate.json`)).default,
        ...(await import(`../../messages/${locale}/schedule.json`)).default,
        ...(await import(`../../messages/${locale}/class-based/class.json`)).default,
    };

    // You can dynamically load additional message files based on routes/features
    // For example, conditionally loading feature-specific translations
    try {
        // Uncomment and add additional message files as your app grows
        // Example of conditionally loading specific feature messages:
        // if (someCondition) {
        //   messages = {
        //     ...messages,
        //     ...(await import(`../../messages/${locale}/feature.json`)).default
        //   };
        // }
        // Add more message imports here as your application grows:
        // messages = {
        //   ...messages,
        //   ...(await import(`../../messages/${locale}/blog.json`)).default,
        //   ...(await import(`../../messages/${locale}/auth.json`)).default,
        // };
    } catch (error) {
        console.error(`Error loading messages for locale ${locale}:`, error);
    }

    return messages;
}

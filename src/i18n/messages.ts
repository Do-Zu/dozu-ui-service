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
        ...(await import(`../../messages/${locale}/packages.json`)).default,
        ...(await import(`../../messages/${locale}/login.json`)).default,
        ...(await import(`../../messages/${locale}/registerPage.json`)).default,
        ...(await import(`../../messages/${locale}/payment.json`)).default,
        ...(await import(`../../messages/${locale}/auth/forgotPasswordPage.json`)).default,
        ...(await import(`../../messages/${locale}/auth/changePasswordEmailSentPage.json`)).default,
        ...(await import(`../../messages/${locale}/auth/changePasswordPage.json`)).default,
        ...(await import(`../../messages/${locale}/mindmap/deleteMindmapButton.json`)).default,
        ...(await import(`../../messages/${locale}/mindmap/exportToCSVButton.json`)).default,
        ...(await import(`../../messages/${locale}/mindmap/downloadMindmapButton.json`)).default,
        ...(await import(`../../messages/${locale}/mindmap/importButton.json`)).default,
        ...(await import(`../../messages/${locale}/mindmap/roadmapButton.json`)).default,
        ...(await import(`../../messages/${locale}/verifyEmailPage.json`)).default,
        ...(await import(`../../messages/${locale}/welcome.json`)).default,
        ...(await import(`../../messages/${locale}/topic.json`)).default,
        ...(await import(`../../messages/${locale}/flashcard.json`)).default,
        ...(await import(`../../messages/${locale}/progress.json`)).default,
        ...(await import(`../../messages/${locale}/generate.json`)).default,
        ...(await import(`../../messages/${locale}/schedule.json`)).default,
        ...(await import(`../../messages/${locale}/games.json`)).default,
        ...(await import(`../../messages/${locale}/class-based/class.json`)).default,
        ...(await import(`../../messages/${locale}/class-based/components/editLearningMaterial.json`)).default,
        ...(await import(`../../messages/${locale}/pomodoro.json`)).default,
        ...(await import(`../../messages/${locale}/studentProfile.json`)).default,
        ...(await import(`../../messages/${locale}/transactionHistory.json`)).default,
        ...(await import(`../../messages/${locale}/feynman.json`)).default,
        ...(await import(`../../messages/${locale}/class-based/comment.json`)).default,
        ...(await import(`../../messages/${locale}/ankiSetting.json`)).default,
        ...(await import(`../../messages/${locale}/class-based/assignment.json`)).default,
        ...(await import(`../../messages/${locale}/class-based/classwork.json`)).default,
        ...(await import(`../../messages/${locale}/activities.json`)).default,
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

import { FlashcardItem } from '../components/steps/Final';

export const extractFlashcardsFromText = (textContent: string): FlashcardItem[] => {
  try {
    const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : textContent;

    // Parse the JSON string into an array of flashcards
    const parsedFlashcards = JSON.parse(jsonString);

    // Validate that we have an array of objects with q and a properties
    if (
      Array.isArray(parsedFlashcards) &&
      parsedFlashcards.length > 0 &&
      'q' in parsedFlashcards[0] &&
      'a' in parsedFlashcards[0]
    ) {
      console.log(`Successfully extracted ${parsedFlashcards.length} flashcards from text`);
      return parsedFlashcards;
    } else {
      console.error('Parsed text does not contain valid flashcard data');
      return [];
    }
  } catch (error) {
    console.error('Failed to parse flashcards from text:', error);
    return [];
  }
};

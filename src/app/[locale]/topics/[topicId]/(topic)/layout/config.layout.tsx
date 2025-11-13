import { METHOD_LEARNING } from '@/utils/constants/method';
import FlashCardTab from '../components/tabs/FlashCardTab';
import MindMapTab from '../components/tabs/MindMapTab';
import OverViewTab from '../components/tabs/OverViewTab';
import QuizTab from '../components/tabs/QuizTab';
import { TabConfig } from '../types';
import NoteTab from '../components/tabs/NoteTab';

export const TOPIC_WORKSPACE_TABS: TabConfig[] = [
    { value: 'overview', label: 'Overview', component: OverViewTab },
    { value: METHOD_LEARNING.MINDMAP, label: 'Mindmap', component: MindMapTab },
    { value: METHOD_LEARNING.FLASHCARD, label: 'Flashcards', component: FlashCardTab },
    { value: METHOD_LEARNING.QUIZ, label: 'Quiz', component: QuizTab },
    { value: 'note', label: 'Note', component: NoteTab },
];

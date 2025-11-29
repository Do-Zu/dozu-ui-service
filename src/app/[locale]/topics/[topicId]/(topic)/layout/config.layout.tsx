import { METHOD_LEARNING } from '@/utils/constants/method';
import FlashCardTab from '../components/tabs/FlashCardTab';
import MindMapTab from '../components/tabs/MindMapTab';
import OverViewTab from '../components/tabs/OverViewTab';
import QuizTab from '../components/tabs/QuizTab';
import { TabConfig } from '../types';
import NoteTab from '../components/tabs/NoteTab';
import { FileSpreadsheet, Layers, ListChecks, Network, NotebookText } from 'lucide-react';

export const TOPIC_WORKSPACE_TABS: TabConfig[] = [
    {
        value: 'overview',
        label: 'Overview',
        component: OverViewTab,
        icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    {
        value: METHOD_LEARNING.MINDMAP,
        label: 'Mindmap',
        component: MindMapTab,
        icon: <Network className="h-4 w-4" />,
    },
    {
        value: METHOD_LEARNING.FLASHCARD,
        label: 'Flashcards',
        component: FlashCardTab,
        icon: <Layers className="h-4 w-4" />,
    },
    { value: METHOD_LEARNING.QUIZ, label: 'Quiz', component: QuizTab, icon: <ListChecks className="h-4 w-4" /> },
    { value: 'note', label: 'Note', component: NoteTab, icon: <NotebookText className="h-4 w-4" /> },
];

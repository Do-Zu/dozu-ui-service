import { useState } from 'react';
import { INote } from '../types/note.type';

export default function useNoteWorkspace() {
    const [note, setNote] = useState<INote | null>(null);

    return { note, setNote };
}

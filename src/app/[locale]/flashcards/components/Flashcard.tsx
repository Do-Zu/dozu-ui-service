import { Edit, Trash2 } from 'lucide-react'
import styles from './Flashcard.module.css'

import { useEffect, useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'

export interface IFlashcard {
    flashcardId: number
    topicId: number
    front: string
    back: string
}

type IFlashcardUpdated = Pick<IFlashcard, 'flashcardId' | 'front' | 'back'>;

function Flashcard(
    { flashcard, initialStatus, style } : { flashcard: IFlashcard, initialStatus?: 'front' | 'back', style?: React.CSSProperties }
) {

    const [status, setStatus] = useState<'front' | 'back'>(() => initialStatus ? initialStatus : 'front');
    const [front, setFront] = useState<string>(flashcard.front);
    const [back, setBack] = useState<string>(flashcard.back);
    
    useEffect(() => {
        if(initialStatus) setStatus(initialStatus);
    }, [initialStatus]);

    function handleFlip() {
        setStatus(prevStatus => {
            return prevStatus === 'front' ? 'back' : 'front';
        })
    }

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
  
    const closeModal = () => setIsModalOpen(false);

    async function handleSave() {
        const flashcardUpdated: IFlashcardUpdated = { flashcardId: flashcard.flashcardId, front, back };
        try {
            const dataResponse = await axios.put('/flashcards', { flashcardUpdated });
            console.log(dataResponse);
        } catch(err) {
            console.log(err);
        } 
    }

    function handleDelete() {

    }

    return (
        <div className={styles.container} style={style} onClick={handleFlip}>
            <div style={{ display: 'flex', flexDirection: 'row', padding: 20, justifyContent: 'flex-end', gap: 10 }}>
                {/* <Edit style={{ cursor: 'pointer'}} onClick={openModal} />
                <Trash2 style={{ cursor: 'pointer'}} onClick={handleDelete} /> */}
            </div>
            <div className={styles.text}>{status === 'front' ? flashcard.front : flashcard.back}</div>

            {isModalOpen && (
                <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                onClick={closeModal} 
                >
                <div
                    className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-4">Edit Flashcard</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Textarea value={front} onChange={(event) => setFront(event.target.value)}/>
                        <Textarea value={back} onChange={(event) => setBack(event.target.value)}/>
                    </div>

                    <div className="flex justify-end gap-4" style={{ marginTop: 10 }}>
                        <Button onClick={handleSave}>
                            Save
                        </Button>

                        <Button onClick={closeModal} style={{ backgroundColor: 'red' }}>
                            Cancel
                        </Button>
                    </div>
                </div>
                </div>
            )}
        </div>
    )
}

export default Flashcard;
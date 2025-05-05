// import { fromUnixTime } from 'date-fns'
// import styles from './Flashcard.module.css'

// import { useEffect, useRef, useState } from "react"

export interface IFlashcard {
    flashcardId: number
    topicId: number
    front: string
    back: string
}

// function Flashcard(
//     { 
//         style, 
//         flashcard, 
//         isInitialFront = true, 
//         autoPlayEnabled = false, 
//         autoPlaySpeed = 3,
//         handleNextFlashcardCallback,
//         isFront = true,
//         handleFlip
//     } :
//     { 
//         style?: React.CSSProperties, 
//         flashcard: IFlashcard, 
//         isInitialFront?: boolean, 
//         autoPlayEnabled: boolean, 
//         autoPlaySpeed: number,
//         handleNextFlashcardCallback: Function,
//         isFront: boolean,
//         handleFlip: Function
//     }
// ) {

//     const [isMounted, setIsMounted] = useState<boolean>(false);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const cardRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         setIsMounted(true);
//         if(cardRef.current) {
//             cardRef.current.style.transform = 'rotateX(0deg)';
//             cardRef.current.style.transition = 'transform 0.6s';
//         }
//     }, []);

//     useEffect(() => {
//         console.log(`Change isFront, isFront: ${isFront}`);
//         if(!isMounted) return;
//         if(cardRef.current) {
//              cardRef.current.style.transform = !isFront ? 'rotateX(180deg)': 'rotateX(0deg)';
//         }
//     }, [isFront]);

//     // đợi 3s -> lật mặt sau (nếu đang front) -> đợi 3s -> next flashcard

//     useEffect(() => {
//         if(!autoPlayEnabled) return;
//         console.log('isFront: ', isFront);
//         let timer1, timer2: any;
//         timer1 = setTimeout(() => {
//             handleFlip();
//             timer2 = setTimeout(() => {
//                 if(cardRef.current) {
//                     cardRef.current.style.transition = 'none';
//                     cardRef.current.style.transform = 'rotateX(0deg)';
//                 }

//                 handleNextFlashcardCallback();

//                 setTimeout(() => {
//                     if(cardRef.current) cardRef.current.style.transition = 'transform 0.6s';
//                 }, 100);
//             }, autoPlaySpeed)
//         }, autoPlaySpeed);

//         return () => {
//             clearTimeout(timer1);
//             clearTimeout(timer2);
//         }
//     }, [flashcard, autoPlayEnabled, autoPlaySpeed]);

//     return (
//         <div className={styles.container} ref={containerRef} onClick={() => handleFlip()}>
//             <div className={styles.card} ref={cardRef}>
//                 <div className={styles.front}>
//                     {flashcard.front}
//                 </div>

//                 <div className={styles.back}>
//                     {flashcard.back}
//                 </div>
//             </div>
            
//         </div>
//     )
// }

// export default Flashcard;
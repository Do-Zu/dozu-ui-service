import { Angry, ThumbsUp, Smile, Laugh, Frown, Meh } from 'lucide-react';
import { TimeUnit } from '@/utils';
import { IAnkiRating } from '@/types/anki';

type ILearningOptionElement = {
    icon: any;
    label: string;
    rating: IAnkiRating;
};

export function useLearningOptions(): ILearningOptionElement[] {
    const trackingOptions: ILearningOptionElement[] = [
        {
            icon: <Frown size={24} className="text-orange-500" />,
            label: 'Again',
            rating: IAnkiRating.AGAIN,
        },
        {
            icon: <Meh size={24} className="text-lime-500" />,
            label: 'Hard',
            rating: IAnkiRating.HARD,
        },
        {
            icon: <Smile size={24} className="text-blue-500" />,
            label: 'Good',
            rating: IAnkiRating.GOOD,
        },
        {
            icon: <Laugh size={24} className="text-yellow-500" />,
            label: 'Easy',
            rating: IAnkiRating.EASY,
        },
    ];

    return trackingOptions;
}

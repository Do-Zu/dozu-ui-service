import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { IClasswork } from '../services/classwork.service';
import { ALL_TOPICS, NO_TOPIC } from './classwork.constant';

class ClassworkUtils {
    public getStudentDisplayName({
        fullName,
        email,
        username,
    }: {
        fullName: string | null;
        email: string;
        username: string;
    }) {
        return fullName ?? email ?? username;
    }

    public getSelectedClasswork({
        classworkByTopic,
        topicId,
    }: {
        classworkByTopic: Map<number, IClasswork[]> | null;
        topicId: string;
    }) {
        if (!classworkByTopic || topicId === ALL_TOPICS) return null;
        if (isNaN(Number(topicId))) return null;
        const result = classworkByTopic.get(Number(topicId));
        return result === undefined ? null : result;
    }

    public getClassworkByTopic({
        classwork,
        topics,
    }: {
        classwork: IClasswork[];
        topics: Pick<ITopic, 'topicId' | 'name'>[];
    }) {
        const result: Map<number, IClasswork[]> = new Map<number, IClasswork[]>();
        for (const topic of topics) {
            result.set(topic.topicId, []);
        }
        for (const classworkItem of classwork) {
            const prevClasswork = result.get(classworkItem.item.topicId ?? NO_TOPIC.topicId);
            if (prevClasswork) {
                prevClasswork.push(classworkItem);
            } else {
                result.set(classworkItem.item.topicId ?? NO_TOPIC.topicId, [classworkItem]);
            }
        }
        return result;
    }
}

export default new ClassworkUtils();

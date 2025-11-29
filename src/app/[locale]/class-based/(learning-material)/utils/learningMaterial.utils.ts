import { ITopic } from '@/app/[locale]/topics/types/topic.type';
// import { IAssignment, InsertAssignmentStatus } from '../types/assignment.type';
import { ALL_TOPICS, NO_TOPIC, NO_TOPIC_ID } from '../../(classwork)/utils/classwork.constant';
import { ILearningMaterial } from '../types/learningMaterial.type';

class LearningMaterialUtils {
    public getSelectedLearningMaterials(
        learningMaterialsByTopic: Map<number, ILearningMaterial[]> | null,
        topicId: string,
    ): ILearningMaterial[] | null {
        if (!learningMaterialsByTopic || topicId === ALL_TOPICS) return null;
        if (isNaN(Number(topicId))) return null;
        const result = learningMaterialsByTopic.get(Number(topicId));
        return result === undefined ? null : result;
    }

    // public getSelectedTopicName(topics: Pick<ITopic, 'topicId' | 'name'>[], topicId: string): string {
    //     if (isNaN(Number(topicId))) return '';
    //     const topic = topics.find((topic) => topic.topicId === Number(topicId));
    //     const result = topic ? topic.name : '';
    //     return result;
    // }

    public getLearningMaterialsByTopic(
        learningMaterials: ILearningMaterial[],
        topics: Pick<ITopic, 'topicId' | 'name'>[],
    ): Map<number, ILearningMaterial[]> {
        const result: Map<number, ILearningMaterial[]> = new Map<number, ILearningMaterial[]>();
        for (const topic of topics) {
            result.set(topic.topicId, []);
        }
        for (const learningMaterial of learningMaterials) {
            const prevLearningMaterials = result.get(learningMaterial.topicId ?? NO_TOPIC.topicId);
            if (prevLearningMaterials) {
                prevLearningMaterials.push(learningMaterial);
            } else {
                result.set(learningMaterial.topicId ?? NO_TOPIC.topicId, [learningMaterial]);
            }
        }
        return result;
    }

    public parseTopicId(selectedTopic: string): number | null {
        if (selectedTopic === NO_TOPIC_ID) return null;
        if (isNaN(Number(selectedTopic))) {
            throw new Error('Selected topic is invalid, please try again.');
        }
        return Number(selectedTopic);
    }

    // public getStatusLabel(status: InsertAssignmentStatus) {
    //     switch (status) {
    //         case 'draft': {
    //             return 'Lưu bản nháp';
    //         }
    //         case 'scheduled': {
    //             return 'Lên lịch';
    //         }
    //         case 'published': {
    //             return 'Giao bài ngay';
    //         }
    //         default: {
    //             return 'Giá trị không hợp lệ';
    //         }
    //     }
    // }
}

export default new LearningMaterialUtils();

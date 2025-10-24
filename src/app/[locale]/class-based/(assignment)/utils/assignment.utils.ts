import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { IAssignment, InsertAssignmentStatus } from '../types/assignment.type';

export const NO_TOPIC = { topicId: -1, name: 'Không có chủ đề' };
export const ALL_TOPICS = 'all';
export const NO_TOPIC_ID = '-1';

class AssignmentUtils {
    public getSelectedAssignments(
        assignmentsByTopic: Map<number, IAssignment[]> | null,
        topicId: string,
    ): IAssignment[] | null {
        if (!assignmentsByTopic || topicId === ALL_TOPICS) return null;
        if (isNaN(Number(topicId))) return null;
        const result = assignmentsByTopic.get(Number(topicId));
        return result === undefined ? null : result;
    }

    public getSelectedTopicName(topics: Pick<ITopic, 'topicId' | 'name'>[], topicId: string): string {
        if (isNaN(Number(topicId))) return '';
        const topic = topics.find((topic) => topic.topicId === Number(topicId));
        const result = topic ? topic.name : '';
        return result;
    }

    public getAssignmentsByTopic(
        assignments: IAssignment[],
        topics: Pick<ITopic, 'topicId' | 'name'>[],
    ): Map<number, IAssignment[]> {
        const result: Map<number, IAssignment[]> = new Map<number, IAssignment[]>();
        for (const topic of topics) {
            result.set(topic.topicId, []);
        }
        for (const assignment of assignments) {
            const prevAssignments = result.get(assignment.topicId ?? NO_TOPIC.topicId);
            if (prevAssignments) {
                prevAssignments.push(assignment);
            } else {
                result.set(assignment.topicId ?? NO_TOPIC.topicId, [assignment]);
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

    public getStatusLabel(status: InsertAssignmentStatus) {
        switch (status) {
            case 'draft': {
                return 'Lưu bản nháp';
            }
            case 'scheduled': {
                return 'Lên lịch';
            }
            case 'published': {
                return 'Giao bài ngay';
            }
            default: {
                return 'Giá trị không hợp lệ';
            }
        }
    }
}

export default new AssignmentUtils();

import topicService, {
    ICreateTopicPayload,
    IUpdateTopicPayload,
} from '@/services/topic/topic.service';
import { ITopic } from '../types/topic.type';
import useFetch from '@/hooks/useFetch';
import { useCreateTopic } from './useCreateTopic';
import { useUpdateTopic } from './useUpdateTopic';
import { useDeleteTopic } from './useDeleteTopic';
import { useTopicDetails } from './useTopicDetails';
import teacherTopicService from '@/services/class-based-learning/teacher/teacherTopic.service';
import studentTopicService from '@/services/class-based-learning/student/studentTopic.service';

interface PersonalProps {
    mode: 'personal';
}

interface ClassBasedProps {
    mode: 'class-based';
    role: 'student' | 'teacher';
    classId: number;
}

type Props = PersonalProps | ClassBasedProps;

export function useTopics(props: Props) {
    const { mode } = props;
    // ----- FETCH -----
    const fetchFn = () =>
        mode === 'personal'
            ? topicService.getTopics()
            : props.role === 'teacher'
              ? teacherTopicService.getTopicsInClass(props.classId)
              : studentTopicService.getTopicsInClass(props.classId);
    const {
        data: topics,
        setData: setTopics,
        error: topicsError,
        loading: topicsLoading,
    } = useFetch<ITopic[]>(fetchFn);

    // ----- CREATE -----
    const createFn = (payload: ICreateTopicPayload) =>
        mode === 'personal'
            ? topicService.createTopic(payload)
            : teacherTopicService.createTopicForClass({ ...payload, classId: props.classId });
    const createTopic = useCreateTopic({ setTopics, createFn });

    // ----- UPDATE -----
    const updateFn =
        mode === 'personal'
            ? (payload: IUpdateTopicPayload) => topicService.updateTopic(payload)
            : (payload: IUpdateTopicPayload) =>
                  teacherTopicService.updateTopicInClass({ ...payload, classId: props.classId });
    const updateTopic = useUpdateTopic({ setTopics, updateFn });

    // ----- DELETE -----
    const deleteFn =
        mode === 'personal'
            ? (payload: number) => topicService.deleteTopic(payload)
            : (payload: number) => teacherTopicService.deleteTopicInClass({ classId: props.classId, topicId: payload });
    const deleteTopic = useDeleteTopic({ setTopics, deleteFn });

    // ----- DISPLAY TOPIC DETAILS -----
    const showTopicDetails = useTopicDetails();

    return {
        fetchTopics: { topics, topicsError, topicsLoading },
        createTopic,
        updateTopic,
        deleteTopic,
        showTopicDetails,
    };
}

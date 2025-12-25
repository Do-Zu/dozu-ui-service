'use client';

import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import QuestionEditor from '@/app/[locale]/question/components/QuestionEditor';
import { IQuestion, IQuestionBasic } from '@/app/[locale]/question/types/question.type';
import { handleConvertToQuestionsEdited } from '@/app/[locale]/question/utils/handleConvertToQuestionsEdited';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { useQuizWorkspace } from '../context/QuizWorkspaceContext';

interface IQuestionServer {
    questionId: number;
    topicId: number;
    isUpdated: boolean;
    isDeleted: boolean;
}

interface IQuestionWithServer extends IQuestion {
    serverInfo?: IQuestionServer;
}

interface IQuestionsWithTopicName {
    questions: IQuestionBasic[];
    topicName: string;
}

export default function QuizEditTab() {
    const { topicId, topic } = useTopicWorkspace();

    const { generatedQuestionsForEdit, setGeneratedQuestionsForEdit } = useQuizWorkspace();

    const {
        data: questionsExisted,
        loading,
        error,
    } = useFetch<IQuestionsWithTopicName>(`/questions?topicId=${topicId}`);

    const [questions, setQuestions] = useState<IQuestionWithServer[]>();

    useEffect(() => {
        if (!questionsExisted) return;
        const converted = handleConvertToQuestionsEdited({
            type: 'manual',
            questionsProp: questionsExisted,
        });
        setQuestions(converted);
    }, [questionsExisted]);

    // If there is generatedQuestionsForEdit => edit mode for AI
    if (generatedQuestionsForEdit) {
        return (
            <div className="w-full h-full overflow-y-auto rounded-lg border bg-muted">
                <QuestionEditor
                    shouldShowBackButton={true}
                    shouldShowSaveButton={true}
                    questions={generatedQuestionsForEdit}
                    setQuestions={setGeneratedQuestionsForEdit}
                    topic={{ topicId, name: topic?.name || 'Questions' }}
                />
            </div>
        );
    }

    if (loading) return <LoadingPage />;
    if (error) return <DataStatus variant="error" title={error} />;
    if (!questions) return <DataStatus variant="empty" />;

    return (
        <div className="w-full h-full overflow-y-auto rounded-lg border bg-muted">
            <QuestionEditor
                shouldShowBackButton={false}
                shouldShowSaveButton={true}
                questions={questions}
                setQuestions={setQuestions}
                topic={{ topicId, name: questionsExisted!.topicName || topic?.name || 'Questions' }}
            />
        </div>
    );
}

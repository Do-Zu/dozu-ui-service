'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import useFetch from '@/hooks/useFetch';
import QuestionEditor from '../../components/QuestionEditor';
import { IQuestion, IQuestionBasic } from '../../types/question.type';
import LoadingPage from '@/app/loading';
import { handleConvertToQuestionsEdited } from '../../utils/handleConvertToQuestionsEdited';

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

const Page = () => {
    const params = useParams();
    if (!params?.topicId) return <div>No topic id is provided</div>;

    const { topicId } = params as { topicId: string };

    const {
        data: questionsExisted,
        loading,
        error,
    } = useFetch<IQuestionsWithTopicName>(`/questions?topicId=${topicId}`);
    const [questions, setQuestions] = useState<IQuestionWithServer[]>();
    console.log({questions})

    useEffect(() => {
        if (!questionsExisted) return;
        const questions = handleConvertToQuestionsEdited({
            type: 'manual',
            questionsProp: questionsExisted,
        });
        setQuestions(questions);
    }, [questionsExisted]);

    if (loading) return <LoadingPage />;
    if (error) return <div>Error: {error}</div>;
    if (!questions) return <div>Questions is empty</div>;

    return (
        <QuestionEditor
            questions={questions}
            setQuestions={setQuestions}
            topic={{ topicId, name: questionsExisted!.topicName }}
        />
    );
};

export default Page;

'use client'

import useFetch from "@/hooks/useFetch";
import { useCallback, useEffect, useState } from "react";
import BackButton from "../flashcards/components/BackButton";
import { Book, CirclePlus, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteRequest, getRequest } from "@/api/api";
import axios from "axios";
import Axios from "@/api/axios";

export interface ITopic {
    topicId: number
    userId: number
    name: string
    description: string | null
    createdAt: Date
}

export type IBasicTopic = Pick<ITopic, 'topicId' | 'name' | 'description'> & { flashcardsCount?: number }

const Page = () => {

    const userId = 2;
    const router = useRouter();

    // const topicsSelector = useCallback(( data: { topics: IBasicTopic[] }) => data.topics, []);
    // const {
    //     data: topics,
    //     setData: setTopics,
    //     error: topicsError,
    //     loading: topicsLoading
    // } = useFetch<IBasicTopic[]>(`/topics?userId=${userId}`, topicsSelector);

    // if(topicsLoading || !topics) {
    //     return <div>Loading...</div>
    // }

    // if(topicsError) {
    //     return <div>Error: { topicsError } </div>
    // }

    // if(topics.length === 0) {
    //     return <div>No Topics available</div>
    // }

    const [topics, setTopics] = useState<IBasicTopic[]>();

    useEffect(() => {
        async function fetchTopics() {
            try {
                const data = await Axios.get('/topics');
                console.log(data);
                // setTopics(data.topics);
            } catch(err) {
                console.log(err);
            }
        }
        fetchTopics();
    }, []);

    function handleClickStudy(topicId: number) {
        router.push(`/flashcards/study?topicId=${topicId}`);
    }

    function handleClickEdit(topicId: number) {
        router.push(`/topics/${topicId}`);
    }

    function handleClickCreate() {
        router.push('/topics/create');
    }

    async function handleClickDelete(topicId: number) {
        try {
            await deleteRequest(`/topics/${topicId}`);
            const topicsFiltered = topics!.filter((topic) => topic.topicId !== topicId);
            setTopics(topicsFiltered);
        } catch(err) {
            console.log(err);
        }
    }

    function getDescriptionFormatted(description: string) {
        let descriptionFormatted = description.slice(0, 50);
        if(description.length > 50) descriptionFormatted += '...'; 
        return descriptionFormatted;
    }

    console.log(topics);
    return (
        // <div className="px-[4rem] py-7 bg-[#F9FAFB]">
        <div>
            <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-4 items-center">
                    <BackButton/>
                    <div className="text-[#1F2937] text-[1.7rem] font-bold">My Topics</div>
                </div>
                <Button className="flex flex-row items-center" onClick={handleClickCreate}>
                    <CirclePlus/>
                    <div className="text-base" >New Topic</div>
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-col mt-7">
                {topics.map((topic) => {
                    return (
                        <div className="col-span-3 bg-white rounded-lg p-4" key={topic.topicId}>
                            <div className="flex flex-row items-center justify-between">
                                <a className="text-xl font-medium cursor-pointer hover:text-blue-600 hover:underline">{topic.name}</a>
                                <div className="flex flex-row gap-2">
                                    <Book size={20} className="cursor-pointer" onClick={() => handleClickStudy(topic.topicId)}/>
                                    <SquarePen size={20} className="cursor-pointer" onClick={() => handleClickEdit(topic.topicId)}/>
                                    <Trash2 size={20} className="cursor-pointer" onClick={() => handleClickDelete(topic.topicId)}/>
                                </div>
                            </div>
                            <div className="text-muted-foreground text-base h-[80px]">{topic.description ? getDescriptionFormatted(topic.description) : 'No description'}</div>
                            <div className="flex flex-row justify-between">
                                <div className="text-muted-foreground text-sm">Last review: 14/05/2025</div>
                                <div className="text-muted-foreground text-sm">{topic.flashcardsCount} Flashcards</div>
                            </div>
                        </div>
                        
                    )
                })}
            </div>
        </div>
    )
}

export default Page;
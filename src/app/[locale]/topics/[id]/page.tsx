'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/useFetch";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { IBasicTopic } from "../page";
import { putRequest } from "@/api/api";
import BackButton from "../../flashcards/components/BackButton";
import { Textarea } from "@/components/ui/textarea";

const Page = () => {
    const router = useRouter();
    const params = useParams();
    if(!params.id) return (
        <div>
            No topic id is provided 
        </div>
    )

    const { id: topicId } = params;
    const topicSelector = useCallback(( data: { topic: IBasicTopic }) => data.topic, []);

    const {
        data: topic,
        setData,
        loading: topicLoading,
        error: topicError
    } = useFetch<IBasicTopic>(`/topics/${topicId}`, topicSelector);

    const [name, setName] = useState<string | undefined>();
    const [description, setDescription] = useState<string | undefined | null>();

    useEffect(() => {
        setName(topic?.name);
        setDescription(topic?.description);
    }, [topic]);
    
    if(topicLoading) {
        return <div>Loading...</div>
    }

    if(topicError) {
        return <div>Something went wrong with a Topic</div>
    }

    if(!topic) {
        return <div>Topic not Found</div>
    }

    function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }
    
    function handleOnChangeDescription(event: ChangeEvent<HTMLTextAreaElement>) {
        setDescription(event.target.value);
    }

    async function handleOnSaveChanges() {
        try {
            const topicName = name, topicDescription = description ? description : '';
            const dataSubmitted = { topicName, topicDescription };
            await putRequest(`/topics/${topicId}`, dataSubmitted);
        } catch(err) {
            console.log(err);
        }
    }

    function handleClickEditFlashcards() {
        router.push(`/flashcards/edit?topicId=${topicId!}`);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row gap-4 items-center">
                    <BackButton/>
                    <div className="text-primary text-2xl font-bold">Edit Topic</div>
                </div>
                <Button className="text-base" onClick={handleClickEditFlashcards}>Edit Flashcards</Button>
            </div>
            <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">Name</div>
                <Input value={name} onChange={handleOnChangeName} />
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">Description</div>
                <Textarea value={description? description : ''} onChange={handleOnChangeDescription} rows={10} />
            </div>

            <div>
                <Button className="text-base" onClick={handleOnSaveChanges}>Save changes</Button>
            </div>
        </div>
    )
}

export default Page;
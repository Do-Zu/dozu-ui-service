'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useState } from "react";
import BackButton from "../../flashcards/components/BackButton";
import { postRequest } from "@/api/api";
import { useRouter } from "next/navigation";

const Page = () => {
    const userId = 2;
    const router = useRouter();

    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }
    
    function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
        setDescription(event.target.value);
    }

    async function handleClickCreate() {
        if(!name) {
            alert("Name can't be blank");
            return;
        }

        const dataSubmitted = { topicName: name, topicDescription: description }; 
        try {
            await postRequest(`/topics?userId=${userId}`, dataSubmitted);
            router.push('/topics');
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
                <BackButton/>
                <div className="text-primary text-2xl font-bold">Create New Topic</div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">Name</div>
                <Input value={name} onChange={handleOnChangeName} />
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">Description</div>
                <Input value={description? description : ''} onChange={handleOnChangeDescription} />
            </div>

            <div>
                <Button className="text-base" onClick={handleClickCreate}>Create</Button>
            </div>

        </div>
    )
}

export default Page;
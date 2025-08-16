'use client'

import ClassTopicLibrary from "../components/ui/ClassTopicLibrary";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const classId = Number(params?.id as string);

    return (
        <div className="flex flex-col h-full mt-4">
            <ClassTopicLibrary
                classId={classId}
            />
        </div>
    )
}
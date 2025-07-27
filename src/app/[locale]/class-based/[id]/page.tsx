'use client'

import ClassTopicLibrary from "@/app/[locale]/topics/components/class-based/ClassTopicLibrary";
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
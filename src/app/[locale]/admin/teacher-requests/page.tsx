'use client'

import useFetch from "@/hooks/useFetch";
import RequestList from "./components/RequestList";
import { ITeacherRequest } from "./types/teacherRequest.type";
import LoadingPage from "@/app/loading";

export default function Page() {
    const {
        data: teacherRequests,
        setData: setTeacherRequests,
        error: teacherRequestsError,
        loading: teacherRequestsLoading,
    } = useFetch<ITeacherRequest[]>('/teacher-requests/all');

    if (teacherRequestsError) {
        return <div>Error: {teacherRequestsError}</div>;
    }
    if (teacherRequestsLoading) {
        return <LoadingPage />;
    }
    if (teacherRequests === undefined || teacherRequests === null) {
        return <div>Requests Not Found</div>;
    }

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <RequestList requests={teacherRequests} />
        </div>
    )
}
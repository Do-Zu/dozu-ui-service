'use client';

import useFetch from '@/hooks/useFetch';
import { ITeacherRequest } from '../types/teacherRequest.type';
import PendingRequestLit from '../components/PendingRequestList';
import LoadingPage from '@/app/loading';
import { toast } from '@/hooks/use-toast';
import teacherRequestService from '@/services/teacher-request/teacherRequest.service';

export default function Page() {
    const {
        data: teacherRequests,
        setData: setTeacherRequests,
        error: teacherRequestsError,
        loading: teacherRequestsLoading,
    } = useFetch<ITeacherRequest[]>('/teacher-requests/pending');

    async function handleApproveClick(requestId: number) {
        if (teacherRequests === undefined || teacherRequests === null) return;
        try {
            const result = await teacherRequestService.approveRequest(requestId);
            const requestsFiltered = teacherRequests.filter((e) => e.requestId !== result.data.requestId);
            setTeacherRequests(requestsFiltered);
            toast({
                title: 'Approve Teacher Request successfully!',
            });
        } catch (err) {
            toast({
                title: 'Approve Teacher Request failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    async function handleRejectClick(requestId: number) {
        if (teacherRequests === undefined || teacherRequests === null) return;
        try {
            const result = await teacherRequestService.rejectRequest(requestId);
            const requestsFiltered = teacherRequests.filter((e) => e.requestId !== result.data.requestId);
            setTeacherRequests(requestsFiltered);
            toast({
                title: 'Reject Teacher Request successfully!',
            });
        } catch (err) {
            toast({
                title: 'Reject Teacher Request failed, please try again!',
                variant: 'destructive',
            });
        }
    }

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
            <PendingRequestLit
                requests={teacherRequests}
                handleApproveClick={handleApproveClick}
                handleRejectClick={handleRejectClick}
            />
        </div>
    );
}

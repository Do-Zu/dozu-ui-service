'use client'; 

import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import teacherRequestService from '@/services/teacher-request/teacherRequest.service';
import { ITeacherRequest } from '../admin/teacher-requests/types/teacherRequest.type';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import TeacherRequestStatus from './components/RequestStatus';
import RequestForm from './components/RequestForm';

export default function Page() {
    const [description, setDescription] = useState<string>('');
    const {
        data: myRequest,
        setData: setMyRequest,
        error: myRequestError,
        loading: myRequestLoading,
    } = useFetch<ITeacherRequest>(`/teacher-requests`);

    async function handleSubmitClick() {
        if (!description) {
            toast({
                title: 'You must provide a reason',
                variant: 'destructive',
            });
            return;
        }

        try {
            const result = await teacherRequestService.sendRequest(description);
            toast({
                title: 'Send Teacher Request successfully',
            });
            setMyRequest(result.data);
        } catch (err) {
            toast({
                title: 'Send Teacher Request failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    if (myRequestError) {
        return <div>Error: {myRequestError}</div>;
    }
    if (myRequestLoading) {
        return <LoadingPage />;
    }
    if (myRequest) {
        return <TeacherRequestStatus request={myRequest} />;
    }

    return (
        <div className="flex h-[70%] justify-center items-center">
            <RequestForm
                description={description}
                setDescription={setDescription}
                handleSubmitClick={handleSubmitClick}
            />
        </div>
    );
}

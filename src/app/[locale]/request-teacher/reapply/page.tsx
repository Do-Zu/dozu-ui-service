'use client'; 

import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import teacherRequestService from '@/services/teacher-request/teacherRequest.service';
import { ITeacherRequest } from '../../admin/teacher-requests/types/teacherRequest.type';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import TeacherRequestStatus from '../components/RequestStatus';
import RequestForm from '../components/RequestForm';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    const [description, setDescription] = useState<string>('');

    async function handleSubmitClick() {
        if (!description) {
            toast({
                title: 'You must provide a reason',
                variant: 'destructive',
            });
            return;
        }

        try {
            await teacherRequestService.sendRequest(description);
            toast({
                title: 'Send Teacher Request successfully',
            });
            router.push('/request-teacher');
            
        } catch (err) {
            toast({
                title: 'Send Teacher Request failed, please try again!',
                variant: 'destructive',
            });
        }
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

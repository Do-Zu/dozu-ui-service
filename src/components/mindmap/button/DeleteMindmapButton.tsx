import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

interface DeleteMindmapButtonProps {
    isPanelExpanded: boolean;
}

const DeleteMindmapButton = ({ isPanelExpanded }: DeleteMindmapButtonProps) => {
    const params = useParams();
    const { topicId } = params as { topicId: string };
    const router = useRouter();
    const t = useTranslations('DeleteMindmapButton');

    const { loading, execute: deleteAsync } = usePost<string, any>(`/mindmap/${topicId}`, 'DELETE', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(t('deleteSuccessMessage'));
            router.refresh();
            // applyDelete(data);
            // setIsOpen(false);
        },
    });

    async function submit(topicId: string) {
        await deleteAsync(topicId);
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash />
                    {isPanelExpanded ? <>{t('deleteMindmapButtonText')}</> : ''}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmationTitle')}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('confirmationCancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            deleteAsync(topicId);
                        }}
                    >
                        {t('confirmationProceed')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteMindmapButton;

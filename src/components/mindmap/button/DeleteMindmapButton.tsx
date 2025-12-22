import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';

interface DeleteMindmapButtonProps {
    isPanelExpanded: boolean;
}

const DeleteMindmapButton = ({ isPanelExpanded }: DeleteMindmapButtonProps) => {
    // const params = useParams();
    // const { topicId } = params as { topicId: string };
    const { topicId, setNodes, nodes, setEdges } = useMindMapContext();

    const router = useRouter();
    const t = useTranslations('DeleteMindmapButton');

    const { loading, execute: deleteAsync } = usePost<string, any>(`/mindmap/${topicId}`, 'DELETE', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(t('deleteSuccessMessage'));
            router.refresh();
            // applyDelete(data);
            // setIsOpen(false);
            setNodes(nodes.filter((node) => node.data.isRoot === true));
            setEdges([]);
        },
    });

    const handleDeleteMindmap = async () => {
        await deleteAsync(topicId as string);
    };

    async function submit(topicId: string) {
        await deleteAsync(topicId);
    }
    return (
        // <Tooltip>
        //     <TooltipTrigger asChild>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon-sm">
                    <Trash />
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
                            handleDeleteMindmap();
                        }}
                    >
                        {t('confirmationProceed')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        //         <TooltipContent side="bottom"> {t('deleteMindmapButtonText')}</TooltipContent>
        //     </TooltipTrigger>
        // </Tooltip>
    );
};

export default DeleteMindmapButton;

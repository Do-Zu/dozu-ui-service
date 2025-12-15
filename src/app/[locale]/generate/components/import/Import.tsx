import { memo } from 'react';
import { useCardImportSelector, useCardImportDispatch } from '../../hooks/useReduxStore';
import { setImportMethod } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { IMPORT_METHOD, ImportMethod } from '@/app/[locale]/generate/constants/resource';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Link, Video } from 'lucide-react';
import TabContent from './components/TextUrlContentTab';
import FileTab from './components/FileTab';
import MediaTab from './components/MediaTab';

const Import: React.FC = memo(() => {
    const dispatch = useCardImportDispatch();

    const { importMethod } = useCardImportSelector((state) => state.importDialog);

    return (
        <Tabs
            defaultValue={IMPORT_METHOD.FILE}
            value={importMethod}
            onValueChange={(value) => {
                dispatch(setImportMethod(value as ImportMethod));
            }}
        >
            <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value={IMPORT_METHOD.FILE} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Files</span>
                </TabsTrigger>
                <TabsTrigger value={IMPORT_METHOD.TEXT} className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span>URL</span>
                </TabsTrigger>
                <TabsTrigger value={IMPORT_METHOD.MEDIA} className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Media</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value={IMPORT_METHOD.FILE} className="mt-4">
                <FileTab />
            </TabsContent>

            <TabsContent value={IMPORT_METHOD.TEXT} className="mt-4">
                <TabContent />
            </TabsContent>

            <TabsContent value={IMPORT_METHOD.MEDIA} className="mt-4">
                <MediaTab />
            </TabsContent>
        </Tabs>
    );
});

export default Import;

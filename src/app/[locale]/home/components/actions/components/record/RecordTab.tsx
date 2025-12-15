import React, { useEffect, useRef, useState } from 'react';
import { Mic, Monitor } from 'lucide-react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Card, CardContent } from '@/components/ui/card';
import LoadingNode from '@/app/[locale]/topics/[topicId]/(topic)/components/common/LoadingNode';
import { Button } from '@/components/ui/button';
import toastHelper from '@/utils/toast.helper';
import { useInterval } from '@/hooks/useInterval';
import { format } from 'date-fns';
import { blobToFile } from '../../helper/helper';
import useUploadMediaFile from '../../hooks/useUploadMediaFile';
import { useActionStore } from '../../context/ActionContext';

function AcquiringMedia() {
    return <LoadingNode title="Preparing" />;
}

const AUDIO_RECORD_EXT = '.wav';

export default function RecordTab() {
    const [timeRecording, setTimeRecording] = useState<number>(0);
    const submitAfterStopRef = useRef<boolean>(false);
    const { validateAudioFile, handleProcessingContent } = useUploadMediaFile();
    const { setShowMedia } = useActionStore((state) => state);

    const audioRecorder = useReactMediaRecorder({
        audio: true,
        blobPropertyBag: { type: `audio/mpeg` },
        onStop(blobUrl, blob) {
            if (!submitAfterStopRef.current) return;
            handleSubmit(blob);
        },
    });

    useInterval(
        () => {
            setTimeRecording((prev) => prev + 1);
        },
        audioRecorder.status === 'recording' ? 1000 : null,
    );

    useEffect(() => {
        if (audioRecorder.status !== 'recording') setTimeRecording(0);
    }, [audioRecorder.status]);

    function handleAudioStartClick() {
        audioRecorder.startRecording();
    }

    function handleStopRecordingClick() {
        submitAfterStopRef.current = false;
        audioRecorder.stopRecording();
    }

    function handleSubmitClick() {
        submitAfterStopRef.current = true;
        audioRecorder.stopRecording();
    }

    async function handleSubmit(blob: Blob) {
        const file = blobToFile(blob, `Recording (${format(new Date(), "dd-MM HH'h'mm")})${AUDIO_RECORD_EXT}`);
        if (!validateAudioFile(file)) {
            return;
        }

        setShowMedia(false);
        await handleProcessingContent(file);
    }

    function getDisplayTimeRecording(timeRecording: number) {
        const hours = Math.floor(timeRecording / 3600);
        const minutes = Math.floor((timeRecording % 60) / 60);
        const seconds = timeRecording % 60;
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0'),
        ].join(':');
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 text-foreground">
            {audioRecorder.status !== 'recording' && (
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            role="button"
                            tabIndex={0}
                            onClick={handleAudioStartClick}
                            className="
                                cursor-pointer
                                transition-all
                                hover:bg-accent hover:border-primary/50
                                focus:outline-none focus:ring-2 focus:ring-ring
                            "
                        >
                            <CardContent className="flex flex-col items-center justify-center gap-3 p-4 h-32 group">
                                <div className="p-2.5 rounded-full bg-secondary group-hover:bg-background transition-colors">
                                    <Mic className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="font-medium text-sm group-hover:text-primary">Record Audio</span>
                            </CardContent>
                        </Card>

                        <Card
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                toastHelper.showSuccessMessage('Feature coming soon');
                            }}
                            className="
                                cursor-pointer
                                transition-all
                                hover:bg-accent hover:border-primary/50
                                focus:outline-none focus:ring-2 focus:ring-ring
                            "
                        >
                            <CardContent className="flex flex-col items-center justify-center gap-3 p-4 h-32 group">
                                <div className="p-2.5 rounded-full bg-secondary group-hover:bg-background transition-colors">
                                    <Monitor className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="font-medium text-sm group-hover:text-primary">Browser Tab</span>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {audioRecorder.status === 'acquiring_media' ? <AcquiringMedia /> : null}

            {audioRecorder.status === 'recording' ? (
                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                        <span className="relative flex h-3.5 w-3.5">
                            <span className="absolute -inset-2 rounded-full bg-red-500/25 blur-md" />
                            <span className="absolute -inset-1.5 rounded-full bg-red-500/40 animate-ping" />
                            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-600 shadow-sm" />
                        </span>

                        <span className="text-sm font-medium text-red-600">Recording…</span>
                    </div>

                    <span className="text-xs text-muted-foreground">{getDisplayTimeRecording(timeRecording)}</span>

                    <div className="flex flex-row gap-4">
                        <Button variant="destructive" className="rounded-2xl" onClick={handleStopRecordingClick}>
                            Cancel
                        </Button>
                        <Button variant="default" className="rounded-2xl" onClick={handleSubmitClick}>
                            Submit
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

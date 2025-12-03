import { useMemo } from 'react';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';

export default function useAnkiSettings() {
    const { ankiSettings } = useTopicWorkspace();

    const currentAnkiSetting = useMemo(() => {
        if (!ankiSettings) return null;
        return ankiSettings.settings.find(
            (element) => element.ankiSettingId === ankiSettings.activeSettingId,
        ) as IAnkiSetting;
    }, [ankiSettings]);

    return {
        currentAnkiSetting,
    };
}

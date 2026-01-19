import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { UserRole } from '@/utils/constants/roles';
import { TabConfig } from '../types';
import { TOPIC_WORKSPACE_TABS } from '../layout/config.layout';
import { TAB_PERMISSIONS } from '../constants/tab.constant';

class TopicWorkspaceUtils {
    public getWorkspaceTabs(mode: ILearningMode, role: UserRole): TabConfig[] {
        return TOPIC_WORKSPACE_TABS.filter((tab) => {
            const permission = TAB_PERMISSIONS[tab.value];

            if (!permission) return true;

            if (permission.modes && !permission.modes.includes(mode)) {
                return false;
            }

            if (permission.roles && !permission.roles.includes(role)) {
                return false;
            }

            return true;
        });
    }
}

const topicWorkSpaceUtil = new TopicWorkspaceUtils();

export default topicWorkSpaceUtil;

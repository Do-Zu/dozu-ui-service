import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import TopicOverview from '../overview/TopicOverview';

export default function OverViewTab() {
    return <TopicOverview mode={MODE_ACCESS_PAGE_ROLE.personal} />;
}

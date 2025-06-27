import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';
import UserBehaviorTracking from './tracking';

export default function TrackingPage() {
    return (
        <UserTrackingProvider>
            <UserBehaviorTracking />
        </UserTrackingProvider>
    );
}

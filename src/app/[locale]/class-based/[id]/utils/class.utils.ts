import { ClassDashboardTab } from './class.constant';

class ClassUtils {
    public getTabLabel(tab: ClassDashboardTab): string {
        return tab
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
}

export default new ClassUtils();
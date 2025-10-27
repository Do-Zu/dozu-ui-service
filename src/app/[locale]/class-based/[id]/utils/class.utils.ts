import { ClassDashboardTab, classDashboardTabs } from './class.constant';

class ClassUtils {
    public getTabLabel(tab: ClassDashboardTab): string {
        return tab
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    public validateTabValue(tab?: string | undefined | null): ClassDashboardTab | undefined {
        return typeof tab === 'string' && classDashboardTabs.includes(tab as ClassDashboardTab)
            ? (tab as ClassDashboardTab)
            : undefined;
    }
}

export default new ClassUtils();
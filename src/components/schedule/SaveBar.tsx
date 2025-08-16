import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface SaveBarProps {
    isVisible: boolean;
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const SaveBar = ({ isVisible, onSave, onCancel, isLoading = false }: SaveBarProps) => {
    const t = useTranslations('schedule.saveBar');

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-200 p-4 flex items-center justify-between shadow-lg z-50">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">{t('message')}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                    {t('cancel')}
                </Button>
                <Button onClick={onSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : t('save')}
                </Button>
            </div>
        </div>
    );
};

export default SaveBar;

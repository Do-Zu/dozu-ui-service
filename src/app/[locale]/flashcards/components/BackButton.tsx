import { Button } from '@/components/ui/button';
import { ArrowBigLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

interface Props {
    router?: AppRouterInstance;
}

export default function BackButton(props: Props) {
    const tCommon = useTranslations('common');
    let { router } = props;
    if (!router) router = useRouter();

    function handleBackClick() {
        router?.back();
    }

    return (
        <Button onClick={handleBackClick} className="flex flex-row items-center">
            <ArrowBigLeft />
            <div className="text-base">{tCommon('actions.back')}</div>
        </Button>
    );
}

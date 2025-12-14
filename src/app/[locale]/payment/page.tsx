'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { usePayment } from './hooks/usePayment';
import { withAuth } from '@/hoc/withAuth';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/utils/constants/routes';
import { ArrowLeft, CheckCircle, XCircle, CreditCard, QrCode, ShieldCheck } from 'lucide-react';

import { UpdateSubscriptionRequest } from '@/services/payment';

import { PAYMENT_STATUS } from './utils/constants';
import LoadingPage from '@/app/loading';

import { USER_ROLES } from '@/utils/constants/roles';
import { isNilOrEmpty } from '@/utils';

//example return success payment: http://localhost:3000/en/payment?planId=2&code=00&id=b1ad5a123f774db88d0b5495710d40cb&cancel=false&status=PAID&orderCode=53501

const PaymentPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('payment');

    const [isRedirectFromPayment, setIsRedirectFromPayment] = useState(false);

    const {
        isUpdatingSubscription,
        plan,
        paymentData,
        isProcessingPayment,
        error,
        initializePayment,
        updateSubscription,
    } = usePayment();

    const planId = searchParams?.get('planId');
    const code = searchParams?.get('code');
    const paymentId = searchParams?.get('id') || searchParams?.get('paymentId') || searchParams?.get('paymentLinkId');
    const isCanceled = searchParams?.get('cancel') === 'true';
    const status = searchParams?.get('status');
    const orderCode = searchParams?.get('orderCode');

    const handlePaymentUpgradeSubscriptionSuccess = async ({
        planId,
        orderCode,
        paymentId,
    }: UpdateSubscriptionRequest) => {
        return await updateSubscription({
            planId,
            orderCode,
            paymentId,
        });
    };

    // Check if this is a redirect from payment
    useEffect(() => {
        if (!isNilOrEmpty(code) && paymentId && status && orderCode && planId) {
            setIsRedirectFromPayment(true);

            if (isCanceled || status === PAYMENT_STATUS.CANCELLED) {
                toast({
                    description: 'Your payment was cancelled!',
                });
            } else if (status === PAYMENT_STATUS.PAID) {
                handlePaymentUpgradeSubscriptionSuccess({
                    planId,
                    orderCode,
                    paymentId,
                });
            }
        }
    }, [code, paymentId, status, orderCode, isCanceled, planId]);

    const handleBackToPlans = () => {
        router.push(ROUTES.HOME);
    };

    if (isRedirectFromPayment && (isCanceled || status === PAYMENT_STATUS.CANCELLED)) {
        return (
            <div className="relative min-h-[calc(100dvh-4rem)]">
                {/* Background gradient + glow */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-50/70 via-background to-background dark:from-rose-950/30" />
                    <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-400/20 blur-3xl" />
                </div>
                <div className="container mx-auto px-4 py-10 max-w-2xl">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="overflow-hidden">
                            <CardHeader className="text-center py-10">
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10"
                                >
                                    <XCircle className="h-10 w-10 text-rose-500" />
                                </motion.div>
                                <CardTitle className="text-2xl">{t('cancel.title')}</CardTitle>
                                <p className="mt-2 text-sm text-muted-foreground">{t('cancel.subtitle')}</p>
                            </CardHeader>
                            <CardContent className="text-center space-y-4 pb-10">
                                <Badge variant="outline" className="border-rose-300/50 text-rose-700">
                                    {t('orderCode')}: {orderCode}
                                </Badge>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                    <Button onClick={handleBackToPlans} className="w-full">
                                        {t('backToPlans')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader className="text-center"></CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-muted-foreground">{error}</p>
                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleBackToPlans} className="flex-1">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('backToPlans')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (isRedirectFromPayment && status === PAYMENT_STATUS.PAID) {
        return (
            <div className="relative min-h-[calc(100dvh-4rem)]">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/30" />
                    <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
                </div>

                <div className="container mx-auto px-4 py-10 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <Card className="overflow-hidden">
                            <CardHeader className="text-center py-10">
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"
                                >
                                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                                </motion.div>
                                <CardTitle className="text-2xl">{t('success.title')}</CardTitle>
                                <p className="mt-2 text-sm text-muted-foreground">{t('success.subtitle')}</p>
                            </CardHeader>
                            <CardContent className="text-center space-y-4 pb-10">
                                <div className="flex items-center justify-center gap-2">
                                    <Badge variant="outline" className="border-emerald-300/50 text-emerald-700">
                                        {t('orderCode')}: {orderCode}
                                    </Badge>
                                </div>
                                <div className="mx-auto max-w-sm">
                                    <Button onClick={() => router.push(ROUTES.HOME)} className="w-full" asChild={false}>
                                        {t('success.cta')}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    {t('securedBy')}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isProcessingPayment || !planId) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-3xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4 mx-auto" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (isUpdatingSubscription) return <LoadingPage isOverlay={true} />;

    if (!plan) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-3xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">{t('redirectNotice')}</p>
                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button onClick={() => initializePayment(planId)} className="w-full" size="lg">
                                        {t('payOSGateWay')}
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-10 max-w-6xl">
                <div className="mb-6 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleBackToPlans} aria-label="Back">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">{t('title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('securedBy')}</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Summary (sticky on desktop) */}
                    <Card className="lg:col-span-1 h-max lg:sticky lg:top-6">
                        <CardHeader>
                            <CardTitle className="text-base">Plan summary</CardTitle>
                            <CardTitle className="text-base">{t('planSummary')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg leading-tight">{plan?.name}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{plan?.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">
                                            {paymentData?.currency === 'VND' ? '₫' : '$'}
                                            {paymentData?.amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">/{plan?.billingInterval}</div>
                                    </div>
                                </div>
                            </div>

                            {Array.isArray(plan?.features) && plan?.features.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">What’s included</h4>
                                    <ul className="space-y-2 text-sm">
                                        {plan?.features?.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                <span>
                                                    {feature.name}:{' '}
                                                    {feature.isUnlimited
                                                        ? 'Unlimited'
                                                        : feature?.numericValue || feature?.textValue}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Order code</span>
                                    <span>{t('orderCode')}:</span>
                                    <span>{t('status')}:</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={paymentData?.status === 'PENDING' ? 'secondary' : 'default'}>
                                        {paymentData?.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment methods */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">{t('paymentMethods')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={'link'} className="w-full">
                                <TabsList className="mb-4">
                                    {paymentData?.checkoutUrl && (
                                        <TabsTrigger value="link" className="gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            {t('payosLink')}
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger value="qr" className="gap-2">
                                        <QrCode className="h-4 w-4" />
                                        {t('scanQR')}
                                    </TabsTrigger>
                                </TabsList>

                                {/* PayOS link */}
                                {paymentData?.checkoutUrl && (
                                    <TabsContent value="link">
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">{t('redirectNotice')}</p>
                                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                <Button
                                                    onClick={() =>
                                                        window.open(paymentData.checkoutUrl as string, '_blank')
                                                    }
                                                    className="w-full"
                                                    size="lg"
                                                >
                                                    {t('payosLink')}
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </TabsContent>
                                )}

                                {/* QR method */}
                                <TabsContent value="qr">
                                    <div className="grid place-items-center gap-4">
                                        <AnimatePresence>
                                            <motion.div
                                                key={paymentData?.qrCode ? 'qr' : 'placeholder'}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                {paymentData?.qrCode ? (
                                                    <QRCodeComponent
                                                        value={String(paymentData.qrCode)}
                                                        size={256}
                                                        className="mx-auto"
                                                    />
                                                ) : (
                                                    <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                                                        <div className="text-center text-muted-foreground">
                                                            <QrCode className="mx-auto mb-2 h-10 w-10 opacity-60" />
                                                            <p className="text-xs">{t('qrUnavailable')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                        <p className="text-center text-xs text-muted-foreground">{t('qrHint')}</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default withAuth(PaymentPage, {
    requiredRole: USER_ROLES.USER,
    redirectTo: ROUTES.LANDING,
});

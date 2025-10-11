'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePayment } from './hooks/usePayment';
import { ROUTES } from '@/utils/constants/routes';
import { PAYMENT_STATUS } from './utils/constants';
import LoadingPage from '@/app/loading';

//example return success payment: http://localhost:3000/en/payment?planId=2&code=00&id=b1ad5a123f774db88d0b5495710d40cb&cancel=false&status=PAID&orderCode=53501

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // const t = useTranslations('payment');
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
    const paymentId = searchParams?.get('id');
    const isCanceled = searchParams?.get('cancel') === 'true';
    const status = searchParams?.get('status');
    const orderCode = searchParams?.get('orderCode');

    // Check if this is a redirect from payment
    useEffect(() => {
        if (code !== null && paymentId && status && orderCode) {
            setIsRedirectFromPayment(true);

            if (isCanceled || status === PAYMENT_STATUS.CANCELLED) {
                toast({
                    description: 'Your payment was cancelled!',
                });
            } else if (status === PAYMENT_STATUS.PAID) {
                // Update subscription after successful payment
                updateSubscription({
                    planId,
                    orderCode,
                    paymentId,
                });
            }
        }
    }, [code, paymentId, status, orderCode, isCanceled, planId, updateSubscription]);

    // Initialize payment for new plan selection
    useEffect(() => {
        if (planId && !isRedirectFromPayment && !paymentData) {
            initializePayment(planId);
        }
    }, [planId, isRedirectFromPayment, paymentData, initializePayment]);

    const handleRetry = () => {
        if (planId) {
            initializePayment(planId);
        }
    };

    const handleBackToPlans = () => {
        router.push(ROUTES.HOME);
    };

    if (isRedirectFromPayment && status === PAYMENT_STATUS.PAID) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">Your subscription has been activated successfully.</p>
                        <Badge variant="outline" className="text-green-600">
                            Order Code: {orderCode}
                        </Badge>
                        <div className="pt-4">
                            <Button onClick={() => router.push(ROUTES.HOME)} className="w-full">
                                Continue to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isRedirectFromPayment && (isCanceled || status === PAYMENT_STATUS.CANCELLED)) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader className="text-center">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-red-700">Payment Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            Your payment was cancelled. No charges were made to your account.
                        </p>
                        <Badge variant="outline" className="text-red-600">
                            Order Code: {orderCode}
                        </Badge>
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleRetry} variant="outline" className="flex-1">
                                Try Again
                            </Button>
                            <Button onClick={handleBackToPlans} className="flex-1">
                                Back to Plans
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader className="text-center">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-red-700">Payment Error</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">{error}</p>
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleRetry} variant="outline" className="flex-1">
                                Try Again
                            </Button>
                            <Button onClick={handleBackToPlans} className="flex-1">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Plans
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isProcessingPayment || !paymentData || !plan) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
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
            </div>
        );
    }

    if (isUpdatingSubscription) return <LoadingPage isOverlay={true} />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowLeft
                                className="w-5 h-5 cursor-pointer hover:text-primary"
                                onClick={handleBackToPlans}
                            />
                            Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-2xl font-bold text-primary">
                                {paymentData.currency === 'VND' ? '₫' : '$'}
                                {paymentData.amount.toLocaleString()}
                                <span className="text-sm font-normal text-muted-foreground">
                                    /{plan.billingInterval}
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Plan Features:</h4>
                            <ul className="space-y-1 text-sm">
                                {plan.features?.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        {feature.name}:{' '}
                                        {feature.isUnlimited ? 'Unlimited' : feature.numericValue || feature.textValue}
                                    </li>
                                )) || []}
                            </ul>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Order Code:</span>
                                <Badge variant="outline">{paymentData.orderCode}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge variant={paymentData.status === 'PENDING' ? 'secondary' : 'default'}>
                                    {paymentData.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Payment */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment methods</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            {/*      
                            TODO: Try to use QR code from paymentData.qrCode and find to get status payment through webhook                    
                            <div className="flex justify-center mb-4">
                                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                                    {paymentData.qrCode ? (
                                        <div className="w-64 h-64 flex items-center justify-center bg-white">
                                            <div className="text-xs break-all p-2 font-mono bg-gray-100 rounded">
                                                {paymentData.qrCode}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                                            <QrCode className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Payment Link Button */}
                            {paymentData.checkoutUrl && (
                                <Button
                                    onClick={() => window.open(paymentData.checkoutUrl, '_blank')}
                                    className="w-full mt-4"
                                    size="lg"
                                >
                                    Pay via PayOS
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

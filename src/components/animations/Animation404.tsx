'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Spinner } from '../ui/spinner';

const Animation404 = ({ size = 500 }: { size?: number }) => {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch('https://assets2.lottiefiles.com/packages/lf20_cr9slsdh.json')
            .then((res) => res.json())
            .then(setAnimationData)
            .catch((err) => {
                console.error('Không tải được animation:', err);
            });
    }, []);

    if (!animationData)
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <Spinner className="size-64" />
            </div>
        );

    return <Lottie animationData={animationData} loop style={{ width: size, height: size }} />;
};

export default Animation404;

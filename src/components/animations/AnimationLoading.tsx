'use client';

import Lottie from 'lottie-react';
import animationData from '../../../public/animation.json';

const AnimationLoading = ({ size = 90 }: { size?: number }) => {
    return <Lottie animationData={animationData} loop style={{ width: size, height: size }} />;
};

export default AnimationLoading;

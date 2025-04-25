"use client"

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import AnimationLoading from "@/components/animations/AnimationLoading";

const Animation404 = ({ size = 500 }: { size?: number }) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("https://assets2.lottiefiles.com/packages/lf20_cr9slsdh.json")
      .then(res => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return <AnimationLoading/>;

  return (
    <Lottie
      animationData={animationData}
      loop
      style={{ width: size, height: size }}
    />
  );
};

export default Animation404;

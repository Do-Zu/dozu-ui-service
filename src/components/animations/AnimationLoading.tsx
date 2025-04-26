"use client"

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

const AnimationLoading = ({ size = 90 }: { size?: number }) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("https://lottie.host/fe583da8-b1cd-4cc3-9b38-94c58a5c2d75/BzNIxHg2B4.json")
      .then(res => res.json())
      .then(setAnimationData);
  }, []);

  return (
    <Lottie
      animationData={animationData}
      loop
      style={{ width: size, height: size }}
    />
  );
};

export default AnimationLoading;

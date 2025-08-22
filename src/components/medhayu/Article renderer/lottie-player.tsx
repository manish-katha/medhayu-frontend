
'use client';

import React from 'react';
import Lottie from 'lottie-react';

interface LottiePlayerProps {
  animationData: any;
  className?: string;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationData, className }) => {
  return <Lottie animationData={animationData} className={className} />;
};

export default LottiePlayer;

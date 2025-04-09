import React from 'react';
import Image from 'next/image';

import "./NavIcons.css";

interface LogoIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function LogoIcon({ 
  width = 43, 
  height = 43, 
  className = 'logo'
}: LogoIconProps) {

  return (
    <Image 
      src="https://67f5728cb309f00008367e83--beamish-truffle-163ac0.netlify.app/assets/biblion-logo.svg"
      unoptimized={true}
      width={width}
      height={height}
      className={className}
      alt="Biblion logo"
    />
  )
}


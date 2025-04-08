import React from 'react';

import Image from 'next/image';

interface LogoIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function LogoIcon({ 
  width = 43, 
  height = 43, 
  className = 'float-left'
}: LogoIconProps) {

  return (
    <Image 
      src="https://cdn.karnovah.com/assets/biblion-logo.svg"
      unoptimized={true}
      width={width}
      height={height}
      className={className}
      alt="Biblion logo"
    />
  )
}


import React from 'react';

import Image from 'next/image';

interface LogoIconProps {
  width?: number;
  height?: number;
}

export default function LogoIcon({ width = 125, height = 125 }: LogoIconProps) {

  return (
    <Image 
      src="https://cdn.karnovah.com/assets/biblion-logo.svg"
      unoptimized={true}
      width={width}
      height={height}
      alt="Biblion logo"
    />
  )
}


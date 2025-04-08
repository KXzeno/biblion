import React from 'react';

import Image from 'next/image';

interface LogoIconProps {
  width?: number;
  height: number;
}

export default function LogoIcon({ width = 500, height = 500 }: LogoIconProps) {

  return (
    <Image 
      src="https://i.postimg.cc/XJM02gXh/biblion-logo.png" 
      width={width}
      height={height}
      alt="Biblion logo"
    />
  )
}


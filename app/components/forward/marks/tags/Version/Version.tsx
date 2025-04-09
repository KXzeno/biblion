import React from 'react';

import { WrenchAndDriverIcon } from '@/forward/icons/navIcons';
import "./Version.css";
import pkgJson from "@/../package.json";

export default function Version() {

  return (
    <div className='version-ctr'>
      <WrenchAndDriverIcon />
      <span className='version-num'>{`v${pkgJson.version}`}</span>
    </div>
  )
}


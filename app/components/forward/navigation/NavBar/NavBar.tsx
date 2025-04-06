import React from 'react';

import { ProfileIcon } from '@/forward/icons/navIcons';
import "./NavBar.css";

export default function NavBar() {

  return (
    <nav className='flex border-slate-700 border-1'>
      <ul className='grid grid-cols-[100%_100%_100%_100%] text-center text-sm'>
        <li className='content-center'>Yo</li>
        <li className='content-center'>Yo</li>
        <li className='content-center'>Yo</li>
        <li className='justify-self-end'><ProfileIcon svgClassName='scale-[0.8]' /></li>
      </ul>
    </nav>
  )
}


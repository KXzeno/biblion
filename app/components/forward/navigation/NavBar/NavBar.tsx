import React from 'react';

import { ProfileIcon, LogoIcon } from '@/forward/icons/navIcons';
import "./NavBar.css";

export default function NavBar() {

  return (
    <nav className='relative flex w-[37rem] justify-self-center'>
      <ul className='grid grid-cols-[30%_20%_20%_30%] text-center text-sm justify-self-center w-full'>
        <li className='inline-flex justify-self-start items-center'>
          <LogoIcon /><div className='font-luxurious-roman'>Biblion</div>
        </li>
        <li className='content-center'>Item 1</li>
        <li className='content-center'>Item 2</li>
        <li className='justify-self-end content-center'>
          <ProfileIcon svgClassName='scale-[0.8]' />
        </li>
      </ul>
    </nav>
  )
}


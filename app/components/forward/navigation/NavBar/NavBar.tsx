import React from 'react';
import Link from 'next/link';

import { ProfileIcon, LogoIcon } from '@/forward/icons/navIcons';
import "./NavBar.css";

export default function NavBar() {

  return (
    <nav className='navbar'>
      <ul className='nav-items'>
        <li className='logo-nav-item'>
          <LogoIcon /><span>Biblion</span>
        </li>
        <li dir="ltr" className='menu-nav-item'><Link href="#example">Example</Link></li>
        <li dir="rtl" className='menu-nav-item'><Link href="/me/lists">Lists</Link></li>
        <li className='profile-nav-item'>
          <ProfileIcon svgClassName='scale-[0.8]' />
        </li>
      </ul>
    </nav>
  )
}


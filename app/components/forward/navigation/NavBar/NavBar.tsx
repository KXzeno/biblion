import React from 'react';
import Link from 'next/link';

import { ProfileIcon, LogoIcon } from '@/forward/icons/navIcons';
import { Version } from '@/forward/marks';
import useBreakpoint from '@/components/hooks/useBreakpoint';
import MenuButton from './MenuButton';
import "./NavBar.css";

export default function NavBar() {
  const [crossed] = useBreakpoint({ breakPoint: 628 });

  return (
    <nav className='navbar'>
      <aside className='ver-tag'>
        <Version />
      </aside>
      <ul className='nav-items'>
        <li className='logo-nav-item'>
          <LogoIcon />
          <span>Biblion</span>
        </li>
        <li className='menu-nav-item-wrapper'>
          <div dir="ltr" className='menu-nav-item'><Link href="#example">Example</Link></div>
          <div dir="rtl" className='menu-nav-item'><Link href="/me/lists">Lists</Link></div>
        </li>
        {
          !crossed 
            ? <li className='profile-nav-item'><ProfileIcon svgClassName='scale-[0.8]' /></li>
            : <li className='menu-btn'><MenuButton /></li>
        }
      </ul>
    </nav>
  )
}


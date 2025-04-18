import React from 'react';

import MenuButtonEventHandlers from './MenuButtonEventHandlers';
import type { CurryProps } from './MenuButton.types';

export default function MenuButton() {
  const [menuToggled, setMenuToggled] = React.useState<boolean>(false);

  function openMenu(e: React.SyntheticEvent) {
    const children = (e.target as HTMLButtonElement).children;
    const toggled = !menuToggled;
    setMenuToggled(() => toggled);

    if (!(children.length >= 3)) {
      throw new Error("Menu dashes failed to construct");
    }

    const bars = {
      topBar: children.item(0),
      midBar: children.item(1),
      botBar: children.item(2),
    } as CurryProps;

    const cb = MenuButtonEventHandlers.HandleComposite(bars, toggled);
    requestAnimationFrame(cb);
  }

  return (
    <button 
      className='dash-wrapper'
      onClick={openMenu}
    >
      <div id='menu-dash-1' className='menu-dash' />
      <div id='menu-dash-2' className='menu-dash' />
      <div id='menu-dash-3' className='menu-dash' />
    </button>
  )
}


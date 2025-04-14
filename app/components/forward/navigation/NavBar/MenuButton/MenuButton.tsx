import React from 'react';

export default function MenuButton() {
  const [menuToggled, setMenuToggled] = React.useState<boolean>(false);

  let start: DOMHighResTimeStamp;

  interface CurryProps {
    topBar: HTMLDivElement,
    midBar: HTMLDivElement,
    botBar: HTMLDivElement,
  }

  function handleAnim({ topBar, midBar, botBar }: CurryProps) {
    topBar.style.transformOrigin = "left";
    botBar.style.transformOrigin = "right";
    return function step(timestamp: DOMHighResTimeStamp) {
      if (start === undefined) {
        start = timestamp;
      }

      const elapsed = timestamp - start;

      const shift = Math.min(0.03 * elapsed, 7.00);

      if (shift <= 3.8) {
        // 3.84
        topBar.style.transform = `translateY(${shift}px)`;
        botBar.style.transform = `translateY(-${shift}px)`;

        requestAnimationFrame(step);
      } else if (shift <= 5.4) {
        console.log(shift);
        // 5.42
        const isInvis = midBar.classList.contains("invisible");
        if (!isInvis)  {
          midBar.classList.add("invisible");
        }
        topBar.style.transform = `translateY(3.84px) rotate(-${37.9746835 * (shift - 3.84)}deg)`;
        botBar.style.transform = `translateY(-3.84px) rotate(${37.9746835 * (shift - 3.84)}deg)`;
        requestAnimationFrame(step);
      } else if (shift < 7) {

        topBar.style.transform = `translateY(3.84px) rotate(-47deg) translate(${shift - 5.42}px, ${shift - 5.42}px)`;
        botBar.style.transform = `translateY(-3.84px) rotate(47deg) translate(-${shift - 5.42}px, ${shift - 5.42}px)`;
        requestAnimationFrame(step);
      } 
    }
  }
  function openMenu(e: React.SyntheticEvent) {
    const children = (e.target as HTMLButtonElement).children;
    const toggled = !menuToggled;
    setMenuToggled(() => toggled);

    if (toggled) {
      if (!(children.length >= 3)) {
        throw new Error("Menu dashes failed to construct");
      }
      const topBar = children.item(0) as HTMLDivElement;
      const midBar = children.item(1) as HTMLDivElement;
      const botBar = children.item(2) as HTMLDivElement;

      const cb = handleAnim({ topBar, midBar, botBar });
      requestAnimationFrame(cb);
    }
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


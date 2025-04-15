import React from 'react';

export default function MenuButton() {
  const [menuToggled, setMenuToggled] = React.useState<boolean>(false);

  let start: DOMHighResTimeStamp | null;

  interface CurryProps {
    topBar: HTMLDivElement,
    midBar: HTMLDivElement,
    botBar: HTMLDivElement,
  }

  function handleAnimProgression({ topBar, midBar, botBar }: CurryProps, shift: number) {
    if (shift <= 3.8) {
      // 3.84
      topBar.style.transform = `translateY(${shift}px)`;
      botBar.style.transform = `translateY(-${shift}px)`;
      return;
    } else if (shift <= 5.4) {
      // 5.42
      const isInvis = midBar.classList.contains("invisible");
      if (!isInvis)  {
        midBar.classList.add("invisible");
      }
      topBar.style.transform = `translateY(3.84px) rotate(-${37.9746835 * (shift - 3.84)}deg)`;
      botBar.style.transform = `translateY(-3.84px) rotate(${37.9746835 * (shift - 3.84)}deg)`;
      return;
    } else if (shift < 7) {

      topBar.style.transform = `translateY(3.84px) rotate(-47deg) translate(${shift - 5.42}px, ${shift - 5.42}px)`;
      botBar.style.transform = `translateY(-3.84px) rotate(47deg) translate(-${shift - 5.42}px, ${shift - 5.42}px)`;
      return;
    } 
  }

  function handleAnimReversal({ topBar, midBar, botBar }: CurryProps, shift: number) {
    if (shift <= 1.6) {
      topBar.style.transform = `translateY(3.84px) rotate(-47deg) translate(${-(shift - 1.6)}px, ${-(shift - 1.6)}px)`;
      botBar.style.transform = `translateY(-3.84px) rotate(47deg) translate(-${-(shift - 1.6)}px, ${-(shift - 1.6)}px)`;
      return;
    } else if (shift <= 3.2) {
      topBar.style.transform = `translateY(3.84px) rotate(-${60 - (37.9746835 * (shift - 1.6))}deg)`;
      botBar.style.transform = `translateY(-3.84px) rotate(${60 - (37.9746835 * (shift - 1.6))}deg)`;
      return;
    } else if (shift < 7) {
      const isInvis = midBar.classList.contains("invisible");
      if (isInvis)  {
        midBar.classList.remove("invisible");
      }
      topBar.style.transform = `translateY(3.84px) translateY(-${shift - 3.2}px)`;
      botBar.style.transform = `translateY(-3.84px) translateY(${shift - 3.2}px)`;
      return;
    } else {
    }
  }

  function handleAnim({ topBar, midBar, botBar }: CurryProps, progress: boolean) {
    start = null;
    console.log(menuToggled);
    topBar.style.transformOrigin = "left";
    botBar.style.transformOrigin = "right";
    return function step(timestamp: DOMHighResTimeStamp) {
      if (start === null) {
        start = timestamp;
      }

      const elapsed = timestamp - start;

      const shift = Math.min(0.03 * elapsed, 7.00);

      if (progress) {
        handleAnimProgression({ topBar, midBar, botBar }, shift);
        requestAnimationFrame(step);
      } else {
        handleAnimReversal({ topBar, midBar, botBar }, shift);
        requestAnimationFrame(step);
      }

    }
  }

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

    const cb = handleAnim(bars, toggled);
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


import type { CurryProps } from './MenuButton.types';

export default class MenuButtonEventHandlers {
  public static AnimProgression = this.handleAnimProgression;
  public static AnimReversal = this.handleAnimReversal;
  public static HandleComposite = this.handleAnim;

  private constructor() {}

  private static handleAnimProgression({ topBar, midBar, botBar }: CurryProps, shift: number): void {
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

  private static handleAnimReversal({ topBar, midBar, botBar }: CurryProps, shift: number): void {
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

  private static handleAnim({ topBar, midBar, botBar }: CurryProps, progress: boolean): (ts: DOMHighResTimeStamp) => void {
    let start: DOMHighResTimeStamp | null;
    start = null;

    topBar.style.transformOrigin = "left";
    botBar.style.transformOrigin = "right";

    const handleProgression = this.handleAnimProgression;
    const handleReversal = this.handleAnimReversal;

    return function step(timestamp: DOMHighResTimeStamp): void {
      if (start === null) {
        start = timestamp;
      }

      const elapsed = timestamp - start;

      const shift = Math.min(0.03 * elapsed, 7.00);

      if (progress) {
        handleProgression({ topBar, midBar, botBar }, shift);
        requestAnimationFrame(step);
      } else {
        handleReversal({ topBar, midBar, botBar }, shift);
        requestAnimationFrame(step);
      }
    }
  }
}


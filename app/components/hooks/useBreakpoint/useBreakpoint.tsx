import React from 'react';

import { BreakpointHookProps } from './useBreakpoint.types';

export default function useBreakpoint({ 
  breakPoint, 
}: BreakpointHookProps = { 
  breakPoint: 768,
}): [boolean, number] {
  const [x, setX] = React.useState<number>(0);
  const [crossed, setCrossed] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleResizeUpdates = () => {
      const width = window.innerWidth;
      setX(() => width);
      if (width <= breakPoint) {
        setCrossed(() => true);
      } else if (!crossed) {
        setCrossed(() => false)
      }
    };

    window.addEventListener("resize", handleResizeUpdates);

    return () => {
      window.removeEventListener("resize", handleResizeUpdates);
    }
  }, []);

  return [crossed, x];
}

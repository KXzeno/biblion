import React from "react"
interface ProfileIconProps {
  bgClassName?: string;
  svgClassName?: string;
  bustClassName?: string;
  torsoClassName?: string;
}

export default function ProfileIcon(
  { 
    bgClassName,
    svgClassName,
    bustClassName,
    torsoClassName,
  }: ProfileIconProps) {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className={`${bgClassName || 'fill-slate-300'} ${svgClassName}`}
        width="32" 
        height="32"
      >
        <circle 
          cx="16"
          cy="16"
          r="15"
          stroke="#333"
          strokeWidth="1"
        />
        <circle 
          cx="16"
          cy="12"
          r="5"
          className={bustClassName || 'fill-slate-800'}
        />
        <path
          d="M16 17 C 12 17, 7 20, 7 25 L 25 25 C 25 20, 20 17, 16 17"
          className={torsoClassName || bustClassName || 'fill-slate-800'}
        />
      </svg>
    );
  }

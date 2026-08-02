import type { ReactNode } from 'react';

type IconCrossfadeProps = {
  readonly showFirst: boolean;
  readonly first: ReactNode;
  readonly second: ReactNode;
  readonly className?: string;
};

const TRANSITION = 'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]';

// Both icon states stay mounted and cross-fade via opacity/scale/blur (no
// motion library installed), per the project's /ui icon-transition recipe.
// `first` stays in normal flow and defines the wrapper's box size.
export const IconCrossfade = ({ showFirst, first, second, className = '' }: IconCrossfadeProps) => (
  <span className={`relative inline-flex ${className}`}>
    <span
      className={`${TRANSITION} ${showFirst ? 'scale-100 opacity-100 blur-none' : 'scale-[.25] opacity-0 blur-[4px]'}`}
    >
      {first}
    </span>
    <span
      className={`absolute inset-0 flex items-center justify-center ${TRANSITION} ${showFirst ? 'scale-[.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-none'}`}
    >
      {second}
    </span>
  </span>
);

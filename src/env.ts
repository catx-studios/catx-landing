import { MAX_DPR } from './config';

export const isMobile = (): boolean =>
  window.matchMedia('(max-width:640px)').matches;

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const currentDPR = (): number =>
  Math.min(window.devicePixelRatio || 1, MAX_DPR);

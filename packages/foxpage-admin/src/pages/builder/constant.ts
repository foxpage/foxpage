import { CSSProperties } from 'react';

const SYSTEM_PAGE = 'system.page';
const ROOT_CONTAINER = 'root-container';

const viewModelWidth = {
  PC: '100%',
  MOBILE: '375px',
  PAD: '762px',
};

const viewModelHeight = {
  PC: '100%',
  MOBILE: '667px',
  PAD: '1024px',
};

export { ROOT_CONTAINER, SYSTEM_PAGE, viewModelHeight,viewModelWidth };

export const iconStyle: CSSProperties = {
  transform: 'scale(0.8)',
};

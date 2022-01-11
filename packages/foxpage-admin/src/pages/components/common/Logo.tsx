import React from 'react';

import { getImageLinkByEnv } from '@/utils/index';

const Logo = () => {
  return (
    <img
      key="foxpage-logo-img"
      height={28}
      width={140}
      src={getImageLinkByEnv('/images/header-logo.png')}
      style={{ margin: '0 auto 12px', display: 'block' }}
      alt="foxpage logo"
    />
  );
};

export default Logo;

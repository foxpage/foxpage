import React from 'react';

import { getImageUrlByEnv } from '@/utils/image-url';

const Logo = () => {
  return (
    <img
      key="foxpage-logo-img"
      height={28}
      src={getImageUrlByEnv('/images/header-logo.png')}
      style={{ margin: '0 auto 12px', display: 'block' }}
      alt="foxpage logo"
    />
  );
};

export default Logo;

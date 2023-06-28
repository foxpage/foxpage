import React from 'react';

import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';

export const PushIcon = () => (
  <PushpinOutlined className="text-inherit hover:cursor-pointer hover:text-fox" />
);

export const PushFillIcon = () => (
  <PushpinFilled className="hover:cursor-pointer text-fox" style={{ color: '#188fff' }} />
);

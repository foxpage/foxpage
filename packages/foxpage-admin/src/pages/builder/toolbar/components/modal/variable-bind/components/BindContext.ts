import React from 'react';

import { ComponentProps } from '@/types/index';

const context = React.createContext<{
  value: string | ComponentProps;
  setValue: (value: string | ComponentProps) => void;
}>({
  value: '',
  setValue: () => '',
});
export default context;

import React from 'react';

import { ComponentProps } from '@/types/index';

const context = React.createContext<{
  value: string | ComponentProps;
  setValue: (value: string) => void;
}>({
  value: '',
  setValue: (_value: string) => {},
});
export default context;

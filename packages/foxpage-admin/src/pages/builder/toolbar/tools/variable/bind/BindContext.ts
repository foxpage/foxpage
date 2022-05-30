import React from 'react';

import { ComponentPropsType } from '@/types/builder';

const context = React.createContext<{
  value: string | ComponentPropsType;
  setValue: (value: string) => void;
}>({
  value: '',
  setValue: (_value: string) => {},
});
export default context;

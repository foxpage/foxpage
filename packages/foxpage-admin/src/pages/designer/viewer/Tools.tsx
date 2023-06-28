import React from 'react';

import { CalibrationLine, SelectedLabel } from './label';

interface IProps {}

const Tools = (_props: IProps) => {
  return (
    <>
      <SelectedLabel />
      <CalibrationLine />
    </>
  );
};

export default Tools;

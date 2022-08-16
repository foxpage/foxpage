import React from 'react';

import { IProps, ViewEntry } from '../viewport';

const HeadManager = (props: Partial<IProps>) => {
  const { renderStructure = [] } = props;
  return (
    <ViewEntry renderStructure={renderStructure} decorated={false} />
  );
};

export default HeadManager;

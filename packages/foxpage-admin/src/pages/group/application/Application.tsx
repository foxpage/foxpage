import React, { useContext } from 'react';

import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';

import List from './list';

const Application = () => {
  const { locale } = useContext(GlobalContext);
  const { application } = locale.business;
  return (
    <FoxpageDetailContent
      breadcrumb={
        <FoxpageBreadcrumb
          breadCrumb={[{ name: application.myApplication, link: '/#/workspace/application' }]}
        />
      }>
      <List />
    </FoxpageDetailContent>
  );
};

export default Application;

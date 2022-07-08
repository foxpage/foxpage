import React, { useContext } from 'react';

import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import ComingSoon from '@/pages/sys/ComingSoon';

const Files = () => {
  const { locale } = useContext(GlobalContext);
  const { application, global } = locale.business;

  return (
    <FoxpageDetailContent
      breadcrumb={
        <FoxpageBreadcrumb
          breadCrumb={[
            { name: application.applicationList, link: '/#/workspace/application' },
            { name: global.dashboard },
          ]}
        />
      }>
      <ComingSoon />
    </FoxpageDetailContent>
  );
};

export default Files;

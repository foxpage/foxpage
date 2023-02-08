import React, { useContext } from 'react';

import { ComingSoon, Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { GlobalContext } from '@/pages/system';

const DynamicsComingSoon: React.FC<{}> = () => {
  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  return (
    <Content>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: global.dynamics,
              },
            ]}
          />
        }>
        <ComingSoon />
      </FoxPageContent>
    </Content>
  );
};

export default DynamicsComingSoon;

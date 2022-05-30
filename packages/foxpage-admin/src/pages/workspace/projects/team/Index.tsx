import React, { useContext } from 'react';

import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import ComingSoon from '@/pages/sys/ComingSoon';

const TeamProject = () => {
  const { locale } = useContext(GlobalContext);
  const { project } = locale.business;

  return (
    <FoxpageDetailContent
      breadcrumb={
        <FoxpageBreadcrumb breadCrumb={[{ name: project.teamProject, link: '/#/workspace/team-project' }]} />
      }>
      <ComingSoon />
    </FoxpageDetailContent>
  );
};

export default TeamProject;

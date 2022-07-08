import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import { ApplicationUrlParams } from '@/types/application';

import Content from './content';
import Detail from './detail';
import List from './list';

function Projects() {
  const { applicationId, organizationId } = useParams<ApplicationUrlParams>();

  return (
    <Switch>
      <Route
        path={`/organization/${organizationId}/application/${applicationId}/detail/projects/list`}
        component={List}
      />
      <Route
        path={`/organization/${organizationId}/application/${applicationId}/detail/projects/detail`}
        component={Detail}
      />
      <Route
        path={`/organization/${organizationId}/application/${applicationId}/detail/projects/content`}
        component={Content}
      />

      <Redirect
        from="/*"
        to={`/organization/${organizationId}/application/${applicationId}/detail/projects/list`}
      />
    </Switch>
  );
}

export default Projects;

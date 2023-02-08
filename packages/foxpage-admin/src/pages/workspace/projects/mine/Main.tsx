import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import PersonalProjects from './personal';
import SharedProjects from './shared';
import StarredProjects from './starred';

function MyProjects() {
  return (
    <Switch>
      <Route path="/workspace/projects/personal" component={PersonalProjects} />
      <Route path="/workspace/projects/shared" component={SharedProjects} />
      <Route path="/workspace/projects/starred" component={StarredProjects} />

      <Redirect from="/*" to="/workspace/projects/personal" />
    </Switch>
  );
}

export default MyProjects;

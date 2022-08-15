import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Dynamics from './personal';

function WorkspaceDynamics() {
  return (
    <Switch>
      <Route path="/workspace/dynamics" component={Dynamics} />

      <Redirect from="/*" to="/workspace/dynamics" />
    </Switch>
  );
}

export default WorkspaceDynamics;

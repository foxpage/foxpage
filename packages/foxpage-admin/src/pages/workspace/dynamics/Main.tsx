import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Dynamic from './dynamic/Index';

function Dynamics() {
  return (
    <Switch>
      <Route path="/workspace/dynamic" component={Dynamic} />

      <Redirect from="/*" to="/workspace/dynamic" />
    </Switch>
  );
}

export default Dynamics;

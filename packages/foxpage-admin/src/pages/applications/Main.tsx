import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Detail } from './detail';
import { List } from './list';

function Applications() {
  return (
    <Switch>
      <Route path="/applications/list" component={List} />
      <Route path="/applications/:applicationId" component={Detail} />

      <Redirect from="/*" to="/applications/list" />
    </Switch>
  );
}

export default Applications;

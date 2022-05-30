import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import ApplicationList from './application';

const Group = () => {
  return (
    <Switch>
      <Route path="/organization/:organizationId/application/list" component={ApplicationList} />

      <Redirect from="/organization" to="/organization/:organizationId/application/list" />
    </Switch>
  );
};

export default Group;

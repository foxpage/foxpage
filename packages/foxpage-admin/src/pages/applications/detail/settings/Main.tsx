import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import AppSettings from './application';
import BuilderSettings from './builder';

const Setting = () => {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/settings/application" component={AppSettings} />
      <Route path="/applications/:applicationId/settings/builder" component={BuilderSettings} />

      <Redirect from="/*" to={`/applications/${applicationId}/settings/application`} />
    </Switch>
  );
};

export default Setting;

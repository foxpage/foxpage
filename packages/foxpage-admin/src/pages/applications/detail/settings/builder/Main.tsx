import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import ComponentSetting from './packages';
import PageSetting from './pages';
import TemplateSetting from './templates';

const BuilderSetting = () => {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/settings/builder/component" component={ComponentSetting} />
      <Route path="/applications/:applicationId/settings/builder/page" component={PageSetting} />
      <Route path="/applications/:applicationId/settings/builder/template" component={TemplateSetting} />

      <Redirect from="/*" to={`/applications/${applicationId}/settings/builder/component`} />
    </Switch>
  );
};

export default BuilderSetting;

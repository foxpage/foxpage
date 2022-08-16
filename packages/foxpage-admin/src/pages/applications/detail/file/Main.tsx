import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Conditions from './conditions';
import Functions from './functions';
import Pages from './pages';
import Templates from './templates';
import Variables from './variables';

function File() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/file/conditions" component={Conditions} />
      <Route path="/applications/:applicationId/file/functions" component={Functions} />
      <Route path="/applications/:applicationId/file/pages" component={Pages} />
      <Route path="/applications/:applicationId/file/templates" component={Templates} />
      <Route path="/applications/:applicationId/file/variables" component={Variables} />

      <Redirect from="/*" to={`/applications/${applicationId}/file/pages`} />
    </Switch>
  );
}

export default File;

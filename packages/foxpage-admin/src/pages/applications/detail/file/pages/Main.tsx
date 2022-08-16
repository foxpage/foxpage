import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Content from './content';
import File from './file';

function Pages() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/file/pages/content" component={Content} />
      <Route path="/applications/:applicationId/file/pages/list" component={File} />

      <Redirect from="/*" to={`/applications/${applicationId}/file/pages/list`} />
    </Switch>
  );
}

export default Pages;

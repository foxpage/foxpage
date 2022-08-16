import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Content from './content';
import File from './file';

function Templates() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/file/templates/content" component={Content} />
      <Route path="/applications/:applicationId/file/templates/list" component={File} />

      <Redirect from="/*" to={`/applications/${applicationId}/file/templates/list`} />
    </Switch>
  );
}

export default Templates;

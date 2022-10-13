import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Detail from './detail';
import Groups from './groups';

function Resources() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/package/resources/list" component={Groups} />
      <Route path="/applications/:applicationId/package/resources/detail/:resourceRoot" component={Detail} />

      <Redirect from="/*" to={`/applications/${applicationId}/package/resources/list`} />
    </Switch>
  );
}

export default Resources;

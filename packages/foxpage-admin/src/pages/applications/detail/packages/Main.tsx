import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Detail from './detail';
import Fast from './fast';
import List from './list';

function Packages() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/packages/content" component={Fast} />
      <Route path="/applications/:applicationId/packages/detail" component={Detail} />
      <Route path="/applications/:applicationId/packages/list" component={List} />

      <Redirect from="/*" to={`/applications/${applicationId}/packages/list`} />
    </Switch>
  );
}

export default Packages;

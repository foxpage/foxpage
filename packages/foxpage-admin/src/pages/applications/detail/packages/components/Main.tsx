import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Detail from '../common/detail';
import Fast from '../common/fast';
import List from '../common/list';

function Components() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/package/components/content" component={Fast} />
      <Route path="/applications/:applicationId/package/components/detail" component={Detail} />
      <Route path="/applications/:applicationId/package/components/list" component={List} />

      <Redirect from="/*" to={`/applications/${applicationId}/package/components/list`} />
    </Switch>
  );
}

export default Components;

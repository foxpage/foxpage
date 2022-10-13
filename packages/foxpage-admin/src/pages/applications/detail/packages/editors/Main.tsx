import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Detail from '../common/detail';
import Fast from '../common/fast';
import List from '../common/list';

function Editors() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/package/editors/content" component={Fast} />
      <Route path="/applications/:applicationId/package/editors/detail" component={Detail} />
      <Route path="/applications/:applicationId/package/editors/list" component={List} />

      <Redirect from="/*" to={`/applications/${applicationId}/package/editors/list`} />
    </Switch>
  );
}

export default Editors;

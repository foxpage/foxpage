import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Components from './components';
import Editors from './editors';
import Resources from './resources';

function Packages() {
  const { applicationId } = useParams<{ applicationId: string }>();

  return (
    <Switch>
      <Route path="/applications/:applicationId/package/components" component={Components} />
      <Route path="/applications/:applicationId/package/editors" component={Editors} />
      <Route path="/applications/:applicationId/package/resources" component={Resources} />

      <Redirect from="/*" to={`/applications/${applicationId}/package/components`} />
    </Switch>
  );
}

export default Packages;

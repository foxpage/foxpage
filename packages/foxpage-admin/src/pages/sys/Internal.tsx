import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Applications from '../applications';
import { FoxpageLayout } from '../common';
import Group from '../group';
import Application from '../group/application/detail';
import Projects from '../projects';
import Store from '../store';
import Teams from '../teams';
import WorkSpace from '../workspace';

const Index = () => {
  return (
    <FoxpageLayout>
      <Switch>
        <Route path="/workspace" component={WorkSpace} />
        <Route path="/projects" component={Projects} />
        <Route path="/applications" component={Applications} />
        <Route path="/teams" component={Teams} />
        <Route path="/store" component={Store} />
        <Route
          path="/organization/:organizationId/application/:applicationId/detail"
          component={Application}
        />
        <Route path="/organization/:organizationId/" component={Group} />
        <Redirect exact from="/*" to="/workspace" />
      </Switch>
    </FoxpageLayout>
  );
};

export default Index;

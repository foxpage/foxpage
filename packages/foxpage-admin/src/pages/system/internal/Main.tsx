import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Applications from '@/pages/applications';
import Data from '@/pages/data';
import Projects from '@/pages/projects';
import Store from '@/pages/store';
import Teams from '@/pages/teams';
import Workspace from '@/pages/workspace';

import { FoxPageLayout } from './components';

const Internal = () => {
  return (
    <FoxPageLayout>
      <Switch>
        <Route path="/applications" component={Applications} />
        <Route path="/data" component={Data} />
        <Route path="/projects" component={Projects} />
        <Route path="/store" component={Store} />
        <Route path="/teams" component={Teams} />
        <Route path="/workspace" component={Workspace} />

        <Redirect from="/*" to="/workspace" />
      </Switch>
    </FoxPageLayout>
  );
};

export default Internal;

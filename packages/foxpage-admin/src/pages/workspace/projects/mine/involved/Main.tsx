import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Content from './content';
import File from './file';
import Folder from './folder';

function InvolvedProjects() {
  return (
    <Switch>
      <Route path="/workspace/projects/involved/list" component={Folder} />
      <Route path="/workspace/projects/involved/detail" component={File} />
      <Route path="/workspace/projects/involved/content" component={Content} />

      <Redirect from="/*" to="/workspace/projects/involved/list" />
    </Switch>
  );
}

export default InvolvedProjects;

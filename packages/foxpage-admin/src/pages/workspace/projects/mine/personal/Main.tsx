import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Content from './content';
import File from './file';
import Folder from './folder';

function PersonalProjects() {
  return (
    <Switch>
      <Route path="/workspace/projects/personal/list" component={Folder} />
      <Route path="/workspace/projects/personal/detail" component={File} />
      <Route path="/workspace/projects/personal/content" component={Content} />

      <Redirect from="/*" to="/workspace/projects/personal/list" />
    </Switch>
  );
}

export default PersonalProjects;

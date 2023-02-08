import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Content from './content';
import File from './file';
import Folder from './folder';
import Search from './search';

function SharedProjects() {
  return (
    <Switch>
      <Route path="/workspace/projects/shared/list" component={Folder} />
      <Route path="/workspace/projects/shared/detail" component={File} />
      <Route path="/workspace/projects/shared/content" component={Content} />
      <Route path="/workspace/projects/shared/search" component={Search} />

      <Redirect from="/*" to="/workspace/projects/shared/list" />
    </Switch>
  );
}

export default SharedProjects;

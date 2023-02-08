import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Content from './content';
import File from './file';
import Folder from './folder';
import Search from './search';

function Projects() {
  return (
    <Switch>
      <Route path="/projects/list" component={Folder} />
      <Route path="/projects/detail" component={File} />
      <Route path="/projects/content" component={Content} />
      <Route path="/projects/search" component={Search} />

      <Redirect from="/*" to="/projects/list" />
    </Switch>
  );
}

export default Projects;

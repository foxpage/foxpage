import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Content from './content';
import Detail from './detail';
import List from './list';

function Projects() {
  return (
    <Switch>
      <Route path="/workspace/project/list" component={List} />
      <Route path="/workspace/project/detail" component={Detail} />
      <Route path="/workspace/project/content" component={Content} />

      <Redirect from="/*" to="/workspace/project/list" />
    </Switch>
  );
}

export default Projects;

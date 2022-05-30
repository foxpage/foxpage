import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Content from './content';
import Detail from './detail';
import List from './list';

function Projects() {
  return (
    <Switch>
      <Route path="/projects/list" component={List} />
      <Route path="/projects/detail" component={Detail} />
      <Route path="/projects/content" component={Content} />

      <Redirect from="/*" to="/projects/list" />
    </Switch>
  );
}

export default Projects;

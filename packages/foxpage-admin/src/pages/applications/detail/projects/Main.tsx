import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Content from './content';
import File from './file';
import Folder from './folder';
import Search from './search';

function Projects() {
  const { applicationId } = useParams<{ applicationId: string }>();

  const contentLocation: any = {
    pathname: '/applications/:applicationId/projects/content',
    search: `?applicationId=${applicationId}`,
  };

  const fileLocation: any = {
    pathname: '/applications/:applicationId/projects/detail',
    search: `?applicationId=${applicationId}`,
  };

  return (
    <Switch>
      <Route
        path="/applications/:applicationId/projects/content"
        location={contentLocation}
        component={Content}
      />
      <Route path="/applications/:applicationId/projects/detail" location={fileLocation} component={File} />
      <Route path="/applications/:applicationId/projects/list" component={Folder} />
      <Route path="/applications/:applicationId/projects/search" component={Search} />

      <Redirect from="/*" to={`/applications/${applicationId}/projects/list`} />
    </Switch>
  );
}

export default Projects;

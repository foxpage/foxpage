import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import Content from './content';
import File from './file';
import Folder from './folder';

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

  const folderLocation: any = {
    pathname: '/applications/:applicationId/projects/list',
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
      <Route path="/applications/:applicationId/projects/list" location={folderLocation} component={Folder} />

      <Redirect
        from="/*"
        to={`/applications/${applicationId}/projects/list?applicationId=${applicationId}`}
      />
    </Switch>
  );
}

export default Projects;

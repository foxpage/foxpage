import React from 'react';
import { Route, Switch } from 'react-router-dom';

// import Workspace from './workspace';
import styled from 'styled-components';

import Internal from './sys/Internal';
import PrivateRoute from './sys/PrivateRoute';
import Builder from './builder';
import Login from './login';
import Register from './register';
// import Demo from './demo';
import Viewer from './viewer';

const Root = styled.div`
  height: 100%;
`;

const Index = () => {
  return (
    <React.Fragment>
      <Root>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/viewer" component={Viewer} />
          <Route path="/application/:applicationId/folder/:folderId/builder" component={Builder} />
          <Route path="/application/:applicationId/folder/:folderId/file/:fileId/builder" component={Builder} />
          <Route
            path="/application/:applicationId/folder/:folderId/file/:fileId/content/:contentId/builder"
            component={Builder}
          />
          <PrivateRoute path="/" component={Internal} />
        </Switch>
      </Root>
    </React.Fragment>
  );
};

export default Index;

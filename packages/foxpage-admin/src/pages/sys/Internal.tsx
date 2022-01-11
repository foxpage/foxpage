import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Layout } from 'antd';

import { FoxpageLayout } from '../common';
import Group from '../group';
import Application from '../group/application/detail';
import Store from '../store';

const Index = () => {
  return (
    <FoxpageLayout>
      <Layout style={{ height: '100%' }}>
        <Switch>
          {/* <Route path="/workspace" component={Workspace} /> */}
          <Route path="/organization/:organizationId/application/:applicationId/detail" component={Application} />
          <Route path="/organization" component={Group} />
          <Route path="/store" component={Store} />
          <Redirect exact from="/" to="/organization" />
        </Switch>
      </Layout>
    </FoxpageLayout>
  );
};

export default Index;

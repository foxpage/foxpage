import React from 'react';

import { Layout } from 'antd';
import styled from 'styled-components';

import Builder from './Builder';
import Header from './Header';

const { Content } = Layout;

const StyledContent = styled(Content)`
  height: calc(100% - 64px);
  background: rgb(255, 255, 255);
`;

const Index = () => {
  return (
    <Layout style={{ height: '100%', overflow: 'hidden' }}>
      <Header />
      <StyledContent>
        <Builder />
      </StyledContent>
    </Layout>
  );
};

export default Index;

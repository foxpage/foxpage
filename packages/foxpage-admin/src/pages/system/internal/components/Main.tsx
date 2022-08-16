import React, { ReactElement } from 'react';

import { Layout } from 'antd';
import styled from 'styled-components';

import FoxPageHeader from './components/Header';

const { Content } = Layout;

const FoxPageContent = styled(Content)`
  padding: 0;
  margin-top: 48px;
  overflow: auto;
`;

interface LayoutProps {
  children?: ReactElement;
}

const FoxPageLayout: React.FC<LayoutProps> = (props) => {
  const { children } = props;

  return (
    <Layout style={{ height: '100%' }}>
      <FoxPageHeader />
      <FoxPageContent>{children}</FoxPageContent>
    </Layout>
  );
};

export default FoxPageLayout;

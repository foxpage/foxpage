import React, { ReactElement } from 'react';

import { Layout } from 'antd';
import styled from 'styled-components';

import { Notice } from '@/pages/notice';

import FoxPageHeader from './components/Header';

const { Content } = Layout;
const TOP = 48;

const FoxPageContent = styled(Content)`
  padding: 0;
  margin-top: ${TOP}px;
  overflow: auto;
`;

interface LayoutProps {
  children?: ReactElement;
}

const FoxPageLayout: React.FC<LayoutProps> = (props) => {
  const { children } = props;

  return (
    <Layout style={{ height: '100%', flex: 1 }}>
      <FoxPageHeader />
      <Notice top={TOP} />
      <FoxPageContent>{children}</FoxPageContent>
    </Layout>
  );
};

export default FoxPageLayout;

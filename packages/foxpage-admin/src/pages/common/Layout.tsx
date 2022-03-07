import React, { ReactChild } from 'react';

import { Layout } from 'antd';
import styled from 'styled-components';

import { FoxpageHeader } from './';

const { Content } = Layout;

const FoxpageContent = styled(Content)`
  padding: 0;
  margin-top: 48px;
  overflow: auto;
`;

interface LayoutProps {
  children?: ReactChild;
}
const FoxpageLayout: React.FC<LayoutProps> = (props) => {
  const { children } = props;
  return (
    <Layout style={{ height: '100%' }}>
      <FoxpageHeader />
      <FoxpageContent>{children}</FoxpageContent>
    </Layout>
  );
};

export default FoxpageLayout;

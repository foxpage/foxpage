import React, { ReactChild } from 'react';

import { Layout } from 'antd';

import { FoxpageHeader } from './';

const { Content } = Layout;

interface LayoutProps {
  children?: ReactChild;
}
const List: React.FC<LayoutProps> = props => {
  const { children } = props;
  return (
    <Layout style={{ height: '100%' }}>
      <FoxpageHeader />
      <Content style={{ padding: 0 }}>{children}</Content>
    </Layout>
  );
};

export default List;

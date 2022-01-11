import React from 'react';

import { Layout } from 'antd';

import ComingSoon from '@/pages/sys/ComingSoon';

const { Content } = Layout;

const Recycle = () => {
  return (
    <Layout style={{ height: '100%' }}>
      <Content style={{ padding: '24px', minHeight: 280 }}>
        <ComingSoon />
      </Content>
    </Layout>
  );
};

export default Recycle;

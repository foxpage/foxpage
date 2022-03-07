import React, { ReactChild } from 'react';

import { Layout } from 'antd';
import styled from 'styled-components';

const { Content } = Layout;

const Container = styled.div`
  background-color: #fff;
  padding: 24px;
  width: 100%;
  height: 100%;
  display: inline-table;
`;

interface LayoutProps {
  children?: ReactChild;
}
const FoxpageDetailContent: React.FC<LayoutProps> = (props) => {
  const { children } = props;
  return (
    <Content style={{ padding: '24px', minHeight: 280, height: '100%', overflow: 'scroll' }}>
      <Container>{children}</Container>
    </Content>
  );
};

export default FoxpageDetailContent;

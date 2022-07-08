import React, { ReactChild } from 'react';

import styled from 'styled-components';

const Content = styled.div`
  padding: ${(props: { withoutBreadcrumb?: boolean }) =>
    props.withoutBreadcrumb ? '0 24px 24px 24px' : '24px'};
  height: 100%;
  overflow: hidden auto;
  width: 100%;
`;

const Breadcrumb = styled.div`
  padding: 12px 0;
`;

const Container = styled.div`
  background-color: #fff;
  padding: 24px;
  width: 100%;
  height: 100%;
  display: inline-table;
`;

interface LayoutProps {
  breadcrumb?: ReactChild;
  children?: ReactChild;
}

const FoxpageDetailContent: React.FC<LayoutProps> = (props) => {
  const { breadcrumb, children } = props;
  return (
    <Content withoutBreadcrumb={!!breadcrumb}>
      {breadcrumb && <Breadcrumb>{breadcrumb}</Breadcrumb>}
      <Container>{children}</Container>
    </Content>
  );
};

export default FoxpageDetailContent;

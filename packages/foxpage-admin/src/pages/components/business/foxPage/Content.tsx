import React, { CSSProperties, ReactNode } from 'react';

import styled from 'styled-components';

const Content = styled.div`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: ${(props: { withoutBreadcrumb?: boolean }) => (props.withoutBreadcrumb ? '0 24px' : '24px')};
  overflow: hidden auto;
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 24px;
  }
`;

const Breadcrumb = styled.div`
  padding: 12px 0;
`;

const Container = styled.div`
  display: inline-table;
  width: 100%;
  height: ${(props: { withoutBreadcrumb?: boolean }) =>
    props.withoutBreadcrumb ? 'calc(100% - 48px - 24px)' : '100%'};
  padding: 24px;
  background-color: #fff;
`;

interface LayoutProps {
  breadcrumb?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

const FoxPageContent: React.FC<LayoutProps> = (props) => {
  const { breadcrumb, children, style } = props;

  return (
    <Content withoutBreadcrumb={!!breadcrumb} style={style}>
      {breadcrumb && <Breadcrumb>{breadcrumb}</Breadcrumb>}
      <Container withoutBreadcrumb={!!breadcrumb}>{children}</Container>
    </Content>
  );
};

export default FoxPageContent;

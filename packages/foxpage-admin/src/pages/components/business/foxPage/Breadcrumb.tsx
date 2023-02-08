import React from 'react';

import { Breadcrumb } from 'antd';
import styled from 'styled-components';

import getLinkByEnv from '@/utils/linked-env';

const Container = styled.div`
  ol {
    padding-left: 0;
  }
`;

const FoxPageBreadcrumb = (props: any) => {
  const { breadCrumb } = props;

  return (
    <Container>
      <Breadcrumb>
        {breadCrumb.map((item: any, index: number) => {
          return item.link ? (
            <Breadcrumb.Item key={`${item.name}-${index}`} href={getLinkByEnv(item.link)}>
              {item.name}
            </Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={`${item.name}-${index}`}>{item.name}</Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </Container>
  );
};

export default FoxPageBreadcrumb;

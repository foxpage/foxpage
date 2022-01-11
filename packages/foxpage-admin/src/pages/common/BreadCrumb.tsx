import React from 'react';

import { Breadcrumb } from 'antd';
import styled from 'styled-components';

import getLinkByEnv from '../../utils/get-link-by-env';

const Container = styled.div``;

const FoxpageBreadcrumb = (props: any) => {
  const { breadCrumb } = props;
  return (
    <Container>
      <Breadcrumb>
        {breadCrumb.map((item: any) => {
          return item.link ? (
            <Breadcrumb.Item key={item.name} href={getLinkByEnv(item.link)}>
              {item.name}
            </Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={item.name}>{item.name}</Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </Container>
  );
};

export default FoxpageBreadcrumb;

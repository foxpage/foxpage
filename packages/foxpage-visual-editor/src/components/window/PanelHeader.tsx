import React, { ReactNode } from 'react';

import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 32px;
  line-height: 32px;
  padding: 0 8px;
  border-bottom: 1px solid #f2f2f2;
`;

const Title = styled.div`
  /* font-weight: bold; */
  flex-grow: 1;
`;

interface IProps {
  title?: string;
  extr?: ReactNode;
}

const PanelHeader = (props: IProps) => {
  const { title, extr } = props;

  return (
    <Container>
      <Title>{title}</Title>
      {extr}
    </Container>
  );
};

export default PanelHeader;

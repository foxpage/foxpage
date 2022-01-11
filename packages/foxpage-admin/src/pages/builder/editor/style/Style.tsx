import React from 'react';

import { Collapse as AntdCollapse } from 'antd';
import styled from 'styled-components';

import Background from './Background';
import Border from './Border';
import Box from './Box';
import Display from './Display';
import Font from './Font';
import { StyleType } from './index.d';
import Position from './Position';
import Shadow from './Shadow';

const Collapse = styled(AntdCollapse)`
  .ant-collapse-content-box {
    background: #fafafa !important;
    padding-right: 0;
  }
  padding: 0 12px !important;
`;
const Container = styled.div`
  padding-bottom: 12px;
`;

const Title = styled.div`
  border-left: 2px solid #7885d7;
  padding-left: 8px;
  margin: 8px 0;
  color: #656565ad;
`;

const Style: React.FC<StyleType> = props => {
  const { onChange, onApplyState } = props;
  return (
    <Collapse
      bordered={false}
      defaultActiveKey={['display', 'box', 'font', 'position', 'background', 'border', 'shadow']}
    >
      <Container>
        <Title>Display</Title>
        <Display {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>
      <Container>
        <Title>Box</Title>
        <Box {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>
      <Container>
        <Title>Font</Title>
        <Font {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>

      <Container>
        <Title>Position</Title>
        <Position {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>
      <Container>
        <Title>Background</Title>
        <Background {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>
      <Container>
        <Title>Border</Title>
        <Border {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>
      <Container>
        <Title>Shadow</Title>
        <Shadow {...props} onChange={onChange} onApplyState={onApplyState} />
      </Container>
      {/* <Panel header="Flex" key="flex">
        <Flex {...props} onChange={onChange} />
      </Panel> */}
    </Collapse>
  );
};
export default Style;

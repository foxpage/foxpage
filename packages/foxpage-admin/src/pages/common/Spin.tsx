import React from 'react';

import { Spin as AntSpin } from 'antd';
import styled from 'styled-components';

const Root = styled.div`
  padding: 32px 32px 60px 32px;
  text-align: center;
`;

function Spin(props: any) {
  return (
    <Root>
      <AntSpin {...props} />
    </Root>
  );
}

export default Spin;

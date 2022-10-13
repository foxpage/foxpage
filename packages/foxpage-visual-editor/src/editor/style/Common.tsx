import { CSSProperties } from 'react';

import { Col as AntdCol, Radio, Row as AntdRow } from 'antd';
import styled from 'styled-components';

const Col = styled(AntdCol)`
  display: flex;
  align-items: center;
`;
const Row = styled(AntdRow)`
  margin-top: 8px;
  font-size: 12px;
`;

const Label = styled.span`
  width: 100%;
  display: inline-block;
  text-align: left;
  margin-top: 4px;
`;

const RadioButton = styled(Radio.Button)`
  padding: 0;
  text-align: center;
`;

const colorPickerStyle: CSSProperties = {
  height: 16,
  lineHeight: 16,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
};

export { Col, colorPickerStyle, Label, RadioButton, Row };

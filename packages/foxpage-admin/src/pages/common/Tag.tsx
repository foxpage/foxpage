import { Tag as AntdTag } from 'antd';
import styled from 'styled-components';

const Tag = styled(AntdTag)`
  padding: 0 4px !important;
  line-height: normal !important;
`;

const LocaleTag = styled(Tag)`
  cursor: default !important;
  margin: 2px !important;
  width: 50px;
  text-align: center;
  font-weight: 400;
`;
export { LocaleTag,Tag };

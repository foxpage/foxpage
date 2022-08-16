import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import styled from 'styled-components';

export const Area = styled.div`
  border-bottom: 1px solid #d6dadc;
  user-select: none;
`;

export const Row = styled.div`
  line-height: 32px;
  padding: 0 24px;
  font-size: 12px;
  position: relative;
  color: ${(props: { disable?: boolean }) => (props.disable ? '#999' : 'inherit')};
  :hover {
    cursor: ${(props: { disable?: boolean }) => (props.disable ? 'not-allowed' : 'pointer')};
    color: ${(props: { disable?: boolean }) => (props.disable ? '#999' : '#1890ff')};
    background-color: ${(props: { disable?: boolean }) => (props.disable ? 'inherit' : '#f2f2f2')};
  }
`;

export const PushIcon = styled(PushpinOutlined)`
  color: #939393;
  :hover {
    cursor: pointer;
    color: #000000bf;
  }
`;

export const PushFillIcon = styled(PushpinFilled)`
  color: #ffaf36;
  :hover {
    cursor: pointer;
    color: #f90;
  }
`;
